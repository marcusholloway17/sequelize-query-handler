const { finder, createHandleQuery } = require("../index");

// Mock Lodash merge
jest.mock("lodash", () => ({
    merge: jest.fn((...args) => Object.assign({}, ...args)),
}));

describe("queryHandler", () => {
    // Mock Sequelize models
    const mockModels = [
        { key: "User", value: { name: "UserModel" } },
        { key: "Post", value: { name: "PostModel" } },
    ];

    describe("finder", () => {
        test("should find an item by searchField and return specified field", () => {
            const array = [
                { id: 1, name: "Alice" },
                { id: 2, name: "Bob" },
            ];
            const result = finder(array, "id", 2, "name");
            expect(result).toBe("Bob");
        });

        test("should find an item by searchField and return entire object if returnField is null", () => {
            const array = [
                { id: 1, name: "Alice" },
                { id: 2, name: "Bob" },
            ];
            const result = finder(array, "id", 2);
            expect(result).toEqual({ id: 2, name: "Bob" });
        });

        test("should return undefined if item is not found", () => {
            const array = [
                { id: 1, name: "Alice" },
                { id: 2, name: "Bob" },
            ];
            const result = finder(array, "id", 3);
            expect(result).toBeUndefined();
        });

        test("should throw error for invalid array", () => {
            expect(() => finder(null, "id", 1)).toThrow("Invalid input: array and searchField are required.");
            expect(() => finder({}, "id", 1)).toThrow("Invalid input: array and searchField are required.");
        });

        test("should throw error for invalid searchField", () => {
            const array = [{ id: 1, name: "Alice" }];
            expect(() => finder(array, null, 1)).toThrow("Invalid input: array and searchField are required.");
            expect(() => finder(array, 123, 1)).toThrow("Invalid input: array and searchField are required.");
        });
    });

    describe("createHandleQuery", () => {
        let handleQuery;

        beforeEach(() => {
            // Create handleQuery with mock models
            handleQuery = createHandleQuery(mockModels);
            // Reset Lodash merge mock
            require("lodash").merge.mockClear();
        });

        test("should throw error if models is not an array", () => {
            expect(() => createHandleQuery(null)).toThrow("Models must be an array.");
            expect(() => createHandleQuery({})).toThrow("Models must be an array.");
        });

        test("should handle query with attributes, where, and order", () => {
            const req = {
                query: { _query: JSON.stringify({ attributes: ["id", "name"], where: { id: 1 }, order: [["createdAt", "DESC"]] }) },
                body: { _query: {} },
            };
            const result = handleQuery(req);
            expect(result).toEqual({
                attributes: ["id", "name"],
                where: { id: 1 },
                order: [["createdAt", "DESC"]],
                include: [],
            });
            expect(require("lodash").merge).toHaveBeenCalledWith({}, {}, { attributes: ["id", "name"], where: { id: 1 }, order: [["createdAt", "DESC"]] });
        });

        test("should handle pagination", () => {
            const req = {
                query: { page: "2", pageSize: "5" },
                body: { _query: {} },
            };
            const result = handleQuery(req);
            expect(result).toEqual({
                attributes: { exclude: [] },
                where: [],
                order: [],
                include: [],
                limit: 5,
                offset: 5,
            });
        });

        test("should handle includes with nested models", () => {
            const req = {
                query: {
                    _query: JSON.stringify({
                        include: [
                            { model: "User", include: [{ model: "Post" }] },
                        ],
                    }),
                },
                body: { _query: {} },
            };
            const result = handleQuery(req);
            expect(result.include).toEqual([
                {
                    model: { name: "UserModel" },
                    include: [{ model: { name: "PostModel" } }],
                },
            ]);
        });

        test("should throw error for invalid model in include", () => {
            const req = {
                query: {
                    _query: JSON.stringify({
                        include: [{ model: "InvalidModel" }],
                    }),
                },
                body: { _query: {} },
            };
            expect(() => handleQuery(req)).toThrow("Model not found: InvalidModel");
        });

        test("should throw error for invalid req", () => {
            expect(() => handleQuery(null)).toThrow("Invalid input: req is required.");
        });

        test("should throw error for invalid JSON in query", () => {
            const req = {
                query: { _query: "invalid-json" },
                body: { _query: {} },
            };
            expect(() => handleQuery(req)).toThrow(/Failed to parse query/);
        });

        test("should handle empty query and body", () => {
            const req = { query: {}, body: {} };
            const result = handleQuery(req);
            expect(result).toEqual({
                attributes: { exclude: [] },
                where: [],
                order: [],
                include: [],
            });
        });
    });
});