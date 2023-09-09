const Kullanici = require("../models/kullanici");
const Server = require("../models/server");
const Yorum = require("../models/yorum");
const Taslak = require("../models/taslak");

// UTILITIES===================================
var wrapURLs = function (text, new_window) {
  var url_pattern =
    /(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\x{00a1}\-\x{ffff}0-9]+-?)*[a-z\x{00a1}\-\x{ffff}0-9]+)(?:\.(?:[a-z\x{00a1}\-\x{ffff}0-9]+-?)*[a-z\x{00a1}\-\x{ffff}0-9]+)*(?:\.(?:[a-z\x{00a1}\-\x{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?/gi;
  var target = new_window === true || new_window == null ? "_blank" : "";

  return text.replace(url_pattern, function (url) {
    var protocol_pattern = /^(?:(?:https?|ftp):\/\/)/i;
    var href = protocol_pattern.test(url) ? url : "http://" + url;
    return '<a href="' + href + '" target="' + target + '">' + `Link` + "</a>";
  });
};

// ===================================

async function uyeMain(req, res) {
  if (!res.locals.currentUser) {
    res.redirect("/oykuler");
  } else {
    const [server, yazarlar, yorumlar, onaylar] = await Promise.all([
      Server.findOne().exec(),
      Kullanici.find({}, { _id: 0, gercekAd: 1, katilim: 1 }).exec(),
      Yorum.find(
        { yorumcu: res.locals.currentUser._id, yorumcuOnayi: false },
        { yorumcuOnayi: 1, baslik: 1, link: 1 }
      ).exec(),
      Yorum.find(
        {
          yazar: res.locals.currentUser._id,
          yorumcuOnayi: true,
          yazarOnayi: null,
        },
        { yazarOnayi: 1, baslik: 1, link: 1, yorumcuIsim: 1 }
      ).exec(),
    ]);

    res.render("uyeSayfa", {
      title: "Üye Anasayfa",
      gorev: wrapURLs(server.gorev),
      yazarlar,
      yorumlar,
      onaylar,
    });
  }
}

async function yazToggle(req, res) {
  const userToUpdate = await Kullanici.findById(req.user._id);
  userToUpdate.katilim = req.body.katilim;
  await userToUpdate.save();
  res.redirect(303, "/uyeSayfa/");
}

async function yorumToggle1(req, res) {
  const id = req.params.id;
  const commentToUpdate = await Yorum.findById(id);
  commentToUpdate.yorumcuOnayi = req.body.yorumladim;
  await commentToUpdate.save();
  res.redirect(303, "/uyeSayfa/");
}

async function yorumToggle2(req, res) {
  const id = req.params.id;
  const commentToUpdate = await Yorum.findById(id);
  commentToUpdate.yazarOnayi = req.body.onayladim;
  await commentToUpdate.save();
  res.redirect(303, "/uyeSayfa/");
}

async function yetkiliSayfa(req, res) {
  if (!res.locals.currentUser || !res.locals.currentUser.admin) {
    res.redirect("/oykuler");
  } else {
    const [server, yazarlar] = await Promise.all([
      Server.findOne().exec(),
      Kullanici.find(
        { aktif: true },
        { _id: 0, gercekAd: 1, yorumYuzdesi: 1, sekil: 1, katilim: 1, aktif: 1 }
      ).exec(),
    ]);

    res.render("admin", {
      title: "Yönetici Sayfası",
      gorev: server.gorev,
      yazarlar,
    });
  }
}

async function gorevBelirleme(req, res) {
  if (req.user.admin) {
    const server = await Server.findOne({});
    server.gorev = req.body.gorev;
    await server.save();
    res.redirect(303, "./yetkili");
  } else if (req.user) {
    res.redirect("/uyeSayfa");
  } else {
    res.redirect("/uyeGirisi");
  }
}

async function haftaTatili(req, res) {
  if (req.user.admin) {
    await Kullanici.updateMany(
      { katilim: "yazacak" },
      { $set: { katilim: "yazmayacak" } }
    );
    res.redirect(303, "/yetkili");
  } else if (req.user) {
    res.redirect("/uyeSayfa");
  } else {
    res.redirect("/uyeGirisi");
  }
}

module.exports = {
  uyeMain,
  yazToggle,
  yetkiliSayfa,
  gorevBelirleme,
  yorumToggle1,
  yorumToggle2,
  haftaTatili,
};
