# ExNo:7 - Node.js Web Development (No Express)

This beginner example uses only Node.js built-in modules in one file (`server.js`):
- `http` to create the server and routes
- `fs` to read and write files
- `path` to build safe file paths
- `URL` to parse URL and query parameters

## Run

```bash
cd ex7-node-project
node server.js
```

Server starts at `http://localhost:3000`.

## Routes

- `GET /` - Home page
- `GET /about?name=Reddy&course=21CSS301T` - URL/query demo
- `GET /read-file` - Reads `data.txt`
- `POST /write-file` - Writes a hardcoded string to `output.txt`
- Any other route - 404

## Quick test commands

```bash
curl http://localhost:3000/
curl "http://localhost:3000/about?name=Vishal&course=21CSS301T"
curl http://localhost:3000/read-file
curl -X POST http://localhost:3000/write-file
```
