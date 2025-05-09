import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tavilyTool } from "../tools/InternetResearch";
import { MistralClient } from "../LLM/MistralAPIClient";
import { RunnableConfig } from "@langchain/core/runnables";
import AgentState from "../config/AgentState";


const researcherAgent = createReactAgent({
    llm: MistralClient.getInstance().client,
    tools: [tavilyTool],
    stateModifier: new SystemMessage("You are a web researcher. You may use the Tavily search engine to search the web for" +
        " important information, so the Chart Generator in your team can make useful plots.")
})

const researcherNode = async (
    state: typeof AgentState.State,
    config?: RunnableConfig,
) => {
    const result = await researcherAgent.invoke(state, config);
    const lastMessage = result.messages[result.messages.length - 1];
    console.log("🚀 ~ lastMessage:", lastMessage)
    return {
        messages: [
            new HumanMessage({ content: lastMessage.content.toString(), name: "Researcher" }),
        ],
    };
};

export { researcherNode };