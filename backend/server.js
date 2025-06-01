import express from "express"

const app = express();

app.get("/", (req, res) => {
    res.send("well basic setup for now");
})
app.listen(3000, () => {
    console.log("listening on 3000")
})