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
  if (req.get(headerName) !== process.env.MODERATOR_CODE) {
    res.status(403).send("Unauthorized");
  }
  const d = new Date();
  d.setHours(d.getHours() + 3);
  const day = d.getDay();
  if (day === 1) {
    weeklyModeration();
  } else if (day === 4) {
    vacationCheck();
  } else {
    res.json(`day is ${WEEKDAYS[day]}`);
  }
}

async function weeklyModeration(req, res) {
  const haftalikModerasyon = require("./modules/haftalikModerasyon");
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
    res.json(`no need for a vacation`);
  }
}

module.exports = {
  dailyModeration,
};
