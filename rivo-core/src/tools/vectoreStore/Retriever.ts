import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { getSupabaseVectorStore } from "../../data/connectors/SupabaseVectorStore";
import DocumentProcessingParams from "../../types/DocumentProcessingParams";

const retrieveSchema = z.object({ query: z.string() });
let vectorStore: SupabaseVectorStore;

// Configuration globale qui peut être mise à jour
let processingConfig: DocumentProcessingParams;

// Fonction pour mettre à jour la configuration
export const updateRetrieverConfig = (config: DocumentProcessingParams) => {
  processingConfig = config;
  // Réinitialiser le vectorStore pour prendre en compte les nouvelles configurations
  vectorStore = getSupabaseVectorStore("documents", "match_documents", processingConfig);
};

const initVectorStore = async () => {
  if (!vectorStore && processingConfig) {
    vectorStore = getSupabaseVectorStore("documents", "match_documents", processingConfig);
  }
};

const retrieveTool = tool(
  async ({ query }) => {
    try {
      if (!vectorStore) await initVectorStore();
      console.log("retrieving for query", query);
      const retrievedDocs = await vectorStore.similaritySearch(query.toString(), 7);

      const serialized = retrievedDocs
        .map(
          (doc) => `Source: ${doc.metadata.url}\nContent: ${doc.pageContent}`
        )
        .join("\n");

      console.log("🚀 ~ serialized:", serialized)
      return [serialized, retrievedDocs];
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error);
      throw error;
    }
  },
  {
    name: "retrieve_information_and_context",
    description: "Retrieve information and context related to a query.",
    schema: retrieveSchema,
    responseFormat: "content_and_artifact",
  }
);

export default retrieveTool;