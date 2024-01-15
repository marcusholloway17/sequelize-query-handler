var _ = require("lodash");

/**
 * find an item through an array of object
 * @param {array<any>} array array of object to filter
 * @param {string} searchField field or attribute to search
 * @param {any} value value to use to compare the predicate field value
 * @param {any} returnField field to be return if item is found
 * @returns {any}
 */
const finder = (array, searchField, value, returnField) => {
  return (returnField !== null) | undefined
    ? _.find(array, (e) => e[String(searchField)] == String(value))?.[
        String(returnField)
      ]
    : _.find(array, (e) => e[String(searchField)] == String(value));
};

/**
 * handle queries object passed in the body or query and return it
 * @param {any} req reauest object
 * @param {array<[key:string], value:any>} models Sequelize models map as [{key: ModelName, value: ModelObject}]
 * @returns {any}
 */
const handleQuery = (req, models) => {
  const globalRequest = _.merge(req.body?._query, req.query?._query);

  let query = {};
  // in the body
  //  handle attributes clause
  query.attributes = globalRequest?.attributes || { exclude: [] };

  // handle where clause
  query.where = globalRequest?.where || [];

  // handle order clause
  query.order = globalRequest?.order || [];

  // handle pagination
  if (req.query?.page && req.query?.pageSize) {
    const page = parseInt(req.query?.page) || 1;
    const pageSize = parseInt(req.query?.pageSize) || 10;

    query.limit = pageSize;
    query.offset = (page - 1) * pageSize;
  }

  // handle include & nested includes
  if (globalRequest?.include && models && Array.isArray(models)) {
    // 1st level

    const globalRequestInclude = globalRequest?.include;
    if (Array.isArray(globalRequestInclude)) {
      globalRequestInclude?.map(async (firstLevelItem) => {
        if (
          firstLevelItem?.model &&
          finder(models, "key", firstLevelItem?.model, "value")
        ) {
          firstLevelItem.model = finder(
            models,
            "key",
            firstLevelItem?.model,
            "value"
          );
        }
        // 2nd level
        if (firstLevelItem?.include && Array.isArray(firstLevelItem?.include)) {
          const seconLevelItems = firstLevelItem?.include;
          seconLevelItems?.map((seconLevelItem) => {
            if (
              seconLevelItem?.model &&
              finder(models, "key", seconLevelItem?.model, "value")
            ) {
              seconLevelItem.model = finder(
                models,
                "key",
                seconLevelItem?.model,
                "value"
              );
            }
            // 3rd level
            if (
              seconLevelItem?.include &&
              Array.isArray(seconLevelItem?.include)
            ) {
              const thirdLevelItems = seconLevelItem?.include;
              thirdLevelItems?.map((thirdLevelItem) => {
                if (
                  thirdLevelItem?.model &&
                  finder(models, "key", thirdLevelItem?.model, "value")
                ) {
                  thirdLevelItem.model = finder(
                    models,
                    "key",
                    thirdLevelItem?.model,
                    "value"
                  );
                }
                // 4th level
                if (
                  thirdLevelItem?.include &&
                  Array.isArray(thirdLevelItem?.model)
                ) {
                  const fourthLevelItems = thirdLevelItem?.include;
                  fourthLevelItems.map((fourthLevelItem) => {
                    if (
                      fourthLevelItem?.model &&
                      finder(models, "key", fourthLevelItem?.model, "value")
                    ) {
                      fourthLevelItem.model = finder(
                        models,
                        "key",
                        fourthLevelItem?.model,
                        "value"
                      );
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
    query.include = globalRequestInclude;
  } else {
    query.include = [];
  }

  return query;
};
module.exports = {
  finder,
  handleQuery,
};
