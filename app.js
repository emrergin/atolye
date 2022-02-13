const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const oykuRoutes = require('./routes/oykuRoutes');
const uyeRoutes = require('./routes/uyeRoutes');
const apiRoutes = require('./routes/apiRoutes');

const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const Kullanici = require('./models/kullanici');
const Server = require('./models/server');

require('dotenv').config();

var compression = require('compression');
var helmet = require('helmet');

// express app
const app = express();

// connect to mongodb & listen for requests

mongoose.connect(process.env.MONGOURL, { useNewUrlParser: true, useUnifiedTopology: true })
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
app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// middleware & static files====================
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

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
//moderasyon
app.use(function(req, res, next) {
  async function haftaBul(){
    try{
      const moderasyonVerisi=await Server.findOne();
      let sonTarih=moderasyonVerisi.sonModerasyon;
      const bugununTarihi = new Date();
      const gunfark=(bugununTarihi-sonTarih)/1000/60/60/24;
      if (gunfark>7){
        await Kullanici.updateMany({katilim: "yazdi"},{  $set: { katilim:"yazmayacak" }  });
        await Kullanici.updateMany({katilim: "yazacak"},{  $set: { yetki:"deaktif" }  });
        await Server.updateOne({}, {$set: { sonModerasyon:Date.now() } });
      }      
    }
    catch (e) {
      console.log('caught', e);
    }
  }
  haftaBul();
  next();
});



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
  // console.log(mevcutMod);
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

app.get('/yeniYaz', (req, res) => {
  res.render('yaz', { title: 'Yaz' });
});

app.get('/geciciEkle', (req, res) => {
  res.render('create', { title: 'GeciciGiris'});
});

//uye routes

// routes
app.use('/uyeSayfa', uyeRoutes);
app.use('/api', apiRoutes);
app.use('/', oykuRoutes);




// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' ,user: req.user});
});