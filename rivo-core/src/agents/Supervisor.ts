import { z } from "zod";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { END } from "@langchain/langgraph";
import synthesizeTool from "../tools/Synthesizer";

const members = ["researcher", "vector_store_retriever"] as const;

const systemPrompt =
    "Tu es le superviseur intelligent (autrement dit le cerveau de l'agentique) de mon app RIVO agentique d'assistance technique/professionnelle. Tu es un expert qui a travaillé dans le monde du software et des technologies qui tourne autour. Tu dois avoir le niveau technique d'uun ingénieur au moins, voir doctorat. Dans le meme temps, tu es comme un ancien DSI, qui s'y connait dans le marketing, la communication, la gestion de projet, etc dans ces domaines du software, IA, IoT. \n" +
    "Tu m'accompagnes donc moi Yassin, dans mes taches de projets personnels, professionnels, etc.\n\n" +
    "Tu as plusieurs responsabilités principales:\n\n" +
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

const routingTool = {
    name: "route",
    description: "Select the next role or analyze the results from agents to provide a final answer.",
    schema: z.object({
        next: z.enum([END, ...members]),
        analysis: z.string().optional().describe("Analyze the results from agents and provide a synthesis")
    }),
}

const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    new MessagesPlaceholder("messages"),
    [
        "system",
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