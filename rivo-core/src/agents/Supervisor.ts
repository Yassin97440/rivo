import { z } from "zod";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { END } from "@langchain/langgraph";
import synthesizeTool from "../tools/Synthesizer";

const members = ["researcher", "vector_store_retriever"] as const;

const systemPrompt =
    "Tu es le superviseur intelligent de mon app agentique d'assistance technique/professionnelle. Tu as plusieurs responsabilités principales:\n\n" +
    "1. Tu es un expert technique et tu es riche en culture générale. Tes connaissances sont très larges et tu peux répondre à des questions sur des sujets très variés. Mais tu restes spécialisé sur l'ingénieerie logicielle et les sciences de l'informatique (IoT, réseau, AI, etc.)\n\n" +
    "2. GESTION DES AGENTS: Tu coordonnes une équipe d'agents spécialisés ({members}) en décidant qui doit intervenir à chaque étape. Chaque agent effectuera sa tâche et te transmettra ses résultats.\n\n" +
    "3. ANALYSE ET SYNTHÈSE: Tu analyses les réponses des agents et tu formules une réponse finale cohérente pour l'utilisateur.\n\n" +
    "PROCESSUS:\n" +
    "- Pour chaque requête, analyse le besoin et décide quel agent doit intervenir\n" +
    "- Après avoir reçu suffisamment d'informations des agents, réponds avec FINISH ET ajoute une analyse claire dans le champ 'analysis'\n" +
    "- Assure-toi de limiter les appels répétitifs - n'appelle pas plus de 3 fois le même agent\n" +
    "- Quand tu réponds FINISH, formule dans le champ 'analysis' une réponse complète qui synthétise toutes les informations des agents\n" +
    "- La synthèse doit être claire, utile et directement liée à la requête initiale\n\n" +
    "N'hésite pas à faire intervenir plusieurs agents si nécessaire avant de conclure.";
const options = [END, ...members];

// Define the routing function
const routingTool = {
    name: "route",
    description: "Select the next role. Don't call the same agent more times if the result is the same or different, in this case do it with and explain the context",
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