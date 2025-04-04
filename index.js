var _ = require("lodash");
const { Op } = require("sequelize");

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
  // handle properly query in the request query object
  const __query =
    typeof req.query?._query == "string"
      ? JSON.parse(req.query?._query)
      : { ...req.query?._query };

  // merge body & query object
  const globalRequest = _.merge(req.body?._query, __query);

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
          const firstLevelItemWhere = firstLevelItem?.where;
          if (firstLevelItemWhere) {
            for (const field in firstLevelItemWhere) {
              if (Op[field]) {
                firstLevelItemWhere[`[${Op}.${field}]`] = firstLevelItemWhere[field];
                delete firstLevelItemWhere[field];
              }
            }
          }
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
              const secondLevelItemWhere = seconLevelItem?.where;
              if (secondLevelItemWhere) {
                for (const field in secondLevelItemWhere) {
                  if (Op[field]) {
                    secondLevelItemWhere[`[${Op}.${field}]`] = secondLevelItemWhere[field];
                    delete secondLevelItemWhere[field];
                  }
                }
              }
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
                  const thirdLevelItemsWhere = thirdLevelItems?.where;
                  if (thirdLevelItemsWhere) {
                    for (const field in thirdLevelItemsWhere) {
                      if (Op[field]) {
                        thirdLevelItemsWhere[`[${Op}.${field}]`] = thirdLevelItemsWhere[field];
                        delete thirdLevelItemsWhere[field];
                      }
                    }
                  }
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
                  const fourthLevelItemsWhere = fourthLevelItems?.where;
                  if (fourthLevelItemsWhere) {
                    for (const field in fourthLevelItemsWhere) {
                      if (Op[field]) {
                        fourthLevelItemsWhere[`[${Op}.${field}]`] = fourthLevelItemsWhere[field];
                        delete fourthLevelItemsWhere[field];
                      }
                    }
                  }
                }
              });
            }
          });
        }
      });
    }

    // handle where query with operators
    const globalRequestWhere = globalRequest?.where;
    // level one
    if (globalRequestWhere) {
      for (const field in globalRequestWhere) {
        if (Op[field]) {
          globalRequestWhere[`[${Op}.${field}]`] = globalRequestWhere[field];
          delete globalRequestWhere[field];
        }
      }
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
