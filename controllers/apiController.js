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


module.exports = {
  oykuler
}