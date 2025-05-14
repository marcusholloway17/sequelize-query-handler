# Query Handler

A Node.js module for handling Sequelize query objects from Express request bodies or query parameters, with support for dynamic model resolution and nested includes.

## Features
- **Dynamic Query Parsing**: Parses query objects from Express request `body` or `query` parameters, supporting attributes, where clauses, ordering, and pagination.
- **Model Resolution**: Resolves Sequelize model names to model objects using a factory function, eliminating the need to pass models repeatedly.
- **Nested Includes**: Supports arbitrary levels of nested `include` clauses for Sequelize associations.
- **Robust Error Handling**: Validates inputs and handles JSON parsing errors gracefully.

## Usage

### 1. Initialize the Module
The module exports a `createHandleQuery` function that creates a `handleQuery` function with your Sequelize models bound.

```javascript
const { createHandleQuery } = require("sequelize-query-handler");

// Define your Sequelize models
const models = [
  { key: "User", value: UserModel },
  { key: "Post", value: PostModel },
];

// Create handleQuery with models
const handleQuery = createHandleQuery(models);
```

### 2. Handle Queries
Use the `handleQuery` function in your Express routes to process query parameters or body data.

```javascript
const express = require("express");
const app = express();

app.use(express.json()); // Enable JSON body parsing

app.get("/api/data", (req, res) => {
  try {
    const query = handleQuery(req);
    // Use query with Sequelize
    // e.g., Model.findAll(query)
    res.json(query);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
```

### 3. Query Format
The `handleQuery` function expects a query object in the request `query._query` (as a JSON string or object) or `body._query`. Example query:

```json
{
  "attributes": ["id", "name"],
  "where": { "id": 1 },
  "order": [["createdAt", "DESC"]],
  "include": [
    {
      "model": "User",
      "include": [{ "model": "Post" }]
    }
  ]
}
```

- **Pagination**: Add `page` and `pageSize` as query parameters (e.g., `/api/data?page=2&pageSize=5`).
- **Nested Includes**: Supports arbitrary levels of nested `include` clauses, with model names resolved to Sequelize model objects.

## API

### `createHandleQuery(models)`
- **Parameters**:
  - `models`: Array of objects with `key` (model name) and `value` (Sequelize model).
- **Returns**: A `handleQuery` function with models bound.
- **Throws**: Error if `models` is not an array.

### `handleQuery(req)` (Returned by `createHandleQuery`)
- **Parameters**:
  - `req`: Express request object with `query._query` or `body._query`.
- **Returns**: A Sequelize-compatible query object with `attributes`, `where`, `order`, `include`, `limit`, and `offset`.
- **Throws**: Errors for invalid `req`, malformed JSON, or missing models.

## Testing
The module includes a Jest test file (`queryHandler.test.js`) to verify functionality.

1. Ensure Jest is installed:
   ```bash
   npm install --save-dev jest
   ```
2. Add a test script to `package.json`:
   ```json
   {
     "scripts": {
       "test": "jest"
     }
   }
   ```
3. Run tests:
   ```bash
   npm test
   ```

The test file covers:
- Query parsing, pagination, and nested includes.
- Error handling for invalid inputs, malformed JSON, and missing models.

## Example
```javascript
const { createHandleQuery } = require("sequelize-query-handler");

// Initialize with models
const handleQuery = createHandleQuery([
  { key: "User", value: UserModel },
  { key: "Post", value: PostModel },
]);

// Example Express route
app.get("/api/users", async (req, res) => {
  try {
    const query = handleQuery(req);
    const users = await UserModel.findAll(query);
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

Send a request:
```bash
curl "http://localhost:3000/api/users?_query={\"attributes\":[\"id\",\"name\"],\"include\":[{\"model\":\"User\"}]}&page=2&pageSize=10"
```

## Dependencies
- [Lodash](https://lodash.com/) for deep merging of query objects.
- [Express](https://expressjs.com/) (assumed for request handling).
- [Sequelize](https://sequelize.org/) (assumed for model definitions).
- [Jest](https://jestjs.io/) (optional, for running tests).

## Notes
- Ensure models are initialized with `createHandleQuery` before calling `handleQuery`.
- The module uses a closure to bind models, making it thread-safe and testable.
- For TypeScript projects, consider adding type definitions for better IDE support.

## License
MIT License