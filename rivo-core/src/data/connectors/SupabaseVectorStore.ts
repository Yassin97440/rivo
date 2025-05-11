import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { getEmbeddings } from "../../processing";
import DocumentProcessingParams from "../../types/DocumentProcessingParams";
import { CustomEmbeddings } from "../../processing/embedding/CustomEmbeddings";




export function getSupabaseVectorStore(tableName: string, queryName: string, credentials: DocumentProcessingParams): SupabaseVectorStore {
  // const embeddings = getEmbeddings(credentials);
  const embeddings = new CustomEmbeddings();
  return new SupabaseVectorStore(embeddings, {
    client: createClient(
      credentials.supabaseUrl || process.env.SUPABASE_URL || "",
      credentials.supabaseApiKey || process.env.SUPABASE_API_KEY || ""
    ),
    tableName: tableName,
    queryName: queryName,
  });
}