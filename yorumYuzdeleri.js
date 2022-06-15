
require('dotenv').config();

const Kullanici = require('./models/kullanici');
const Yorum = require('./models/yorum');

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

  let degerlendirilecekYorumlar=await Yorum.find({createdAt: {$gt: kontrolBaslangicTarihi}})
                      .select({yorumcu:1,yazarOnayi:1,yorumcuOnayi:1,_id:0}).exec();
  
  const sonuc1= degerlendirilecekYorumlar.sort(compare).map(a=>{
    return {yorumcu: a.yorumcu, deger: +(a.yorumcuOnayi && a.yazarOnayi!==false)}
  });

  let sonuc2=[];
  for (let satir of sonuc1){
    if ((sonuc2.length)&& (sonuc2[sonuc2.length-1].yorumcu.toString() === satir.yorumcu.toString())){
      sonuc2[sonuc2.length-1].deger+=satir.deger;
      sonuc2[sonuc2.length-1].sayac++;
    }
    else{
      satir.sayac=1;
      sonuc2.push(satir);
    }
  }
  
  for (let satir of sonuc2){
    satir.ortalama=satir.deger/satir.sayac;
  }

  for (let sonucSatiri of sonuc2){
    try{
      let doc = await Kullanici.findById(sonucSatiri.yorumcu);
      doc.yorumYuzdesi =sonucSatiri.ortalama;
      await doc.save();  
    }
    catch(e){
      console.log(e);
    }
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