import { SystemMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tavilyTool } from "../tools/InternetResearch";
import { MistralClient } from "../LLM/MistralAPIClient";


const researcherAgent = createReactAgent({
    llm: MistralClient.getInstance().client,
    tools: [tavilyTool],
    stateModifier: new SystemMessage("You are a web researcher. You may use the Tavily search engine to search the web for" +
        " important information, so the Chart Generator in your team can make useful plots.")
})

export default researcherAgent;