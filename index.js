module.exports = {
  /**
   * @description handle queries object passed in the body or query and return it
   * @param {object} req
   * @returns {object}
   */
  handleQuery: (req) => {
    const globalRequest = { ...req.body?._query, ...req.query?._query };
    let query = {};
    // in the body
    //  handle attributes clause
    query.attributes = globalRequest?.attributes || { exclude: [] };

    // handle where clause
    query.where = globalRequest?.where || [];

    // handle order clause
    query.order = globalRequest?.order || [];

    // handle pagination
    // handle pagination
    if (globalRequest?.page && globalRequest?.pageSize) {
      const page = parseInt(globalRequest?.page) || 1;
      const pageSize = parseInt(globalRequest?.pageSize) || 10;

      query.limit = pageSize;
      query.offset = (page - 1) * pageSize;
    }

    // handle include
    query.include = globalRequest?.include || [];

    return query;
  },
};
