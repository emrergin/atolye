const Oyku = require('../models/oyku');
const Kullanici = require('../models/kullanici');

const databaseAccessers = require('../controllers/databaseAccessers');



// utilities==========================
async function haftaBul(){
  try{
    const sonOyku=await Oyku.find().sort({ _id: -1 }).limit(1);
    let yeniHafta=sonOyku[0].hafta;
    const bugununTarihi = new Date();
    const gunfark=(bugununTarihi-sonOyku[0].createdAt)/1000/60/60/24;
    if (gunfark>4){
      yeniHafta+=1;
    }
    return yeniHafta;
  }
  catch (e) {
    console.log('caught', e);
  }
}

function capitalize([firstLetter, ...rest]) {
  return [firstLetter.toLocaleUpperCase('tr'), ...rest].join('');
}

function titleCase(baslik){
  return baslik.split(/\s+/).map(capitalize).join(' ');
}

function orderedUniqueAuthors(stories){
  return [...new Set(stories.map(a=>a.yazar))].sort(function (a, b) {
    return a.localeCompare(b);
  });
}

//controllers ==============================================

async function oyku_index (req,res){
  const oykuler = await databaseAccessers.getStories({});
  const yazarlar = orderedUniqueAuthors(oykuler);
  const haftalar = [...new Set(oykuler.map(a=>a.hafta))];
  res.render('index', { title: 'Bütün Öyküler',
                         oykuler, 
                         haftalar, 
                         yazarlar,
                         buHafta:`/`, buYazar:`/`} );
}

async function hafta_index (req,res){
  const hafta = req.params.hafta;
  const oykuler = await databaseAccessers.getStories({hafta});
  const yazarlar = orderedUniqueAuthors(oykuler);
  const haftalar = [...new Set(oykuler.map(a=>a.hafta))];
  res.render('index', { title: `Hafta ${hafta}`, 
      oykuler, 
      haftalar, 
      yazarlar, 
      buYazar:`/`, buHafta:hafta,
      mesaj: 'Atölyemizin böyle bir haftası yok. Henüz.'} );
}

async function yazar_index (req,res){
  const yazar = decodeURI(req.params.yazar);
  const oykuler = await databaseAccessers.getStories({yazar});
  const yazarlar = orderedUniqueAuthors(oykuler);
  const haftalar = [...new Set(oykuler.map(a=>a.hafta))];
  res.render('index', { title: `${yazar}`, 
    oykuler, 
    haftalar, 
    yazarlar, 
    buHafta:`/`, buYazar:yazar,
    mesaj: 'Böyle bir yazar yok yahut bu yazar henüz bir öykü yazmamış.'} );
}

async function rastgele_oyku (req,res){
  const oykuler = await databaseAccessers.getStories({});
  const yazarlar = orderedUniqueAuthors(oykuler);
  const haftalar = [...new Set(oykuler.map(a=>a.hafta))];
  res.render('index', { title: "Rastgele Öykü",
  oykuler: [oykuler[Math.floor(Math.random()*oykuler.length)]],
  haftalar, 
  yazarlar,
  buHafta:`/`, buYazar:`/`} );
}


const oyku_yeni = (req, res) => {
  if (req.user){
    let oykuHukmu = req.user.sekil==="okurYazar"? false : true;    
    haftaBul()
      .then(result =>{
        const oyku = new Oyku({
          hafta: result,
          yazar: req.user.gercekAd,
            //sadece ilk harfler buyuk
          baslik: titleCase(req.body.baslik.toLocaleLowerCase('tr')), 
          link: req.body.link,
          yazarObje: req.user._id,
          yorumAtamasi: oykuHukmu
        });
        oyku.save()
          .then(() => {    
             Kullanici.findOneAndUpdate({_id: req.user.id},{katilim: "yazdi"})
              .then(() => {
                res.redirect('/uyeSayfa');
              });         
          });
      })
      .catch(err => {
        console.log(err);
      });
  }
  else{
    res.redirect('/uyeGirisi');
  }
}

module.exports = {
  oyku_index,
  hafta_index,
  yazar_index,
  oyku_yeni,
  rastgele_oyku
}