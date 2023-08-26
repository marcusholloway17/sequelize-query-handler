const { finder, handleQuery } = require("..");

const array = [
  {
    key: "users",
    value: [
      {
        id: 1,
        name: "john",
        age: 18,
      },
      {
        id: 2,
        name: "Doe",
        age: 19,
      },
    ],
  },
  {
    key: "roles",
    value: [
      {
        id: 1,
        label: "john",
        description: "hello John",
      },
      {
        id: 2,
        label: "Doe",
        description: "hello Doe",
      },
    ],
  },
];

console.log("######### finder test start ########");
const resultWithValue = finder(array, "key", "roles", "value");
const resultWithoutValue = finder(array, "key", "roles", null);

console.log("result with value: ", resultWithValue);
console.log("result without value: ", resultWithoutValue);

console.log("######### finder test end ########");

console.log("######### handleQuery test start ########");
const req = {
  body: {
    _query: {
      include: [
        {
          model: "users",
          include: [
            {
              model: "roles",
              include: [],
            },
          ],
        },
      ],
    },
  },
};
const models = [array];
const filters = handleQuery(req, models);
console.log(filters);
console.log("######### handleQuery test end ########");
