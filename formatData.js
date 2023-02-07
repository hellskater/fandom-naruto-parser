const fs = require("fs");

const data = fs.readFileSync("characters.json");
const characters = JSON.parse(data);

const formatData = () => {
  let updatedCharacters;

  //   remove any keys that are equal to "null" or "undefined"
  updatedCharacters = characters.map((character) => {
    Object.keys(character).forEach((key) => {
      if (
        character[key] === "null" ||
        character[key] === "undefined" ||
        key === "null" ||
        key === "undefined"
      ) {
        delete character[key];
      }
    });
    return character;
  });

  updatedCharacters = characters.map((character) => {
    // in the object if there are any keys contain japanese characters, create a new key called titles and assign it to an array of the string split by \n and delete the old key
    Object.keys(character).forEach((key) => {
      if (key.match(/[\u3040-\u30ff]/)) {
        character.personal.titles = key
          .split("\n")
          .map((title) => title.trim().replace(/\[\d+\]/g, ""))
          .filter((title) => title !== "");

        delete character[key];
      }
    });
    return character;
  });

  updatedCharacters = updatedCharacters.map((character) => {
    // in character.images array if any element contains data:image, delete it
    character.images = character.images.filter(
      (image) => !image.includes("data:image")
    );
    return character;
  });

  if (updatedCharacters)
    fs.writeFileSync("characters.json", JSON.stringify(updatedCharacters));
};

const indexCharacters = () => {
  const characters = JSON.parse(fs.readFileSync("characters.json"));
  // give each character an id
  characters.forEach((character, index) => {
    character.id = index;
  });
  fs.writeFileSync("characters.json", JSON.stringify(characters));
};

const formatFieldsAlphabetically = () => {
  const characters = JSON.parse(fs.readFileSync("characters.json"));
  const sortedCharacters = characters.map((character) => {
    const keys = Object.keys(character);
    const sortedKeys = keys.sort();
    const sortedCharacter = {};
    sortedKeys.forEach((key) => {
      if (key === "id") {
        sortedCharacter[key] = character[key];
      }
    });
    sortedKeys.forEach((key) => {
      if (key === "name") {
        sortedCharacter[key] = character[key];
      }
    });
    sortedKeys.forEach((key) => {
      if (key === "images") {
        sortedCharacter[key] = character[key];
      }
    });

    sortedKeys.forEach((key) => {
      sortedCharacter[key] = character[key];
    });
    return sortedCharacter;
  });
  fs.writeFileSync("characters.json", JSON.stringify(sortedCharacters));
};

formatData();
// indexCharacters();
formatFieldsAlphabetically();
