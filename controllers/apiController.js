const Oyku = require('../models/oyku');


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


module.exports = {
  oykuler,
  oykulerKisa
}