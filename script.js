const fs = require("fs");

const clans = JSON.parse(fs.readFileSync("./data/villages.json"));

// give each clan an id with id property on top

clans.forEach((clan, index) => {
  clan.id = index;
});

// move the id property to the top

const sortedClans = clans.map((clan) => {
  const keys = Object.keys(clan);
  const sortedKeys = keys.sort();
  const sortedClan = {};
  sortedKeys.forEach((key) => {
    if (key === "id") {
      sortedClan[key] = clan[key];
    }
  });
  sortedKeys.forEach((key) => {
    if (key === "name") {
      sortedClan[key] = clan[key];
    }
  });
  sortedKeys.forEach((key) => {
    sortedClan[key] = clan[key];
  });
  return sortedClan;
});

// write

fs.writeFileSync("./data/villages.json", JSON.stringify(sortedClans));
