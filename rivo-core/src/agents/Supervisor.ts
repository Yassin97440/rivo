import { z } from "zod";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { END } from "@langchain/langgraph/dist/constants";

export class Supervisor {
    private static instance: Supervisor;
    private members = ["researcher", "vector_retriever"] as const;
    private options = [END, ...this.members];
    private llm: ChatMistralAI;
    private supervisorChain: any;

    private systemPrompt =
        "You are a supervisor tasked with managing a conversation between the" +
        " following workers: {members}. Given the following user request," +
        " respond with the worker to act next. Each worker will perform a" +
        " task and respond with their results and status. When finished," +
        " respond with FINISH.";

    private routingTool = {
        name: "route",
        description: "Select the next role.",
        schema: z.object({
            next: z.enum([END, ...this.members]),
        }),
    }

    private constructor() {
        this.llm = new ChatMistralAI({
            modelName: "mistral-large-latest",
            temperature: 0,
        });
        this.initSupervisorChain();
    }

    public static getInstance(): Supervisor {
        if (!Supervisor.instance) {
            Supervisor.instance = new Supervisor();
        }
        return Supervisor.instance;
    }

    private async initSupervisorChain() {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", this.systemPrompt],
            new MessagesPlaceholder("messages"),
            [
                "human",
                "Given the conversation above, who should act next?" +
                " Or should we FINISH? Select one of: {options}",
            ],
        ]);

        const formattedPrompt = await prompt.partial({
            options: this.options.join(", "),
            members: this.members.join(", "),
        });

        this.supervisorChain = formattedPrompt
            .pipe(this.llm.bindTools(
                [this.routingTool],
                {
                    tool_choice: "any",
                },
            ))
            .pipe((x) => (x.tool_calls?.[0]?.args));
    }

    public getSupervisorChain() {
        return this.supervisorChain;
    }

    public getMembers() {
        return this.members;
    }
}

export const supervisorChain = Supervisor.getInstance().getSupervisorChain();
export const members = Supervisor.getInstance().getMembers();