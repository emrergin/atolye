const Kullanici = require('../models/kullanici');
const Server = require('../models/server');
const Oyku = require('../models/oyku');

module.exports = function (req, res, next) {
    async function haftalikModerasyon(){
      try{
        const moderasyonVerisi=await Server.findOne();
        let sonTarih=moderasyonVerisi.sonModerasyon;
        const bugununTarihi = new Date();
        const gunfark=(bugununTarihi-sonTarih)/1000/60/60/24;
        // const gunfark=(bugununTarihi-sonTarih)/1000/60;
        if (gunfark>7){
          await Kullanici.updateMany({katilim: "yazdi"},{  $set: { katilim:"yazmayacak" }  });
          await Kullanici.updateMany({katilim: "yazacak"},{  $set: { yetki:"deaktif" }  });
          await Server.updateOne({}, {$set: { sonModerasyon:bugununTarihi} });
          yorumAta();
        }
      }
      catch (e) {
        console.log('caught', e);
      }
    }
    async function yorumAta(){
      const yorumlanacaklar= await Oyku.find({ yorumAtamasi: false });
      // const yorumlanacaklar= await Oyku.find();
      const yorumlayacaklar= await Kullanici.find({ yetki: "aktif", sekil: "okurYazar"});
      // const yorumlayacaklar= await Kullanici.find({ yetki: "aktif", sekil: "yazar"});
      if (yorumlanacaklar.length && yorumlayacaklar.length)
      {
        let topAgirlik=0;
        for (kullanici of yorumlayacaklar){
          topAgirlik+=parseFloat(kullanici.yorumYuzdesi);
        }
        // console.log(topAgirlik);
        // let toplamOykuSayisi=yorumlanacaklar.length;
        let toplamYorumSayisi=yorumlayacaklar.length*3;
        let hesapMatrisi=[];
        for (kullanici of yorumlayacaklar){
          let kObj={};
          kObj.agirlik=parseFloat(kullanici.yorumYuzdesi)/topAgirlik;
          kObj.id=kullanici._id;
          kObj.yakYorumSayisi=Math.floor(toplamYorumSayisi*kObj.agirlik);
          hesapMatrisi.push(kObj);
        }
        // console.log(hesapMatrisi);
      }
      // if (!yorumlanacaklar.length){
      //   console.log("Yorum dagitilacak oyku yok.");
      // }
      // if (!yorumlayacaklar.length){
      //   console.log("Yorum dagitilacak kisi yok.");
      // }
    }
    // yorumAta();
    haftalikModerasyon();
    next();
  };