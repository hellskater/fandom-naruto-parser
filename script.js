const fs = require("fs");

const data = fs.readFileSync("characters.json");
const characters = JSON.parse(data);

// map over all the characters and give an array of unique team names sorted alphabetically

const teams = characters
  .map((character) => character?.personal?.kekkeiGenkai)
  .filter((team) => team)
  .flat()
  .filter((team, index, self) => self.indexOf(team) === index)
  .sort();

// map over the teams and create an object with the team name as the key and an array of characters who have the team in their personal.team as the value

const teamsWithCharacters = teams.map((team) => {
  const charactersWithTeam = characters.filter((character) =>
    character?.personal?.kekkeiGenkai?.includes(team)
  );
  return { name: team, characters: charactersWithTeam };
});

// write the teamsWithCharacters object to a json file

fs.writeFileSync("kekkeiGenkai.json", JSON.stringify(teamsWithCharacters));
