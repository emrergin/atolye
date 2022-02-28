const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const oykuRoutes = require('./routes/oykuRoutes');
const uyeRoutes = require('./routes/uyeRoutes');
const apiRoutes = require('./routes/apiRoutes');

const session = require("express-session");
const MemoryStore = require('memorystore')(session)
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const Kullanici = require('./models/kullanici');

require('dotenv').config();

var compression = require('compression');
var helmet = require('helmet');

// express app
const app = express();

// connect to mongodb & listen for requests

mongoose.connect(process.env.MONGOURL, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(result => app.listen(process.env.PORT || 3000))
  .catch(err => console.log(err));

// register view engine
app.set('view engine', 'ejs');

// kullanicilar vs.
passport.use(
  new LocalStrategy((username, password, done) => {    
    Kullanici.findOne({ username: username }, (err, user) => {
      if (err) { 
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Kullanıcı adı yanlış." });
      }
      if (user.password !== password) {
        return done(null, false, { message: "Parola yanlış." });
      }
      return done(null, user);
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Kullanici.findById(id, function(err, user) {
    done(err, user);
  });
});
app.use(session({
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret: process.env.SECRET, 
  resave: false, 
  saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());

// middleware & static files====================
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(compression());
app.use(helmet({
  //buranin incelenmesi lazim.
  contentSecurityPolicy: false,
}));

app.post(
  "/uyeGirisi",
  passport.authenticate("local", {
    successRedirect: "/uyeSayfa",
    failureRedirect: "/"
  })
);
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});
// moderasyon
// app.use(function (req, res, next) {  
//   const haftalikModerasyon=require('./modules/haftalikModerasyon');
//   haftalikModerasyon();
//   next();
// });

//Date functions
app.use(function(req, res, next) {
  const d=new Date();
  d.setHours(d.getHours() + 3);
  let mevcutMod="";
  // let modcounter=d.getMinutes()%7;

  let modcounter=d.getDay();

  switch (modcounter) {
    case 0:
    case 5:
    case 6:
      mevcutMod="Öykü Yazma";
      break;
    case 3:
      mevcutMod="Taahhüt";
      break;
    default:
      mevcutMod="-";
  }
  app.locals.mevcutMod = mevcutMod;
  next();
});

// routes
app.get("/uyeCikisi", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get('/uyeGirisi', (req, res) => {
  res.render('login', { title: 'Üye Girişi'});
});


app.get('/', (req, res) => {
  res.redirect('/oykuler');
});

app.get('/hakkinda', (req, res) => {
  res.render('about', { title: 'Hakkında'});
});


app.get('/geciciEkle', (req, res) => {
  res.render('create', { title: 'GeciciGiris'});
});


// subroutes
app.use('/uyeSayfa', uyeRoutes);
app.use('/api', apiRoutes);
app.use('/', oykuRoutes);


// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' ,user: req.user});
});