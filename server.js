const express = require("express");

const app = express();
const PORT = 5000;

app.get("/", (req, res) => {
    res.send("Hello from GitHub Actions CI/CD!");
});

app.get("/health", (req, res) => {
    res.send("healthy");
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Application running on port ${PORT}`);
});
