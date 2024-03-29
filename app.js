const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const oykuRoutes = require("./routes/oykuRoutes");
const uyeRoutes = require("./routes/uyeRoutes");
const apiRoutes = require("./routes/apiRoutes");
const moderationRoutes = require("./routes/moderationRoutes");

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const Kullanici = require("./models/kullanici");

require("dotenv").config();

var compression = require("compression");
var helmet = require("helmet");

// express app
require("express-async-errors");
const app = express();
app.use(compression());

// connect to mongodb & listen for requests

mongoose
  .connect(process.env.MONGOURL)
  .then((result) => app.listen(process.env.PORT || 3000))
  .catch((err) => console.log(err));

// register view engine
app.set("view engine", "ejs");

passport.use(
  new LocalStrategy(async function (username, password, done) {
    try {
      const user = await Kullanici.findOne({ username: username.trim() });
      if (!user) {
        return done(null, false, { message: "Kullanıcı adı yanlış." });
      }
      if (user.password.trim() !== password) {
        return done(null, false, { message: "Parola yanlış." });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Kullanici.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGOURL,
      touchAfter: 24 * 3600,
      autoRemove: "interval",
      autoRemoveInterval: 60 * 24,
    }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// middleware & static files====================
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(compression());
app.use(helmet());

app.post(
  "/uyeGirisi",
  passport.authenticate("local", {
    successRedirect: "/uyeSayfa",
    failureRedirect: "/",
  })
);
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

//Date functions
app.use(function (req, res, next) {
  const d = new Date();
  d.setHours(d.getHours() + 3);
  let mevcutMod = "";
  let modcounter = d.getDay();

  switch (modcounter) {
    case 0:
    case 5:
    case 6:
      mevcutMod = "Öykü Yazma";
      break;
    case 3:
      mevcutMod = "Taahhüt";
      break;
    case 1:
    case 2:
      mevcutMod = "Taahhüt Öncesi";
      break;
    default:
      mevcutMod = "Taahhüt Sonrası";
  }
  app.locals.mevcutMod = mevcutMod;
  next();
});

// routes
app.get("/uyeCikisi", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/uyeGirisi", (req, res) => {
  res.render("login", { title: "Üye Girişi" });
});

app.get("/", (req, res) => {
  res.redirect("/oykuler/");
});

app.get("/hakkinda", (req, res) => {
  res.render("about", { title: "Hakkında" });
});

// subroutes
app.use("/cronCall", moderationRoutes);
app.use("/uyeSayfa", uyeRoutes);
app.use("/api", apiRoutes);
app.use("/", oykuRoutes);

// 404 page
app.use((req, res) => {
  res.status(404).render("404", { title: "404", user: req.user });
});
