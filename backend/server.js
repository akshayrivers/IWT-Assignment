import express from "express"
import cors from 'cors';
import dotenv from 'dotenv';
// import promptRoutes from './routes/prompt.js';
// import userRoutes from './routes/user.js';
import { connectDB } from "./middleware/db.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
/**
 * THE PLAN AS OF NOW:
 * FINAL OUTCOME : 
 * - A JWT BASED AUTHETNICATION AND WE WILL RECIEVE THE PROMPT FROM THE USER -LIKE HE WANTS TO LEARN BASH (TIME,SPECIFICS ETC WHICH WE WILL HAVE SOME DEFAULT FOR NOW)
 * - PHEW AFTER WE RECIEVE THE PROMPT WE WILL REFINE IT ALONG WITH THE USER HISTORY AND GRAPH (IF EXITS IN DB) AND THE PREVIOUS PROMT AND CREATE A FINALISED PROMPT TO GIVE TO THE LLM 
 * - AFTER THAT WE WANT TO PASS IT INTO AN LLM WITH SPECIFIC SYSTEM PROMPTS FROM WHERE WE RECIEVE:
 *      1.THE LEARNING PATH (GRAPH(POINTS) + SPECIFCS OF THE LEARNING + RESOURCES WHERE THE USER CAN LEARN FROM )
 *      2.MEMORY UPDATE ABOUT THE USER AT WHAT HE IS DOING IN PRECISE WORDS- LIKE THE SUMMARISED THE USER HISTORY
 * - PHEW FROM THE RESULT WE RECIVE FROM THE LLM - WE WILL FIRST AND FOREMOST SEND IT TO THE USER (TO MAINTAIN SPEED) AND THEN BUILD THE GRAPH AND SEND IT TOO AND THEN STORE THE DATA IN THE DB
 * 
 * 
 */
connectDB();
app.get("/", (req, res) => {
    res.send("well basic setup for now");
})
// app.use('/api/user', userRoutes);
// app.use('/api/learning', promptRoutes);
app.listen(3000, () => {
    console.log("listening on 3000")
})