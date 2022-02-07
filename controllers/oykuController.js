const Oyku = require('../models/oyku');
const async = require(`async`);

const oyku_index = (req, res,next) => {
  async.parallel({
      oykuler: function(callback) {
        Oyku.find().sort({ hafta: -1 })
        .exec(callback);
      },
      yazarlar: function(callback) {
        Oyku.distinct("yazar")
        .exec(callback);
      },
      haftalar: function(callback){
        Oyku.distinct("hafta")
        .exec(callback);
      }
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.oykuler==null) { // No results.
          var err = new Error('Böyle bir öykü yok.');
          err.status = 404;
          return next(err);
      }
      // Successful, so render.
      siraliYazarlar=results.yazarlar.sort(function (a, b) {
        return a.localeCompare(b);
      });
      res.render('index', { title: 'Bütün Öyküler',
                         oykuler: results.oykuler, 
                         haftalar: results.haftalar, 
                         yazarlar:siraliYazarlar,
                         buHafta:`/`, buYazar:`/`} );
  });
};

const hafta_index = (req, res,next) => {
  const hafta = req.params.hafta;
  async.parallel({
      oykuler: function(callback) {
        Oyku.find({"hafta": hafta}).sort({ createdAt: -1 })
        .exec(callback);
      },
      yazarlar: function(callback) {
        Oyku.distinct("yazar")
        .exec(callback);
      },
      haftalar: function(callback){
        Oyku.distinct("hafta")
        .exec(callback);
      }
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.oykuler==null) { // No results.
          var err = new Error('Hafta Bulunamadı.');
          err.status = 404;
          return next(err);
      }
      // Successful, so render.
      siraliYazarlar=results.yazarlar.sort(function (a, b) {
        return a.localeCompare(b);
      });
      res.render('index', { title: `Hafta ${hafta}`, 
                            oykuler: results.oykuler, 
                            haftalar: results.haftalar, 
                            yazarlar:siraliYazarlar, 
                            buYazar:`/`, buHafta:hafta} );
  });
};


const yazar_index = (req, res,next) => {
  const yazar = decodeURI(req.params.yazar);
  async.parallel({
      oykuler: function(callback) {
        Oyku.find({"yazar": yazar}).sort({ hafta: -1 })
        .exec(callback);
      },
      yazarlar: function(callback) {
        Oyku.distinct("yazar")
        .exec(callback);
      },
      haftalar: function(callback){
        Oyku.distinct("hafta")
        .exec(callback);
      }
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.oykuler==null) { // No results.
          var err = new Error('Böyle Bir Yazar Yok.');
          err.status = 404;
          return next(err);
      }
      // Successful, so render.
      siraliYazarlar=results.yazarlar.sort(function (a, b) {
        return a.localeCompare(b);
      });
      res.render('index', { title: `${yazar}`, 
                            oykuler: results.oykuler, 
                            haftalar: results.haftalar, 
                            yazarlar:siraliYazarlar, 
                            buHafta:`/`, buYazar:yazar} );
  });
};

const rastgele_oyku = (req, res,next) => {
  async.parallel({
      oykuler: function(callback) {
        Oyku.aggregate([{ $sample: { size: 1 } }])
        .exec(callback);
      },
      yazarlar: function(callback) {
        Oyku.distinct("yazar")
        .exec(callback);
      },
      haftalar: function(callback){
        Oyku.distinct("hafta")
        .exec(callback);
      }
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.oykuler==null) { // No results.
          var err = new Error('Bir Şeyler Ters Gitti.');
          err.status = 404;
          return next(err);
      }
      // Successful, so render.
      siraliYazarlar=results.yazarlar.sort(function (a, b) {
        return a.localeCompare(b);
      });
      res.render('index', { title: "Rastgele Öykü",
                           oykuler: results.oykuler, 
                           haftalar: results.haftalar, 
                           yazarlar:siraliYazarlar,
                           buHafta:`/`, buYazar:`/`} );
  });
};

// const blog_create_get = (req, res) => {
//   res.render('create', { title: 'Create a new blog' });
// }

const oyku_yeni = (req, res) => {
  if (req.user){
    const oyku = new Oyku({
      hafta: -1,
      yazar: req.user.gercekAd,
      baslik: "Demostan",
      link: "demonk",
      metin: req.body.metin,
    });
    oyku.save()
      .then(() => {
        res.redirect('/oykuler');
      })
      .catch(err => {
        console.log(err);
      });
  }
  else{
    res.redirect('/uyeGirisi');
  }
}

const oyku_gecici = (req, res) => {
  if (req.user){
    const oyku = new Oyku(req.body);
    oyku.save()
      .then(() => {
        res.redirect('/oykuler');
      })
      .catch(err => {
        console.log(err);
      });
  }
  else{
    res.redirect('/uyeGirisi');
  }
}


// const blog_delete = (req, res) => {
//   const id = req.params.id;
//   Blog.findByIdAndDelete(id)
//     .then(result => {
//       res.json({ redirect: '/blogs' });
//     })
//     .catch(err => {
//       console.log(err);
//     });
// }

module.exports = {
  oyku_index,
  hafta_index,
  yazar_index,
  oyku_yeni,
  rastgele_oyku,
  oyku_gecici
  // , 
  // blog_details, 
  // blog_create_get, 
  // blog_create_post, 
  // blog_delete
}