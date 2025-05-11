import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MistralClient } from "../LLM/MistralAPIClient";
import retrieveTool from "../tools/vectoreStore/Retriever";
import AgentState from "../config/AgentState";
import { RunnableConfig } from "@langchain/core/runnables";

const vectorRetrieverAgent = createReactAgent({
    llm: MistralClient.getInstance().client,
    tools: [retrieveTool],
    stateModifier: new SystemMessage("You are an expert on vector and context retrieval. The vectore store have many information about personal projects, skills, and experiences of the user. Try to understand the intention of the user for rewrite the query. And use the vector retriever to retrieve information from the vector store when you think it's necessary.")
})
const vectorRetrieverNode = async (
    state: typeof AgentState.State,
    config?: RunnableConfig,
) => {
    const result = await vectorRetrieverAgent.invoke(state, config);
    const lastMessage = result.messages[result.messages.length - 1];
    return {
        messages: [
            new HumanMessage({ content: lastMessage.content, name: "Vector_Store_Retriever" }),
        ],
    };
};


export { vectorRetrieverNode };