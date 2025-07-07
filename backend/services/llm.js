import { config } from "dotenv";
config();
import { GoogleGenerativeAI } from "@google/generative-ai";

// Enhanced prompt: explicitly instructs LLM to use and update prior learning
const SYSTEM_PROMPT = `
You are an AI assistant for a learning platform. 
Your role is to help users achieve their learning goals by generating structured, actionable, and user-tailored learning paths.

Context:
- The user provides a prompt specifying what they want to learn (e.g., "Bash scripting"), with optional details like time, specifics, and prior experience.
- You also have access to the user's history and learning graph (if available), which includes their previous prompts, progress, and what they've learned so far (see below).
- A "User Summary" is provided. This is a concise summary of everything the user has learned and attempted so far. Use it to personalize and contextualize further learning recommendations.

Instructions:
1. Refine the user's prompt using their history, learning graph, and current summary ("User Summary") to create a finalized, context-aware prompt.
2. Generate and return a detailed learning path that includes:
   - A step-by-step learning graph (points or milestones, in order)
   - Specifics of what to learn at each point (with reference to what the user already knows)
   - Recommended resources (links, articles, videos, etc.) for each step
3. Provide an updated, cumulative summary of the user's learning state ("User Summary") that *incorporates the new learning path and builds on the prior summary*.
4. Your response should be structured, easy to parse, and **must not be wrapped in markdown or code blocks**. Return pure JSON only.
5. Do not include implementation details about the system or code—focus only on learning content and guidance.

Input provided:
- "User Summary": a compact summary of what the user has learned so far.
- "Chat History": a chronological list of prior user prompts and assistant responses.
- "Current Prompt": the user's new learning request.

Output JSON structure:
{
  "learning_path": [ ... ],
  "user_memory_update": "..."
}
`;

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function getLearningPathAndSummary(userInput, chatHistory = [], userSummary = "") {
    const model = client.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
    });

    // Build system context for LLM
    const systemContext =
        `User Summary: ${userSummary || "No user summary yet."}\n` +
        `Chat History:\n` +
        chatHistory.map(msg =>
            `[${msg.role === "user" ? "User" : "Assistant"}] ${msg.text}`
        ).join("\n") +
        `\nCurrent Prompt: ${userInput}`;

    const formattedHistory = [
        {
            role: "user",
            parts: [{ text: systemContext }],
        }
    ];

    const chat = model.startChat({ history: formattedHistory });

    try {
        const result = await chat.sendMessage(userInput);
        const responseText = (await result.response.text()).trim();

        let parsed = null;

        try {
            const cleanText = responseText
                .replace(/^\s*```json\s*/i, "")
                .replace(/^\s*```\s*/i, "")
                .replace(/\s*```$/, "")
                .trim();

            parsed = JSON.parse(cleanText);

            if (
                !parsed ||
                !Array.isArray(parsed.learning_path) ||
                typeof parsed.user_memory_update !== "string"
            ) {
                throw new Error("Missing or invalid required fields in LLM response.");
            }
        } catch (e) {
            console.warn("Could not parse LLM response as JSON:", e.message);
        }

        return { raw: responseText, parsed };
    } catch (error) {
        console.error("LLM chat error:", error.message);
        throw error;
    }
}