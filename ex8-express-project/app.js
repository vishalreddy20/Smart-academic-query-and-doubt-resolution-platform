// ExNo:8 - Express.js based Web Development
// This file demonstrates Express routing with Node.js built-in modules: fs and path.

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Built-in middleware for parsing JSON and form data.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom logging middleware: method + URL + timestamp for every request.
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);
  next();
});

// GET /
app.get("/", (req, res) => {
  res.send(`
    <h1>ExNo:8 Express.js Demo</h1>
    <p>Try these routes:</p>
    <ul>
      <li><a href="/about?name=Reddy&batch=2025">/about?name=Reddy&batch=2025</a></li>
      <li><a href="/about/web-dev?semester=6">/about/web-dev?semester=6</a></li>
      <li><a href="/data">/data</a></li>
    </ul>
    <h2>POST /submit (Browser Form)</h2>
    <form action="/submit" method="POST">
      <label>Name: <input type="text" name="name" required /></label><br/><br/>
      <label>Message: <input type="text" name="message" required /></label><br/><br/>
      <button type="submit">Submit</button>
    </form>
  `);
});

// GET /about
// Demonstrates req.query usage.
app.get("/about", (req, res) => {
  const { name = "Guest", batch = "Unknown" } = req.query;
  res.json({
    route: "/about",
    message: "This route demonstrates req.query",
    query: req.query,
    example: `Hello ${name}, your batch is ${batch}`,
  });
});

// GET /about/:topic
// Demonstrates req.params + req.query in the same route.
app.get("/about/:topic", (req, res) => {
  const { topic } = req.params;
  const { semester = "Not provided" } = req.query;

  res.json({
    route: "/about/:topic",
    message: "This route demonstrates req.params and req.query",
    params: req.params,
    query: req.query,
    details: `Topic: ${topic}, Semester: ${semester}`,
  });
});

// GET /data
// Reads data.txt using fs + path.join.
app.get("/data", (req, res) => {
  const dataPath = path.join(__dirname, "data.txt");

  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read data.txt" });
    }
    res.type("text/plain").send(`Contents of data.txt:\n\n${data}`);
  });
});

// POST /submit
// Accepts JSON or form body and writes it to log.txt using fs + path.join.
app.post("/submit", (req, res) => {
  const logPath = path.join(__dirname, "log.txt");
  const payload = req.body;

  const logLine = `${new Date().toISOString()} | ${JSON.stringify(payload)}\n`;

  fs.appendFile(logPath, logLine, "utf8", (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to write to log.txt" });
    }

    res.json({
      message: "Data received and saved to log.txt",
      body: req.body,
    });
  });
});

// Custom 404 handler using app.use()
app.use((req, res) => {
  res.status(404).json({
    error: "404 Not Found",
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
  });
});

app.listen(PORT, () => {
  console.log(`Express app running at http://localhost:${PORT}`);
});
