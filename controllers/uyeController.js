const Kullanici = require('../models/kullanici');
const Kelime = require('../models/kelime');

const uyeMain = (req, res) => {
  if (!res.locals.currentUser){
    res.redirect('/oykuler');
  }
  else{
    res.render('uyeSayfa', { title: 'Üye Anasayfa'});
  }  
}


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
    Kelime.aggregate(
      [ 
        { $sample: { size: 3 } } ,
        { $project: { kelime: 1,  _id: 0,} }
      ]
   )
    .then(result => {
      res.render('admin', { title: 'Yönetici Sayfası', kelimeler:result});
    })
    .catch(err => {
      console.log(err);
    });
  }
}


module.exports = {
  uyeMain,
  yazToggle,
  yetkiliSayfa
}