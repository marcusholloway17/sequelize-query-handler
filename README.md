
# SEQUELIZE QUERY HANDLER

Dynamically handling queries with sequelize can be a pain. This package provides you with a function to query your database as you wish


## API Reference



| Method | Type     | Return                |
| :-------- | :------- | :------------------------- |
| `handleQuery` | `function` | **object** |




## Usage/Examples

Using `findAll` method:

```javascript
// imports
const models = require("./models");
const { handleQuery } = require("sequelize-query-handler");

const getAll = async (req, res) => {
    try {
        await models.User.findAll(handleQuery(req)).then((users) => res.send(users));
    }catch(err){
        console.log(err);
    }
}

```

Using `findOne` method:

```javascript
// imports
const models = require("./models");
const { handleQuery } = require("sequelize-query-handler");

const getOne = async (req, res) => {
    try {
        await models.User.findOne(handleQuery(req)).then((user) => res.send(user));
    }catch(err){
        console.log(err);
    }
}
```

Using `findByPk` method:

```javascript
// imports
const models = require("./models");
const { handleQuery } = require("sequelize-query-handler");

const getById = async (req, res) => {
    try {
        await models.User.findByPk(1,handleQuery(req)).then((user) => res.send(user));
    }catch(err){
        console.log(err);
    }
}
```

Using `with own query` method:

```javascript
// imports
const models = require("./models");
const { handleQuery } = require("sequelize-query-handler");
const { Op } = require("sequelize");

const getById = async (req, res) => {
    try {
        const filters = handleQuery(req);
        
        // adding where clause to fetch user with age >= 18
        filters.where = {
            ...filters.where,
            age: {
                [Op.gte]: 18
            }
        }

        await models.User.findAll(filters).then((user) => res.send(user));
    }catch(err){
        console.log(err);
    }
}
```
## Author

- [@marcusholloway17](https://www.github.com/marcusholloway17)

