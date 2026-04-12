# ExNo:8 - Express.js Web Development

This beginner project shows how Express works with Node.js built-in modules:
- `express` for routing, middleware, and HTTP handling
- `fs` for file read/write
- `path` for safe file paths

## Setup

```bash
cd ex8-express-project
npm init -y
npm install express
```

If you want to use the included `package.json` directly:

```bash
npm install
```

## Run

```bash
npm start
```

Server starts at `http://localhost:3000`.

## Implemented routes

- `GET /` - Home page with links + browser form
- `GET /about` - Uses `req.query`
- `GET /about/:topic` - Uses `req.params` and `req.query`
- `GET /data` - Reads `data.txt` with `fs`
- `POST /submit` - Accepts request body and appends to `log.txt`
- Custom 404 handler using `app.use()`

## Test POST using curl

Form-style data:

```bash
curl -X POST http://localhost:3000/submit \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=Vishal&message=Hello from curl"
```

JSON data:

```bash
curl -X POST http://localhost:3000/submit \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Vishal\",\"message\":\"Hello JSON\"}"
```

## Test POST using browser form

1. Open `http://localhost:3000/`.
2. Fill the form and click **Submit**.
3. Check `log.txt` to see saved data.
