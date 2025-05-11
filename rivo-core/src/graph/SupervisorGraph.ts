import { END, START, StateGraph } from "@langchain/langgraph";
import { members, supervisorChain } from "../agents/Supervisor";
import AgentState from "../config/AgentState";
import { researcherNode } from "../agents/ResearcherAgent";
import { vectorRetrieverNode } from "../agents/VectorRetriever";
import { AIMessage, BaseMessage } from "@langchain/core/messages";

async function createSupervisorGraph() {
    // 1. Create the graph
    const workflow = new StateGraph(AgentState)
        // 2. Add the nodes; these will do the work
        .addNode("researcher", researcherNode)
        .addNode("vector_store_retriever", vectorRetrieverNode)
        .addNode("supervisor", await supervisorChain);
    // 3. Define the edges. We will define both regular and conditional ones
    // After a worker completes, report to supervisor
    members.forEach((member) => {
        workflow.addEdge(member, "supervisor");
    });

    workflow.addConditionalEdges(
        "supervisor",
        (x: typeof AgentState.State) => {
            // Si c'est END et qu'il y a une analyse, l'ajouter comme dernier message
            if (x.next === END && x.analysis) {
                const assistantMessage = new AIMessage(x.analysis, { name: "supervisor" });
                x.messages.push(assistantMessage);
            }
            return x.next;
        },
    );

    workflow.addEdge(START, "supervisor");
    workflow.addEdge("supervisor", END);

    return workflow.compile();
}

const supervisorGraph = createSupervisorGraph();
export { supervisorGraph };