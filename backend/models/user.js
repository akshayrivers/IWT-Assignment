import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
    prompt: { type: String },
    timestamp: { type: Date, default: Date.now },
    graph: { type: [mongoose.Schema.Types.Mixed], default: [] }, // Array of objects (nodes) in the Graph 
    summary: { type: String }
}, { _id: false });


const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    history: { type: [historySchema], default: [] },
    currentGraph: { type: mongoose.Schema.Types.Mixed, default: {} },
    userSummary: { type: String, default: "" }
});

const User = mongoose.model('User', userSchema);
export default User;