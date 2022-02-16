const Kullanici = require('../models/kullanici');
const Server = require('../models/server');
const Oyku = require('../models/oyku');
const Yorum = require('../models/yorum');

module.exports = function (req, res, next) {
  async function haftalikModerasyon(){
    try{
      const moderasyonVerisi=await Server.findOne();
      let sonTarih=moderasyonVerisi.sonModerasyon;
      const bugununTarihi = new Date();
      const gunfark=(bugununTarihi-sonTarih)/1000/60/60/24;
      // const gunfark=(bugununTarihi-sonTarih)/1000/60;
      if (gunfark>7){
          await Kullanici.updateMany({katilim: "yazacak"},{  $set: { yetki:"deaktif" }  });
          await Kullanici.updateMany({katilim: "yazdi"},{  $set: { katilim:"yazmayacak" }  });  
          yorumAta();        
          await Server.updateOne({}, {$set: { sonModerasyon:bugununTarihi} });          
      }
    }
    catch (e) {
      console.log('caught', e);
    }
  }
  async function yorumAta(){
    const yorumlanacaklar= await Oyku.find({ yorumAtamasi: false }).populate('yazarObje');
    // const yorumlanacaklar= await Oyku.find();
    const yorumlayacaklar= await Kullanici.find({ yetki: "aktif", sekil: "okurYazar"});
    // const yorumlayacaklar= await Kullanici.find({ yetki: "aktif", sekil: "yazar"});
    if (yorumlanacaklar.length && (yorumlayacaklar.length>1))
    {
      let topAgirlik=0;
      for (oyku of yorumlanacaklar){
        topAgirlik+=parseFloat(oyku.yazarObje.yorumYuzdesi);
      }
      if (topAgirlik!==0){
        let toplamYorumSayisi=yorumlayacaklar.length*3;
        let oykuMatrisi=[];
        for (oyku of yorumlanacaklar){
          let oObj={};
          let agirlik=parseFloat(oyku.yazarObje.yorumYuzdesi)/topAgirlik;
          oObj.yazar=oyku.yazarObje;
          oObj.baslik=oyku.baslik;
          oObj.link=oyku.link;
          oObj.yakYorumSayisi=Math.min(Math.floor(toplamYorumSayisi*agirlik),yorumlayacaklar.length-1);
          oykuMatrisi.push(oObj);
        }
        oykuMatrisi=oykuMatrisi.filter(i => i.agirlik);
        oykuMatrisi.sort((a, b) => a.yakYorumSayisi - b.yakYorumSayisi);

        let yorumcuMatrisi=[];
        for (kullanici of yorumlayacaklar){
          let kObj={};
          kObj.id=kullanici._id;
          kObj.hYorumSayisi=0;
          kObj.yuzde=kullanici.yorumYuzdesi;
          yorumcuMatrisi.push(kObj);
        }

        let yorumMatrisi=[];
        while (yorumcuMatrisi.length && oykuMatrisi.length)
        {
          let indisYorumcu = Math.floor(Math.random() * yorumcuMatrisi.length);
          if (oykuMatrisi.filter(i=> i.yazarObje!== yorumcuMatrisi[indisYorumcu].id).length){
            do{
              var indisOyku = Math.floor(Math.random() * oykuMatrisi.length);
              var secilenOyku=oykuMatrisi[indisOyku];
            }while (secilenOyku.yazar === yorumcuMatrisi[indisYorumcu].id);
            let yorumObje={};
            yorumObje.oykuBasligi=secilenOyku.baslik;
            yorumObje.oykuBasligi=secilenOyku.link;
            yorumObje.yorumlayan=yorumcuMatrisi[indisYorumcu].id;
            yorumObje.yorumlanan=secilenOyku.yazar;
            yorumcuMatrisi[indisYorumcu].hYorumSayisi+=1;
            oykuMatrisi[indisOyku].yakYorumSayisi-=1;
            yorumMatrisi.push(yorumObje);
            yorumcuMatrisi=yorumcuMatrisi.filter(i => i.hYorumSayisi<3);
            oykuMatrisi=oykuMatrisi.filter(i => i.yakYorumSayisi>0);
          }else{
            yorumcuMatrisi=yorumcuMatrisi.splice(indisYorumcu,1);
          }
        }
      }
    }
    // console.log(yorumMatrisi);
    for await (yorum of yorumMatrisi){
      const yYorum= new Yorum({
        baslik: yorum.baslik,
        link: yorum.link,
        yazar: yorum.yorumlanan,
        yorumcu: yorum.yorumlayan,
      })
      await yYorum.save();
    }
    
  }
  haftalikModerasyon();
  next();
};