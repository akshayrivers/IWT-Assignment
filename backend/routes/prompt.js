import express from "express";
import { getLearningPathAndSummary } from "../services/llm.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const userId = req.user.id;
    const { userInput } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found." });

        // Build chat history from previous interactions
        const chatHistory = (user.history || []).flatMap(entry => [
            { role: "user", text: entry.prompt },
            { role: "assistant", text: entry.summary }
        ]).filter(msg => msg.text);

        // Use the latest summary (cumulative) as context
        const userSummary = user.userSummary || "";

        const { parsed, raw } = await getLearningPathAndSummary(userInput, chatHistory, userSummary);

        if (parsed && Array.isArray(parsed.learning_path) && parsed.learning_path.length > 0) {
            // Store new entry
            user.history.push({
                prompt: userInput,
                summary: parsed.user_memory_update,
                graph: parsed.learning_path
            });
            user.currentGraph = parsed.learning_path;
            user.userSummary = parsed.user_memory_update;
            await user.save();

            return res.json(parsed);
        }

        // Fallback to previous learning path if new one wasn't returned
        if (user.currentGraph && Array.isArray(user.currentGraph) && user.currentGraph.length > 0) {
            return res.json({
                learning_path: user.currentGraph,
                user_memory_update: user.userSummary || "Using previously generated learning path.",
                raw: raw || "LLM did not return a valid learning path."
            });
        }

        // If even fallback is not available
        return res.status(500).json({
            error: "Unable to generate or fallback to a learning path.",
            raw: raw || "No valid response from LLM and no previous data found."
        });

    } catch (err) {
        console.error("Error processing learning request:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;