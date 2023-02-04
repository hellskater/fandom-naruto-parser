const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

function convertToCmRange(input) {
  // Get rid of all the <br /> tags and put a space between all the words
  input = input.replace(/<br \/>/g, " ");
  const [min, max] = input.split("–");
  // if there is no max value, return the min value

  if (!max) {
    return `${min.split(" ")[0]}cm`;
  }

  return `${min.split(" ")[0]}cm - ${max.split(" ")[0]}cm`;
}

function convertToKgRange(input) {
  // Get rid of all the <br /> tags and put a space between all the words
  input = input.replace(/<br \/>/g, " ");
  const [min, max] = input.split("–");
  // if there is no max value, return the min value

  if (!max) {
    return `${min.split(" ")[0]}kg`;
  }

  return `${min.split(" ")[0]}kg - ${max.split(" ")[0]}kg`;
}

function toCamelCase(str) {
  return str
    .split(" ")
    .map((word, index) =>
      index === 0 ? word : word[0].toUpperCase() + word.substr(1)
    )
    .join("");
}

function convertToArray(input) {
  if (input.includes("\n")) {
    return input.split("\n").map((item) => item.trim());
  }
  return input;
}

const getData = async (href) => {
  try {
    let htmlData;
    try {
      const response = await axios.get(
        `https://naruto.fandom.com/wiki/${href}`
      );
      htmlData = response.data;
    } catch (error) {
      console.error(error);
      return;
    }
    const $ = cheerio.load(htmlData);
    const data = {
      name: href,
    };
    const images = [];

    $("table.infobox td a.image img").each((i, el) => {
      const $el = $(el);
      const src = $el.attr("src");
      images.push(src);
    });

    data["images"] = images;

    let currentKey = null;

    $("tr").each((index, element) => {
      const $element = $(element);
      const header = $element.find(".mainheader");
      //   ignore the first two headers
      if (header.length && index > 2) {
        currentKey = header
          .text()
          .trim()
          .replace("Hide", "")
          .replace("Show", "")
          .toLowerCase();
        currentKey = toCamelCase(currentKey);
        data[currentKey] = {};
      } else if (index > 2) {
        let th = $element.find("th").text().trim().toLowerCase();
        th = toCamelCase(th);
        let td = $element.find("td").text().trim();

        if (!th) {
          const wholeString = $element.find("td").text();

          if (currentKey === "tools" && data.tools.length > 0) {
            data.tools = data.tools.filter((item) => !item.includes(":"));
            return;
          }

          const splitString = wholeString
            .split("\n")
            .map((item) => item.trim())
            .filter((item) => item !== "");

          if (currentKey === "family") {
            const family = {};
            splitString.forEach((item) => {
              if (!item.includes("(")) return;
              const [name, relation] = item.split("(");
              family[relation.replace(")", "").toLowerCase()] = name.trim();
            });
            data[currentKey] = family;
            return;
          }
          data[currentKey] = splitString;
          return;
        }

        if (th === "age") {
          const ages = td.split("\n");
          const agesObj = {};
          ages.forEach((age) => {
            const [key, value] = age.split(":");
            agesObj[key.trim()] = value.trim();
          });
          td = agesObj;
        }

        if (th === "height") {
          const heights = td.split("\n");
          const heightsObj = {};
          heights.forEach((height) => {
            const [key, value] = height.split(":");
            heightsObj[key.trim()] = convertToCmRange(value.trim());
          });
          td = heightsObj;
        }

        if (th === "weight") {
          const weights = td.split("\n");
          const weightsObj = {};
          weights.forEach((weight) => {
            const [key, value] = weight.split(":");
            weightsObj[key.trim()] = convertToKgRange(value.trim());
          });
          td = weightsObj;
        }

        if (th === "ninjaRank") {
          const ninjaRanks = td.split("\n");
          const ninjaRanksObj = {};
          ninjaRanks.forEach((ninjaRank) => {
            const [key, value] = ninjaRank.split(":");
            ninjaRanksObj[key.trim()] = value.trim();
          });
          td = ninjaRanksObj;
        }

        if (th === "clan") {
          // get rid of the word clan from td
          td = td.replace("Clan", "").trim();
        }

        if (
          [
            "occupation",
            "affiliation",
            "team",
            "village",
            "clan",
            "jinchūriki",
            "classification",
            "partner",
            "kekkeiGenkai",
            "kekkeiMōra",
            "english",
            "japanese",
          ].includes(th)
        ) {
          td = convertToArray(td);
        }

        if (th && td && currentKey) {
          data[currentKey][th] = td;
        }

        if (data?.rank && data.rank["academyGrad.Age"]) {
          // if there is personal.age, add the academyGrad.Age to it or create a new one
          data.personal.age = data.personal.age || {};
          data.personal.age["Academy Graduate"] = data.rank["academyGrad.Age"];
          delete data.rank["academyGrad.Age"];
        }

        if (data?.rank && data.rank["chūninProm.Age"]) {
          data.personal.age = data.personal.age || {};
          data.personal.age["Chunin Promotion"] = data.rank["chūninProm.Age"];
          delete data.rank["chūninProm.Age"];
        }

        if (data?.rank && data.rank["jōninProm.Age"]) {
          data.personal.age = data.personal.age || {};
          data.personal.age["Jonin Promotion"] = data.rank["jōninProm.Age"];
          delete data.rank["jōninProm.Age"];
        }
      }
    });

    return data;
  } catch (error) {
    console.error(href);
  }
};

async function getHrefs() {
  try {
    const response = await axios.get(
      "https://naruto.fandom.com/wiki/Special:BrowseData/Characters?limit=2000&offset=0&_cat=Characters"
    );
    const html = response.data;
    const $ = cheerio.load(html);
    const hrefs = [];
    $("a").each(function (i, elem) {
      hrefs.push($(this).attr("href"));
    });
    return hrefs;
  } catch (error) {
    // console.error(error);
  }
}

const getTarget = async () => {
  const allHrefs = await getHrefs();
  const targetHrefs = allHrefs
    .filter((href) => href?.startsWith("/wiki/") && !href?.includes(":"))
    .map((item) => {
      let readableString = decodeURIComponent(item.replace("/wiki/", ""));
      readableString = readableString.replace(/_/g, " ");
      return readableString;
    });
  return targetHrefs;
};

const getCharacterData = async () => {
  const targetHrefs = await getTarget();

  const charactersData = await Promise.all(
    targetHrefs.map(async (href) => {
      const data = await getData(href);
      return data;
    })
  );

  return charactersData;
};

const main = async () => {
  const charactersData = await getCharacterData();
  fs.writeFileSync("characters.json", JSON.stringify(charactersData));
};

main();
