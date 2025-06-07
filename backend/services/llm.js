import { config } from "dotenv";
config();
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `
You are an AI assistant for a learning platform. Your role is to help users achieve their learning goals by generating structured, actionable, and user-tailored learning paths.

Context:
- The user provides a prompt specifying what they want to learn (e.g., "Bash scripting"), with optional details like time, specifics, and prior experience.
- You have access to the user's history and learning graph (if available), which includes their previous prompts, progress, and memory of what they have learned so far.
- Your outputs are used to update the user's learning graph and memory, and are also sent directly to the user for immediate feedback.

Instructions:
1. Refine the user's prompt using their history and learning graph to create a finalized, context-aware prompt.
2. Generate and return a detailed learning path that includes:
   - A step-by-step learning graph (points or milestones, in order)
   - Specifics of what to learn at each point
   - Recommended resources (links, articles, videos, etc.) for each step
3. Provide a concise, precise summary of the user's current learning state (memory update), summarizing what the user is currently working on and their progress.
4. Your response should be structured, easy to parse, and actionable.
5. Do not include implementation details about the system or code—focus only on learning content and guidance.

Example output structure:
{
  "learning_path": [
    {
      "step": 1,
      "topic": "Introduction to Bash",
      "details": "Basics of shell scripting, command line navigation.",
      "resources": ["https://www.learnshell.org"]
    }
  ],
  "user_memory_update": "User has completed basics of Bash scripting and is ready to move on to control structures."
}

Always personalize your response based on the user's prompt and history.
`;

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function getLearningPathAndSummary(userInput, chatHistory = []) {
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: SYSTEM_PROMPT });

    const geminiHistory = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
        history: geminiHistory
    });

    try {
        const result = await chat.sendMessage(userInput);
        const fullResponse = await result.response.text();

        let parsed;
        try {
            parsed = JSON.parse(fullResponse);
        } catch {
            parsed = null;
        }

        return {
            raw: fullResponse,
            parsed
        };
    } catch (error) {
        console.error("Error during chat:", error);
        throw error;
    }
}