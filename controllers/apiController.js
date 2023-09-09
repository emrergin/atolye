const Oyku = require("../models/oyku");
const Taslak = require("../models/taslak");
const Kullanici = require("../models/kullanici");

const databaseAccessers = require("../controllers/databaseAccessers");

async function oykuler(req, res) {
  const oykuler = await databaseAccessers.getStories({});
  res.json(oykuler);
}

async function oykulerKisa(req, res) {
  let oykuler = await databaseAccessers.getStories({});
  oykuler = oykuler.map((a) => [`Hafta ${a.hafta}`, a.yazar, a.baslik, a.link]);
  res.json(oykuler);
}

async function haftaBilgisi(req, res) {
  const haftalar = await databaseAccessers.getWeeks({});
  res.json(haftalar);
}

async function storiesWithPagination(req, res) {
  const totalNumberOfStories = await Oyku.countDocuments();
  const perPage = 10;
  let sayfa = req.params.sayfa || 1;
  sayfa = Math.min(sayfa, Math.floor(totalNumberOfStories / perPage));

  Oyku.find({}, { hafta: 1, yazar: 1, baslik: 1, link: 1 })
    .limit(perPage)
    .skip(perPage * (sayfa - 1))
    .sort({ createdAt: -1 })
    .exec(function (err, oykuler) {
      if (err) {
        return next(err);
      }
      res.json(oykuler);
    });
}

async function randomStory(req, res) {
  const rastgeleOyku = await Oyku.aggregate([{ $sample: { size: 1 } }]);
  res.json(rastgeleOyku[0].link.replace("/edit", "/preview"));
}

module.exports = {
  oykuler,
  oykulerKisa,
  haftaBilgisi,
  storiesWithPagination,
  randomStory,
};
