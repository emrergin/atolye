// require('dotenv').config({path: '../.env'});
// require('dotenv').config();

// connect to mongodb & listen for requests

const Kullanici = require('../models/kullanici');
const Server = require('../models/server');
const Oyku = require('../models/oyku');
const Yorum = require('../models/yorum');
const Kelime = require('../models/kelime');

module.exports = async function haftalikModerasyon(){
    try{
      const moderasyonVerisi=await Server.findOne();
      let sonTarih=moderasyonVerisi.sonModerasyon;
      const bugununTarihi = new Date();
      const gunfark=(bugununTarihi-sonTarih)/1000/60/60/24;
      const eklenecekGun=7*Math.floor(gunfark/7);
      if (gunfark>=7){
          await Server.updateOne({}, {$set: { sonModerasyon:sonTarih.setDate(sonTarih.getDate() + eklenecekGun)} });
          await Kullanici.updateMany({katilim: "yazacak"},{  $set: { aktif: false }  });
          await yorumDeaktifTemizligi();
          await yorumYuzdeleri();
          await yorumAta();      
          await Promise.all([yorumYuzdeleri(),
                             gorevYenile(),
                             Kullanici.updateMany({katilim: "yazdi"},{  $set: { katilim:"yazmayacak" }  })]);         
      }
    }
    catch (e) {
      console.log('caught', e);
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
    let gidenler=await Kullanici.find({aktif: false},{_id:1});
    if (gidenler.length){
      gidenler=gidenler.map(a=>a._id.toString());
      await Yorum.find({ yorumcu: { $in: gidenler}}).remove();
      await Yorum.find({ yazar: { $in: gidenler}}).update( { $set: { yazarOnayi: true } } );
    }
  }
  
  async function yorumAta(){
    let yorumlanacaklar= await Oyku.find({ yorumAtamasi: false },{yazarObje:1,baslik:1,link: 1}).populate('yazarObje','yorumYuzdesi');
    let yorumlayacaklar= await Kullanici.find({ aktif: true, sekil: "okurYazar"},{_id:1,yorumYuzdesi:1, gercekAd:1});

    if (yorumlanacaklar.length && (yorumlayacaklar.length>1))
    {
      let topAgirlik=0;
      for (oyku of yorumlanacaklar){
        topAgirlik+=parseFloat(oyku.yazarObje.yorumYuzdesi);
      }
      if (topAgirlik!==0){
        let toplamYorumSayisi=yorumlayacaklar.length*3;
  
        let oykuMatrisi=[];
        for (let j = 0; j < yorumlanacaklar.length ;j++) {
          let oObj={};
          oObj._id=yorumlanacaklar[j]._id;
          oObj.baslik= yorumlanacaklar[j].baslik;
          oObj.link=yorumlanacaklar[j].link;
          oObj.yazarObje=yorumlanacaklar[j].yazarObje;
          let agirlik=parseFloat(yorumlanacaklar[j].yazarObje.yorumYuzdesi)/topAgirlik;
          oObj.yakYorumSayisi=Math.min(Math.floor(toplamYorumSayisi*agirlik),yorumlayacaklar.length-1);
          oObj.indis=j;
          oykuMatrisi.push(oObj);
        }
  
        // Yorum Dagitimi burada basliyor=====================
        var yorumMatrisi=[];
        var tamamMatrisi=[];
        
        oykuMatrisi.filter(i => i.yakYorumSayisi<=0).map((bitenOyku)=>{
          tamamMatrisi.push(bitenOyku._id);
        });
        oykuMatrisi=shuffle(oykuMatrisi.filter(i => i.yakYorumSayisi));
        yorumlayacaklar=shuffle(yorumlayacaklar);
  
        for (yorumcu of yorumlayacaklar){
          let buKisininYorumlayabilecegiOykuler=oykuMatrisi.filter(i=> (i.yazarObje._id.toString() !== yorumcu._id.toString()));
          let secilenler=buKisininYorumlayabilecegiOykuler.slice(0, 3);
  
          for (secilenOyku of secilenler){

            let yorumObje={};
            yorumObje.baslik=secilenOyku.baslik;
            yorumObje.link=secilenOyku.link;
            yorumObje.yorumlayan=yorumcu._id;
            yorumObje.gercekAd=yorumcu.gercekAd;
            yorumObje.yorumlanan=secilenOyku.yazarObje._id;
            yorumMatrisi.push(yorumObje);
            let indeks=oykuMatrisi.findIndex(a=>a.indis===secilenOyku.indis);
            oykuMatrisi[indeks].yakYorumSayisi-=1;
          }
          
          oykuMatrisi.filter(i => i.yakYorumSayisi<=0).map((bitenOyku)=>{
            tamamMatrisi.push(bitenOyku._id);
          });
          oykuMatrisi=oykuMatrisi.filter(i => i.yakYorumSayisi>0).sort((a, b) => b.yakYorumSayisi-a.yakYorumSayisi);
  
          if (!oykuMatrisi.length){
            break;
          }
        }
        //hala yorumlari tamamlanmamis varsa, tamamla.
        oykuMatrisi.map((bitenOyku)=>{
          tamamMatrisi.push(bitenOyku._id);
        });          
        
      }
      for await (yorum of yorumMatrisi){
        const yYorum= new Yorum({
          baslik: yorum.baslik,
          link: yorum.link,
          yazar: yorum.yorumlanan,
          yorumcu: yorum.yorumlayan,
          yorumcuIsim: yorum.gercekAd,
        })
        await yYorum.save();
      }
 
      for await (bitenOyku of tamamMatrisi){
        await Oyku.updateOne({_id: bitenOyku}, {$set: { yorumAtamasi: true} }); 
      }
    }
  }
  
  async function gorevYenile(){
    try{
      const yazanlar=await Kullanici.find({katilim: "yazdi"}); 
      if (yazanlar.length){
        const yeniKelimeler= await Kelime.aggregate(
          [ 
            { $sample: { size: 3 } } ,
            { $project: { kelime: 1,  _id: 0,} }
          ]
        );
        await Server.updateOne({}, {$set: { gorev:yeniKelimeler.map(a => a.kelime).join(', ')} });
      }
    }
    catch (e) {
      console.log('caught', e);
    }
  }
  
  function shuffle(array) {
    let resArray=array;
    for (let i = resArray.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [resArray[i], resArray[j]] = [resArray[j], resArray[i]];
    }
    return resArray;
  }  
}
