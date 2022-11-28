const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const oykuRoutes = require('./routes/oykuRoutes');
const uyeRoutes = require('./routes/uyeRoutes');
const apiRoutes = require('./routes/apiRoutes');

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const Kullanici = require('./models/kullanici');

require('dotenv').config();

var compression = require('compression');
var helmet = require('helmet');

// express app
require('express-async-errors')
const app = express();
app.use(compression());

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
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGOURL , 
    touchAfter: 24 * 3600,
    autoRemove: 'interval',
    autoRemoveInterval: 60 * 24
  }),  
  secret: process.env.SECRET, 
  resave: false, 
  saveUninitialized: false 
}));
app.use(passport.initialize());
app.use(passport.session());

// middleware & static files====================
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(compression());
app.use(helmet());

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

//Date functions
app.use(function(req, res, next) {
  const d=new Date();
  d.setHours(d.getHours() + 3);
  let mevcutMod="";
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
app.get("/uyeCikisi", (req, res,next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.get('/uyeGirisi', (req, res) => {
  res.render('login', { title: 'Üye Girişi'});
});


app.get('/', (req, res) => {
  res.redirect('/oykuler/');
});

app.get('/hakkinda', (req, res) => {
  res.render('about', { title: 'Hakkında'});
});

// moderasyon
app.get('/cronCall', async (req, res)=> {  
  const haftalikModerasyon=require('./modules/haftalikModerasyon');
  const week= await haftalikModerasyon();
  res.json(`moderation for week ${week} is complete.`);
});

// subroutes
app.use('/uyeSayfa', uyeRoutes);
app.use('/api', apiRoutes);
app.use('/', oykuRoutes);


// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' ,user: req.user});
});