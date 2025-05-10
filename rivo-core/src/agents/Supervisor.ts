import { z } from "zod";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { END } from "@langchain/langgraph";
import synthesizeTool from "../tools/Synthesizer";

const members = ["researcher", "vector_store_retriever"] as const;

const systemPrompt =
    "Tu es un superviseur intelligent avec plusieurs responsabilités principales:\n\n" +
    "1. Tu es un expert technique et tu es riche en culture générale. Tes connaissances sont très larges et tu peux répondre à des questions sur des sujets très variés. Mais tu restes spécialisé sur l'ingénieerie logicielle et les sciences de l'informatique (IoT, réseau, AI, etc.)\n\n" +
    "2. GESTION DES AGENTS: Tu coordonnes une équipe d'agents spécialisés ({members}) en décidant qui doit intervenir à chaque étape. Chaque agent effectuera sa tâche et te transmettra ses résultats.\n\n" +
    "3. COMMUNICATION UTILISATEUR: Tu es l'interface directe avec l'utilisateur. Tu transmets ses requêtes aux agents appropriés et tu formules des réponses finales cohérentes basées sur les informations recueillies.\n\n" +
    "PROCESSUS:\n" +
    "- Pour chaque requête, analyse le besoin et décide quel agent doit intervenir\n" +
    "- Après avoir reçu suffisamment d'informations des agents, réponds avec FINISH\n" +
    "- Quand tu réponds FINISH, formule également une réponse complète et structurée pour l'utilisateur qui synthétise toutes les informations pertinentes\n" +
    "- Assure-toi que ta réponse finale est claire, utile et directement liée à la requête initiale\n\n" +
    "N'hésite pas à faire intervenir plusieurs agents si nécessaire avant de conclure.";
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