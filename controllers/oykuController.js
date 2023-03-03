

const Oyku = require('../models/oyku');
const Server = require('../models/server');
const Kullanici = require('../models/kullanici');
const {getStoriesWithPaginationExtra} = require('../controllers/databaseAccessers')


// utilities==========================
async function weekFind(){
  const moderasyonVerisi=await Server.findOne();
  const lastWeek = moderasyonVerisi.hafta;
  return lastWeek;  
}

function capitalize([firstLetter, ...rest]) {
  return [firstLetter.toLocaleUpperCase('tr'), ...rest].join('');
}

function titleCase(baslik){
  return baslik.split(/\s+/).map(capitalize).join(' ');
}



//controllers ==============================================


async function storyWithPages (req,res){
  const page = req.params.sayfa||1;
  const [oykuler,sonHafta,yazarlar,sayi,sayfa]=await getStoriesWithPaginationExtra({},page);
  res.render('index2', { title: 'Bütün Öyküler',
                         oykuler, 
                         sonHafta, 
                         yazarlar,
                         sayi,
                         sayfa,
                         buHafta:"",
                         message: "Bir hata oldu.",
                         paginationLink: "oykuler"} );
}

async function weekWithPages (req,res){
  const page = req.params.sayfa||1;
  const hafta = req.params.hafta;
  const [oykuler,sonHafta,yazarlar,sayi,sayfa]=await getStoriesWithPaginationExtra({hafta},page);
  res.render('index2', { title: `Hafta ${hafta}`,
                         oykuler, 
                         sonHafta, 
                         yazarlar,
                         sayi,
                         sayfa,
                         buHafta:hafta,
                         message: "Böyle bir hafta yok. Henüz.",
                         paginationLink: "hafta/"+hafta} );
}

async function authorWithPages (req,res){
  const page = req.params.sayfa||1;
  const yazar = decodeURI(req.params.yazar);
  const [oykuler,sonHafta,yazarlar,sayi,sayfa]=await getStoriesWithPaginationExtra({yazar},page);
  res.render('index2', { title: `${yazar} Öyküleri`,
                         oykuler, 
                         sonHafta, 
                         yazarlar,
                         sayi,
                         sayfa,
                         buHafta:"",
                         message: "Aramızda böyle bir yazar yok. Henüz.",
                         paginationLink: "yazar/"+yazar} );
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
  storyWithPages,
  newStory,
  authorWithPages,
  weekWithPages
}