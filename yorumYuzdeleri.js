
require('dotenv').config();

const Kullanici = require('./models/kullanici');
// const Server = require('../models/server');
// const Oyku = require('../models/oyku');
const Yorum = require('./models/yorum');
// const Kelime = require('../models/kelime');

const mongoose = require('mongoose');

async function Baglan(){
  await mongoose.connect(process.env.MONGOURL, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: false
  });
}

async function yorumYuzdeleri(){
  const kontrolBaslangicTarihi = new Date();
  kontrolBaslangicTarihi.setMonth(kontrolBaslangicTarihi.getMonth() - 1);
  // await Baglan();

  let degerlendirilecekYorumlar=await Yorum.find({createdAt: {$gt: kontrolBaslangicTarihi}},
                                                  {yorumcu:1,yazarOnayi:1,yorumcuOnayi:1,_id:0});
  
  const sonuc1= degerlendirilecekYorumlar.sort(compare).map(a=>{
    if (a.yorumcuOnayi && a.yazarOnayi!==false){
      return {yorumcu: a.yorumcu, deger: 1}
    }else{
      return {yorumcu: a.yorumcu, deger: 0}
    }
  });
  let sonuc2=[];
  for (satir of sonuc1){
    if ((sonuc2.length)&& (sonuc2[sonuc2.length-1].yorumcu===satir.yorumcu)){
      sonuc2[sonuc2.length-1].deger+=satir.deger;
      sonuc2[sonuc2.length-1].sayac++;
    }
    else{
      satir.sayac=1;
      sonuc2.push(satir);
    }
  }
  for (satir of sonuc2){
    satir.ortalama=satir.deger/satir.sayac;
  }

  for (sonucSatiri of sonuc2){
    await Kullanici.findById(sonucSatiri.yorumcu, function (err, doc) {
      if (err){
        console.log(err)
      }
      doc.yorumYuzdesi =sonucSatiri.ortalama;
      doc.save()      
        .catch(err => {
          console.log(err);
        });
    });  
  } 

  function compare( a, b ) {
    if ( a.yorumcu < b.yorumcu ){
      return -1;
    }
    if ( a.yorumcu > b.yorumcu ){
      return 1;
    }
    return 0;
  }
}

async function yorumDeaktifTemizligi(){
  // await Baglan();
  let gidenler=await Kullanici.find({aktif: false},{_id:1});
  if (gidenler.length){
    gidenler=gidenler.map(a=>a._id.toString());
    await Yorum.find({ yorumcu: { $in: gidenler}}).remove();
    await Yorum.find({ yazar: { $in: gidenler}}).update( { $set: { yazarOnayi: true } } );
  }
}

(async function (){
  await Baglan();
  await yorumDeaktifTemizligi();
  await yorumYuzdeleri();
  mongoose.disconnect();
})();
