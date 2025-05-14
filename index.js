const _ = require("lodash");

/**
 * Finds an item in an array of objects and returns a specified field or the entire object.
 * @param {Array<object>} array - Array of objects to search.
 * @param {string} searchField - Field to search by.
 * @param {any} value - Value to compare against the search field.
 * @param {string|null} [returnField] - Field to return if item is found (optional).
 * @returns {any} - The matching object's field value or the entire object, or undefined if not found.
 * @throws {Error} - If required parameters are invalid.
 */
const finder = (array, searchField, value, returnField = null) => {
  if (!Array.isArray(array) || !searchField || typeof searchField !== "string") {
    throw new Error("Invalid input: array and searchField are required.");
  }

  const item = array.find((e) => e[searchField] === value);
  return returnField && item ? item[returnField] : item;
};

/**
 * Creates a handleQuery function with models bound in a closure.
 * @param {Array<{key: string, value: object}>} models - Sequelize models map.
 * @returns {Function} - The handleQuery function with models pre-configured.
 * @throws {Error} - If models is not an array.
 */
const createHandleQuery = (models) => {
  if (!Array.isArray(models)) {
    throw new Error("Models must be an array.");
  }

  /**
   * Processes include clauses recursively, replacing model names with model objects.
   * @param {Array<object>} includes - Array of include objects.
   */
  const processIncludes = (includes) => {
    if (!Array.isArray(includes)) return [];

    return includes.map((item) => {
      const processedItem = { ...item };
      if (processedItem.model) {
        const model = finder(models, "key", processedItem.model, "value");
        if (!model) {
          throw new Error(`Model not found: ${processedItem.model}`);
        }
        processedItem.model = model;
      }
      if (Array.isArray(processedItem.include)) {
        processedItem.include = processIncludes(processedItem.include);
      }
      return processedItem;
    });
  };

  /**
   * Handles query object from request body or query parameters for Sequelize.
   * @param {object} req - Express request object.
   * @returns {object} - Formatted Sequelize query object.
   * @throws {Error} - If query parsing fails or invalid input is provided.
   */
  const handleQuery = (req) => {
    if (!req) {
      throw new Error("Invalid input: req is required.");
    }

    // Parse query from request
    let parsedQuery;
    try {
      parsedQuery =
        typeof req.query?._query === "string"
          ? JSON.parse(req.query._query)
          : req.query?._query ?? {};
    } catch (error) {
      throw new Error(`Failed to parse query: ${error.message}`);
    }

    // Merge body and query objects
    const mergedQuery = _.merge({}, req.body?._query, parsedQuery);

    // Initialize query object
    const query = {
      attributes: mergedQuery.attributes ?? { exclude: [] },
      where: mergedQuery.where ?? [],
      order: mergedQuery.order ?? [],
      include: [],
    };

    // Handle pagination
    if (req.query?.page && req.query?.pageSize) {
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 10;
      query.limit = pageSize;
      query.offset = (page - 1) * pageSize;
    }

    // Process includes
    if (mergedQuery.include) {
      query.include = processIncludes(mergedQuery.include);
    }

    return query;
  };

  return handleQuery;
};

module.exports = {
  createHandleQuery,
};