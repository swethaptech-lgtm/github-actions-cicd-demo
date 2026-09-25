const assert = require("assert");
const http = require("http");
const { spawn } = require("child_process");

const PORT = 5000;

function request(path) {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${PORT}${path}`, (res) => {
            let data = "";

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                resolve({
                    statusCode: res.statusCode,
                    body: data
                });
            });
        });

        req.on("error", reject);
    });
}

async function runTests() {
    const server = spawn("node", ["server.js"], {
        stdio: ["ignore", "pipe", "pipe"]
    });

    try {
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Server did not start within 5 seconds"));
            }, 5000);

            server.stdout.on("data", (data) => {
                if (data.toString().includes("Application running on port 5000")) {
                    clearTimeout(timeout);
                    resolve();
                }
            });

            server.stderr.on("data", (data) => {
                process.stderr.write(data);
            });

            server.on("error", reject);
        });

        const homeResponse = await request("/");
        assert.strictEqual(homeResponse.statusCode, 200);
        assert.strictEqual(
            homeResponse.body,
            "Hello from GitHub Actions CI/CD!"
        );

        const healthResponse = await request("/health");
        assert.strictEqual(healthResponse.statusCode, 200);
        assert.strictEqual(healthResponse.body, "healthy");

        console.log("✅ All tests passed");
    } finally {
        server.kill();
    }
}

runTests().catch((error) => {
    console.error("❌ Tests failed");
    console.error(error);
    process.exit(1);
});
