import { pipeline } from '@huggingface/transformers';
import { Embeddings, EmbeddingsInterface } from '@langchain/core/embeddings';

export class CustomEmbeddings implements EmbeddingsInterface {

    async pipeline() {
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        return extractor;
    }

    async embedQuery(text: string): Promise<number[]> {
        const pipe = await this.pipeline();
        const result = await pipe(text);

        // Extraire seulement le premier vecteur d'embedding (384 dimensions)
        const embeddingDim = result.ort_tensor.dims[2]; // 384
        const tensorData = Array.from(result.data) as number[];
        const embedding = tensorData.slice(0, embeddingDim);

        console.log("Dimension du vecteur de requête:", embedding.length);
        return embedding;
    }

    async embedDocuments(texts: string[]): Promise<number[][]> {
        const pipe = await this.pipeline();
        const result = await pipe(texts);

        // Extraire les dimensions correctes du tenseur
        const embeddingDim = result.ort_tensor.dims[2]; // Dimension du vecteur (384)
        console.log("🚀 ~ CustomEmbeddings ~ embedDocuments ~ embeddingDim dimension du vecteur:", embeddingDim)
        const embeddings: number[][] = [];

        // Le modèle all-MiniLM-L6-v2 produit des vecteurs de 384 dimensions
        // On restructure les données pour avoir un tableau de vecteurs correctement dimensionnés
        const tensorData = Array.from(result.data) as number[];

        for (let i = 0; i < texts.length; i++) {
            // Calculer les indices de début et fin pour chaque vecteur
            const start = i * embeddingDim;
            const end = start + embeddingDim;

            // Extraire le vecteur pour le texte actuel
            const embedding = tensorData.slice(start, end);

            // Vérifier que le vecteur a la bonne taille
            if (embedding.length !== embeddingDim) {
                console.warn(`Vecteur de taille incorrecte: ${embedding.length} au lieu de ${embeddingDim}`);
            }

            embeddings.push(embedding);
        }

        return embeddings;
    }
}
