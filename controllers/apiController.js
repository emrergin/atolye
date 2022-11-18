const Oyku = require('../models/oyku');
const Taslak = require('../models/taslak');
const Kullanici = require('../models/kullanici');


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

async function draftCall(req,res){
  const relatedDraft = await Taslak.findById(req.params.id);
  res.json(relatedDraft);
}

async function draftUpdate(req,res){
  if(req.user){
    const relatedDraft = await Taslak.findById(req.params.id);
    if(!relatedDraft){
      res.json(404,"draft does not exist.");
    }
    if(relatedDraft.yazarObje.toString()!==req.user._id.toString()){
      res.json(401,`unauthorized`);
    }
    relatedDraft.baslik = req.body.baslik;
    relatedDraft.icerik = req.body.icerik;
    await relatedDraft.save();
  
    const relatedUser = await Kullanici.findById(req.user._id);
    const indexOfDraft = relatedUser.taslaklar.findIndex(a=>a.id===req.params.id);
    relatedUser.taslaklar[indexOfDraft].baslik=req.body.baslik;
    relatedUser.markModified('taslaklar');
    await relatedUser.save();
  
    res.json(relatedDraft);
  }
  else{
    res.json(401,`unauthorized`);
  }  
}



module.exports = {
  oykuler,
  oykulerKisa,
  haftaBilgisi,
  draftCall,
  draftUpdate
}