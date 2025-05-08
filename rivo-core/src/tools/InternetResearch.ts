import { tool } from "@langchain/core/tools";
import { TavilySearch } from "@langchain/tavily";


export const tavilyTool = new TavilySearch();
