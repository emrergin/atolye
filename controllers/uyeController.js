const Kullanici = require('../models/kullanici');
const Server = require('../models/server');
const Yorum = require('../models/yorum');
const async = require(`async`);

const uyeMain = (req, res) => {
  if (!res.locals.currentUser){
    res.redirect('/oykuler');
  }
  else{
    async.parallel({
      gorev: function(callback) {
        Server.findOne()
        .exec(callback);
      },
      yazarlar: function(callback) {
        Kullanici.find({katilim: "yazacak"},{_id:0, gercekAd:1})
        .exec(callback);
      },
      yorumlar: function(callback) {
        Yorum.find({yorumcu: res.locals.currentUser._id, yorumcuOnayi: false},{yorumcuOnayi:1,baslik:1,link:1})
        .exec(callback);
      },
      onaylar: function(callback) {
        Yorum.find({yazar: res.locals.currentUser._id, yorumcuOnayi: true, yazarOnayi:null},{yazarOnayi:1,baslik:1,link:1})
        .exec(callback);
      },
    },function(err, results) {
      if (err) { return next(err); }

      res.render('uyeSayfa', {title: 'Üye Anasayfa' ,
                              gorev: results.gorev.gorev, 
                              yazarlar: results.yazarlar, 
                              yorumlar: results.yorumlar,
                              onaylar: results.onaylar});

    });
  } 
};



const yazToggle = (req,res)=>{
  Kullanici.findById(req.user._id, function (err, doc) {
    if (err){
      console.log(err)
    }
    doc.katilim = req.body.katilim;
    doc.save()      
      .then(() => {
        res.redirect(303,'/uyeSayfa/');
      })
      .catch(err => {
        console.log(err);
      });
  });
}

const yorumToggle1 = (req,res)=>{
  const id = req.params.id;
  Yorum.findById(id, function (err, doc) {
    if (err){
      console.log(err)
    }
    doc.yorumcuOnayi = req.body.yorumladim;
    doc.save()      
      .then(() => {
        res.redirect(303,'/uyeSayfa/');
      })
      .catch(err => {
        console.log(err);
      });
  });
}

const yorumToggle2 = (req,res)=>{
  const id = req.params.id;
  Yorum.findById(id, function (err, doc) {
    if (err){
      console.log(err)
    }
    doc.yazarOnayi = req.body.onayladim;
    doc.save()      
      .then(() => {
        res.redirect(303,'/uyeSayfa/');
      })
      .catch(err => {
        console.log(err);
      });
  });
}

const yetkiliSayfa = (req, res) => {
  if (!res.locals.currentUser || !res.locals.currentUser.admin){
    res.redirect('/oykuler');
  }
  else{
    async.parallel({
      gorev: function(callback) {
        Server.findOne()
        .exec(callback);
      },
      yazarlar: function(callback) {
        Kullanici.find({katilim: "yazacak"},{_id:0, gercekAd:1})
        .exec(callback);
      },
      },function(err, results) {
        if (err) { return next(err); }
      
        res.render('admin', { title: 'Yönetici Sayfası' ,
                              gorev:results.gorev.gorev,
                              yazarlar: results.yazarlar.map(a => a.gercekAd).join(', ')});                             
      
      });
  }
}


const gorevBelirleme = (req, res) => {
  if (req.user.admin){
    Server.findOne({},function (err, doc) {
        if (err){
          console.log(err)
        }
        doc.gorev = req.body.gorev;
        doc.save()      
          .then(() => {
            res.redirect(303,'./yetkili');
          })
          .catch(err => {
            console.log(err);
          });
      });
  }
  else if(req.user){
    res.redirect('/uyeSayfa');
  }
  else{
    res.redirect('/uyeGirisi');
  }
}

module.exports = {
  uyeMain,
  yazToggle,
  yetkiliSayfa,
  gorevBelirleme,
  yorumToggle1,
  yorumToggle2
}