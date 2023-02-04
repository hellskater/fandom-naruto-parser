const fs = require("fs");

const data = fs.readFileSync("characters.json");
const characters = JSON.parse(data);

const check = () => {
  //   map over the array and give me the property names which contain \n
  const keysToRemove = [];
  const resultMap = {};
  characters.map((character) => {
    Object.keys(character).map((key) => {
      if (key.includes("\n")) {
        keysToRemove.push(key);
      }
    });
    Object.entries(character).forEach(([key1, value1]) => {
      if (typeof value1 !== "string") {
        Object.entries(value1).forEach(([key2, value2]) => {
          if (typeof value2 === "string" && value2.includes("\n")) {
            if (!resultMap[key1]) resultMap[key1] = [key2];
            else {
              if (!resultMap[key1].includes(key2)) resultMap[key1].push(key2);
            }
          }
        });
      }
    });
  });
  console.log(resultMap);
  console.log(keysToRemove);
};

check();
