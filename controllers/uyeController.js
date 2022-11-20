const Kullanici = require('../models/kullanici');
const Server = require('../models/server');
const Yorum = require('../models/yorum');
const Taslak = require('../models/taslak');
const async = require(`async`);

// UTILITIES===================================
var wrapURLs = function (text, new_window) {
  var url_pattern = /(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\x{00a1}\-\x{ffff}0-9]+-?)*[a-z\x{00a1}\-\x{ffff}0-9]+)(?:\.(?:[a-z\x{00a1}\-\x{ffff}0-9]+-?)*[a-z\x{00a1}\-\x{ffff}0-9]+)*(?:\.(?:[a-z\x{00a1}\-\x{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?/ig;
  var target = (new_window === true || new_window == null) ? '_blank' : '';
  
  return text.replace(url_pattern, function (url) {
    var protocol_pattern = /^(?:(?:https?|ftp):\/\/)/i;
    var href = protocol_pattern.test(url) ? url : 'http://' + url;
    return '<a href="' + href + '" target="' + target + '">' + `Link` + '</a>';
  });
};

// ===================================

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
        Kullanici.find({},{_id:0, gercekAd:1, katilim:1})
        .exec(callback);
      },
      yorumlar: function(callback) {
        Yorum.find({yorumcu: res.locals.currentUser._id, yorumcuOnayi: false},{yorumcuOnayi:1,baslik:1,link:1})
        .exec(callback);
      },
      onaylar: function(callback) {
        Yorum.find({yazar: res.locals.currentUser._id, yorumcuOnayi: true, yazarOnayi:null},{yazarOnayi:1,baslik:1,link:1, yorumcuIsim:1})
        .exec(callback);
      },
    },function(err, results) {
      if (err) { return next(err); }

      res.render('uyeSayfa', {title: 'Üye Anasayfa' ,
                              gorev: wrapURLs(results.gorev.gorev), 
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
        Kullanici.find({aktif: true},{_id:0, gercekAd:1, yorumYuzdesi:1, sekil:1, katilim:1,aktif:1})
        .exec(callback);
      },
      },function(err, results) {
        if (err) { return next(err); }
      
        res.render('admin', { title: 'Yönetici Sayfası' ,
                              gorev:results.gorev.gorev,
                              yazarlar: results.yazarlar
                            });                             
      
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

const haftaTatili = (req, res) => {
  if (req.user.admin){
    Kullanici.updateMany({katilim: "yazacak"},{  $set: { katilim:"yazmayacak" }  })
      .then(() => {
        res.redirect(303,'/yetkili');
      })
      .catch(err => {
        console.log(err);
      });
  }
  else if(req.user){
    res.redirect('/uyeSayfa');
  }
  else{
    res.redirect('/uyeGirisi');
  }
}

const yeniTaslak = (req, res) => {
  if(req.user){
    Kullanici.findById(req.user._id, function (err, doc) {
      if (err){
        console.log(err)
      }

      const taslak = new Taslak({...req.body,yazarObje: req.user._id});
      taslak.save().then(()=>{
        doc.taslaklar = [...doc.taslaklar,{id:taslak._id.toString(),baslik:taslak.baslik}];
        doc.save()
        .then(() => {
          res.json(req.user);
        })  
      })   
      
      .catch(err => {
        console.log(err);
      });
    });
  }
  else{
    res.json("login error");
  }
}

async function taslakSil(req,res){
  const relatedDraft = await Taslak.findById(req.params.id);
  if(req.user && req.user._id.toString()===relatedDraft.yazarObje.toString()){
    
    const user = await Kullanici.findById(req.user._id);
    user.taslaklar = user.taslaklar.filter(a=>a.id!==req.params.id);
    await user.save();
    await relatedDraft.remove();
    res.json("success");
  }
  else{
    res.json("unauthorized");
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
  yeniTaslak,
  taslakSil
}