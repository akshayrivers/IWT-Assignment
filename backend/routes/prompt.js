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

        const chatHistory = user.history.flatMap(entry => [
            { role: "user", text: entry.prompt },
            { role: "model", text: entry.summary || "" }
        ]).filter(msg => msg.text);

        const { parsed, raw } = await getLearningPathAndSummary(userInput, chatHistory);

        if (parsed) {
            user.history.push({
                prompt: userInput,
                graph: parsed.learning_path || [],
                summary: parsed.user_memory_update || ""
            });

            user.currentGraph = parsed.learning_path || {};
            user.userSummary = parsed.user_memory_update || "";

            await user.save();
            res.json(parsed);
        } else {
            res.json({ raw });
        }
    } catch (error) {
        console.error("Prompt route error:", error);
        res.status(500).json({ error: "Failed to process prompt." });
    }
});

export default router;