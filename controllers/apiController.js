const Oyku = require('../models/oyku');
// actual controllers=========
// const uyeMain = (req, res) => {
//   if (!res.locals.currentUser){
//     res.redirect('/oykuler');
//   }
//   else{
//     res.render('uyeSayfa', { title: 'Üye Anasayfa'});
//   }  
// }


const oykuler = (req, res) => {
  Oyku.find().sort({ createdAt: -1 })
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