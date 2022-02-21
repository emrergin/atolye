const Kullanici = require('../models/kullanici');
const Server = require('../models/server');
const Oyku = require('../models/oyku');
const Yorum = require('../models/yorum');
const Kelime = require('../models/kelime');

module.exports = function (req, res, next) {
  async function haftalikModerasyon(){
    try{
      const moderasyonVerisi=await Server.findOne();
      let sonTarih=moderasyonVerisi.sonModerasyon;
      const bugununTarihi = new Date();
      const gunfark=(bugununTarihi-sonTarih)/1000/60/60/24;
      const eklenecekGun=7*Math.floor(gunfark/7);
      if (gunfark>=7){
          gorevYenile();
          await Kullanici.updateMany({katilim: "yazacak"},{  $set: { aktif: false }  });
          yorumAta();     
          await Kullanici.updateMany({katilim: "yazdi"},{  $set: { katilim:"yazmayacak" }  });   
          await Server.updateOne({}, {$set: { sonModerasyon:sonTarih.setDate(sonTarih.getDate() + eklenecekGun)} });          
      }
    }
    catch (e) {
      console.log('caught', e);
    }
  }

  async function yorumAta(){
    let yorumlanacaklar= await Oyku.find({ yorumAtamasi: false },{yazarObje:1,baslik:1,link: 1}).populate('yazarObje','yorumYuzdesi');
    let yorumlayacaklar= await Kullanici.find({ aktif: true, sekil: "okurYazar"},{_id:1,yorumYuzdesi:1})

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

        oykuMatrisi=oykuMatrisi.filter(i => i.yakYorumSayisi);
        yorumlayacaklar.sort((a, b) => parseFloat(b.yorumYuzdesi) - parseFloat(a.yorumYuzdesi));

        // Yorum Dagitimi burada basliyor=====================
        var yorumMatrisi=[];
        var tamamMatrisi=[];

        for (yorumcu of yorumlayacaklar){
          let buKisininYorumlayabilecegiOykuler=oykuMatrisi.filter(i=> (i.yazarObje._id.toString() !== yorumcu._id.toString()));
          buKisininYorumlayabilecegiOykuler=shuffle(buKisininYorumlayabilecegiOykuler);
          let secilenler=buKisininYorumlayabilecegiOykuler.slice(0, 3);

          for (secilenOyku of secilenler){
            let yorumObje={};
            yorumObje.baslik=secilenOyku.baslik;
            yorumObje.link=secilenOyku.link;
            yorumObje.yorumlayan=yorumcu._id;
            yorumObje.yorumlanan=secilenOyku.yazarObje._id;
            yorumMatrisi.push(yorumObje);
            oykuMatrisi[secilenOyku.indis].yakYorumSayisi-=1;
          }
          
          oykuMatrisi.filter(i => i.yakYorumSayisi<=0).map((bitenOyku)=>{
            tamamMatrisi.push(bitenOyku.id);
          });
          oykuMatrisi=oykuMatrisi.filter(i => i.yakYorumSayisi>0);

          if (!oykuMatrisi.length){
            break;
          }
        }
      }
      for await (yorum of yorumMatrisi){
        const yYorum= new Yorum({
          baslik: yorum.baslik,
          link: yorum.link,
          yazar: yorum.yorumlanan,
          yorumcu: yorum.yorumlayan,
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
  
  haftalikModerasyon();
  // yorumAta(); 
  next();
};

function shuffle(array) {
  let resArray=array;
  for (let i = resArray.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [resArray[i], resArray[j]] = [resArray[j], resArray[i]];
  }
  return resArray;
}