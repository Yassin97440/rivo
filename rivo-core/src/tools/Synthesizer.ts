import { ChatPromptTemplate } from "@langchain/core/prompts";
import { tool } from "@langchain/core/tools";
import { ChatMistralAI } from "@langchain/mistralai";


const synthesizeTool = tool(async ({ query }: { query: any }) => {
    const llm = new ChatMistralAI({
        modelName: "mistral-large-latest",
        temperature: 0.7,
    });

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "Tu es un assistant spécialisé dans la synthèse d'informations. Ton rôle est de créer une réponse cohérente, concise et précise à partir des informations fournies."],
        ["human", "Voici la requête originale: {original_query}\n\nVoici les informations collectées par différents agents:\n{collected_information}\n\nFormule une réponse complète et structurée qui répond directement à la requête de l'utilisateur en utilisant ces informations."],
    ]);

    const chain = prompt.pipe(llm);
    const response = await chain.invoke({
        original_query: query,
        collected_information: query.collected_information,
    });

    return response.content;
}, {
    name: "synthesize",
    description: "Synthesize the given text into a concise and informative summary.",
    responseFormat: "content_and_artifact",
});

export default synthesizeTool;
