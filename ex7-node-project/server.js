// ExNo:7 - Node.js based Web Development (without Express.js)
// This file demonstrates built-in Node.js modules: http, fs, path, and URL.

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = 3000;

// Create an HTTP server with route handling.
const server = http.createServer((req, res) => {
  // Parse the incoming request URL and query parameters.
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Route: GET /
  if (req.method === "GET" && pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(
      "Welcome to ExNo:7 Node.js server.\nTry /about?name=Reddy&course=21CSS301T, /read-file, or POST /write-file"
    );
    return;
  }

  // Route: GET /about
  // Demonstrates the URL module by reading query parameters.
  if (req.method === "GET" && pathname === "/about") {
    const name = parsedUrl.searchParams.get("name") || "Guest";
    const course = parsedUrl.searchParams.get("course") || "Not Provided";

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(
      [
        "About Route (URL module demo)",
        `Path: ${pathname}`,
        `Query parameter name: ${name}`,
        `Query parameter course: ${course}`,
      ].join("\n")
    );
    return;
  }

  // Route: GET /read-file
  // Demonstrates fs + path by reading data.txt safely.
  if (req.method === "GET" && pathname === "/read-file") {
    const dataFilePath = path.join(__dirname, "data.txt");

    fs.readFile(dataFilePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error reading data.txt");
        return;
      }

      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(`Contents of data.txt:\n\n${data}`);
    });
    return;
  }

  // Route: POST /write-file
  // Demonstrates fs + path by writing a hardcoded string to output.txt.
  if (req.method === "POST" && pathname === "/write-file") {
    const outputFilePath = path.join(__dirname, "output.txt");
    const message =
      "This line was written by POST /write-file in the Node.js server.";

    fs.writeFile(outputFilePath, message, "utf8", (err) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error writing output.txt");
        return;
      }

      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Success: output.txt has been created/updated.");
    });
    return;
  }

  // 404 fallback for unknown routes.
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 Not Found: Route does not exist.");
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
