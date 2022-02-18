const Kullanici = require('../models/kullanici');
const Server = require('../models/server');
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
    },function(err, results) {
      if (err) { return next(err); }

      res.render('uyeSayfa', { title: 'Üye Anasayfa' , gorev: results.gorev.gorev, yazarlar: results.yazarlar});

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

const yetkiliSayfa = (req, res) => {
  if (!res.locals.currentUser || !res.locals.currentUser.admin){
    res.redirect('/oykuler');
  }
  else{
    Server.findOne()
    .then((ser) => {
      res.render('admin', { title: 'Yönetici Sayfası' , gorev: ser.gorev});
    })
    .catch(err => {
      console.log(err);
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
  gorevBelirleme
}