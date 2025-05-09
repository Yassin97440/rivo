import { START, StateGraph } from "@langchain/langgraph";
import { members, supervisorChain } from "../agents/Supervisor";
import AgentState from "../config/AgentState";
import { researcherNode } from "../agents/ResearcherAgent";
import { vectorRetrieverNode } from "../agents/VectorRetriever";

async function createSupervisorGraph() {
    // 1. Create the graph
    const workflow = new StateGraph(AgentState)
        // 2. Add the nodes; these will do the work
        .addNode("researcher", researcherNode)
        .addNode("vector_retriever", vectorRetrieverNode)
        .addNode("supervisor", await supervisorChain);
    // 3. Define the edges. We will define both regular and conditional ones
    // After a worker completes, report to supervisor
    members.forEach((member) => {
        workflow.addEdge(member, "supervisor");
    });

    workflow.addConditionalEdges(
        "supervisor",
        (x: typeof AgentState.State) => x.next,
    );

    workflow.addEdge(START, "supervisor");

    return workflow.compile();
}

const supervisorGraph = createSupervisorGraph();
export { supervisorGraph };