const express = require("express")
const path = require("path")

const app = express()
console.log(process.cwd())
app.use("/", express.static(path.join(process.cwd(), "test")))
app.use("/micro-mvvm", express.static(path.join(process.cwd(), "lib"), {index: "index.js"}))
app.use(express.json())

app.get("/api/user", (request, response) => {
    response.status(200).json({
        id: parseInt(request.query.id),
        username: "test"
    })
})

app.listen(12444, () => void console.log("Listening on port 12444"))