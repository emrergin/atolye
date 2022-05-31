const Oyku = require('../models/oyku');
const Kelime = require('../models/kelime');


const oykuler = (req, res) => {
  Oyku.find({},{ hafta: 1, yazar: 1, baslik:1, link:1}).sort({ createdAt: -1 })
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.log(err);
    });
}

const oykulerKisa = (req, res) => {
  Oyku.find({},{ hafta: 1, yazar: 1, baslik:1, link:1,_id:0}).sort({ createdAt: -1 })
    .then(result => {
      result=result.map(a=>[`Hafta ${a.hafta}`, a.yazar, a.baslik, a.link]);
      res.json(result);
    })
    .catch(err => {
      console.log(err);
    });
}

const haftaBilgisi = (req, res) => {
  Oyku.find({},{ createdAt: 1,_id:0}).sort({ createdAt: -1 })
    .then(result => {
      result=result.map(a=>new Date(a.createdAt));
      result=result.map(a=>new Date(a.setDate(a.getDate() - a.getDay())));
      result=result.map(a=>a.toLocaleString("tr-TR", {year: 'numeric', month: 'numeric', day: 'numeric'}));
      result= [...new Set(result)];
      res.json(result.slice(0, -1));
    })
    .catch(err => {
      console.log(err);
    });
}

// const kelimeGetir = (req, res) => {
//   const adet = Math.min(decodeURI(req.params.adet),10);
//   Kelime.aggregate(
//     [ 
//       { $sample: { size: +adet } } ,
//       { $project: { kelime: 1,  _id: 0,} }
//     ]
//   )
//   .then(result => {
//     result=result.map(a=>a.kelime);
//     res.json(result);
//   })
//   .catch(err => {
//     console.log(err);
//   });
// }


module.exports = {
  oykuler,
  oykulerKisa,
  haftaBilgisi
}