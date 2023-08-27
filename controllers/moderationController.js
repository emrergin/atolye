const Kullanici = require("../models/kullanici");
require("dotenv").config();

const LIMIT_TO_VACATION = 1;
const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

async function dailyModeration(req, res) {
  if (
    req.get("x-cyclic") !== `"${process.env.MODERATOR_CODE}"` &&
    req.get("x-cyclic") !== process.env.MODERATOR_CODE
  ) {
    return res.status(403).send("Unauthorized");
  }
  const d = new Date();
  d.setHours(d.getHours() + 3);
  const day = d.getDay();
  if (day === 1) {
    await weeklyModeration(req, res);
  } else if (day === 2) {
    await storyFetcher(req, res);
  } else if (day === 4) {
    await vacationCheck(req, res);
  } else {
    res.json(`day is ${WEEKDAYS[day]}`);
  }
}

async function weeklyModeration(req, res) {
  const haftalikModerasyon = require("../modules/haftalikModerasyon");
  const week = await haftalikModerasyon();
  res.json(`moderation for week ${week} is complete.`);
}

async function vacationCheck(req, res) {
  const numberOfParticipants = Kullanici.find({ katilim: "yazacak" }).lean()
    .length;
  if (numberOfParticipants <= LIMIT_TO_VACATION && numberOfParticipants > 0) {
    await Kullanici.updateMany(
      { katilim: "yazacak" },
      { $set: { katilim: "yazmayacak" } }
    );
  }
  if (numberOfParticipants <= LIMIT_TO_VACATION) {
    res.json(`no story will be written this week.`);
  } else {
    res.json(
      `${numberOfParticipants} persons are writing. No need for a vacation`
    );
  }
}

async function storyFetcher(req, res) {
  const activeAuthors = (await Kullanici.find({ aktif: true }).lean()).map(
    (a) => ({
      ad: a.gercekAd,
      yazarObje: new mongoose.Types.ObjectId(a._id),
    })
  );

  for (let author of activeAuthors) {
    const storiesByThisAuthor = await Oyku.find({
      yazarObje: author.yazarObje,
      metin: { $exists: false },
    });
    for (let story of storiesByThisAuthor) {
      const textOfStory = await fetchStory(story.link);
      story.metin = textOfStory;
      const length = textOfStory.split(/\s+/).length;
      story.uzunluk = length;
      await story.save();
    }
  }

  res.json("story texts update is complete.");
}

async function fetchStory(downloadLink) {
  const downloadResponse = await fetch(
    downloadLink
      .replace("/edit", "/export?format=txt")
      .replace("?usp=sharing", "")
  );
  const blob = await downloadResponse.text();
  var regex = /^\[a\][\S\s]*$/gm;

  let cleanedParagraphs = blob.replace(regex, "");
  const textExceptCommentMarkers = cleanedParagraphs
    .replace(/\[[a-zA-Z]{1,2}\]/g, "")
    .trim();
  cleanedParagraphs = textExceptCommentMarkers
    .split("\n")
    .map((a) => a.trim())
    .join("\n");

  return cleanedParagraphs;
}

module.exports = {
  dailyModeration,
  fetchStory,
};
