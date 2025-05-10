import { z } from "zod";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { END } from "@langchain/langgraph";
import synthesizeTool from "../tools/Synthesizer";

const members = ["researcher", "vector_store_retriever"] as const;

const systemPrompt =
    "You are a supervisor tasked with managing a conversation between the" +
    " following workers: {members}. Given the following user request," +
    " respond with the worker to act next. Each worker will perform a" +
    " task and respond with their results and status. When finished," +
    " respond with FINISH.";
const options = [END, ...members];

// Define the routing function
const routingTool = {
    name: "route",
    description: "Select the next role.",
    schema: z.object({
        next: z.enum([END, ...members]),
    }),
}

const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    new MessagesPlaceholder("messages"),
    [
        "human",
        "Given the conversation above, who should act next?" +
        " Or should we FINISH? Select one of: {options}",
    ],
]);

async function createSupervisorChain(model: string | "mistral-large-latest", temperature: number | 0) {
    const formattedPrompt = await prompt.partial({
        options: options.join(", "),
        members: members.join(", "),
    });

    const llm = new ChatMistralAI({
        modelName: model,
        temperature: temperature,
    });

    return formattedPrompt
        .pipe(llm.bindTools(
            [routingTool, synthesizeTool],
            {
                tool_choice: "any",
            },
        ))
        // select the first one
        .pipe((x: any) => (x.tool_calls[0].args));
}

const supervisorChain = createSupervisorChain("mistral-large-latest", 0);
export { supervisorChain, members };