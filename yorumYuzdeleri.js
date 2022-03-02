
require('dotenv').config();

const Kullanici = require('./models/kullanici');
// const Server = require('../models/server');
// const Oyku = require('../models/oyku');
const Yorum = require('./models/yorum');
// const Kelime = require('../models/kelime');

const mongoose = require('mongoose');

async function yorumYuzdeleri(){
  const kontrolBaslangicTarihi = new Date();
  kontrolBaslangicTarihi.setMonth(kontrolBaslangicTarihi.getMonth() - 1);

  await mongoose.connect(process.env.MONGOURL, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: false
  });

  const degerlendirilecekYorumlar=await Yorum.find({createdAt: {$gt: kontrolBaslangicTarihi}},
                                                  {yorumcu:1,yazarOnayi:1,yorumcuOnayi:1,_id:0});
  // const uniqueYorumcular = [...new Set(degerlendirilecekYorumlar.map(item => item.yorumcu))]; 

  // for (yorum of degerlendirilecekYorumlar)
  const sonuc1= degerlendirilecekYorumlar.sort(compare).map(a=>{
    if (a.yorumcuOnayi && a.yazarOnayi){
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
 

  mongoose.disconnect();

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

yorumYuzdeleri();
