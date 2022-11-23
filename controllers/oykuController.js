const Oyku = require('../models/oyku');
const Kullanici = require('../models/kullanici');

const databaseAccessers = require('../controllers/databaseAccessers');



// utilities==========================
async function weekFind(){
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



//controllers ==============================================

async function storyIndex (req,res){
  const [oykuler,yazarlar,haftalar] = await databaseAccessers.getStoriesExtra({});
  res.render('index', { title: 'Bütün Öyküler',
                         oykuler, 
                         haftalar, 
                         yazarlar,
                         buHafta:`/`, buYazar:`/`} );
}

// async function storyIndex (req,res){
//   const [oykuler,yazarlar,haftalar] = await databaseAccessers.getStoriesExtra({});
//   res.render('index2', { title: 'Bütün Öyküler',
//                          oykuler: oykuler.slice(70,80), 
//                          haftalar, 
//                          yazarlar,
//                          buHafta:`/`, buYazar:`/`} );
// }

async function weekIndex (req,res){
  const hafta = req.params.hafta;
  const [oykuler,yazarlar,haftalar] = await databaseAccessers.getStoriesExtra({hafta});
  res.render('index', { title: `Hafta ${hafta}`, 
      oykuler, 
      haftalar, 
      yazarlar, 
      buYazar:`/`, buHafta:hafta,
      mesaj: 'Atölyemizin böyle bir haftası yok. Henüz.'} );
}

async function authorIndex (req,res){
  const yazar = decodeURI(req.params.yazar);
  const [oykuler,yazarlar,haftalar] = await databaseAccessers.getStoriesExtra({yazar});
  res.render('index', { title: `${yazar}`, 
    oykuler, 
    haftalar, 
    yazarlar, 
    buHafta:`/`, buYazar:yazar,
    mesaj: 'Böyle bir yazar yok yahut bu yazar henüz bir öykü yazmamış.'} );
}

async function randomStory (req,res){
  const [oykuler,yazarlar,haftalar] = await databaseAccessers.getStoriesExtra({});
  res.render('index', { title: "Rastgele Öykü",
    oykuler: [oykuler[Math.floor(Math.random()*oykuler.length)]],
    haftalar, 
    yazarlar,
    buHafta:`/`, buYazar:`/`} 
  );
}


async function newStory(req,res){
  if (req.user){
    let oykuHukmu = req.user.sekil==="okurYazar"? false : true;
    const week = await weekFind();    
    const story = new Oyku({
      hafta: week,
      yazar: req.user.gercekAd,
        //sadece ilk harfler buyuk
      baslik: titleCase(req.body.baslik.toLocaleLowerCase('tr')), 
      link: req.body.link,
      yazarObje: req.user._id,
      yorumAtamasi: oykuHukmu
    });
    await story.save();  
    await Kullanici.findOneAndUpdate({_id: req.user.id},{katilim: "yazdi"});
    res.redirect('/uyeSayfa');  
  }
  else{
    res.redirect('/uyeGirisi');
  }
}

module.exports = {
  storyIndex,
  weekIndex,
  authorIndex,
  newStory,
  randomStory
}