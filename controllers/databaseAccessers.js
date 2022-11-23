const Oyku = require('../models/oyku');
const endOfWeek = require('date-fns/endOfWeek');
// const Taslak = require('../models/taslak');
// const Kullanici = require('../models/kullanici');

// utilities==========================
function orderedUniqueAuthors(stories){
    return [...new Set(stories.map(a=>a.yazar))].sort(function (a, b) {
      return a.localeCompare(b);
    });
}


async function getStories(searchObject){
    const oykuler= await Oyku.find(searchObject,{ hafta: 1, yazar: 1, baslik:1, link: 1}).lean().sort({ createdAt: -1 });
    return oykuler;
}

async function getWeeks(){
    const tarihler = await Oyku.find({hafta: { $gt: 71}},{createdAt :1, _id:0}).lean();
    const pazarTarihleri = tarihler.map(a=>endOfWeek(new Date(a.createdAt), {weekStartsOn: 1}));
    const tarihMetinleri = pazarTarihleri.map(a=>a.toLocaleString("tr-TR", {year: 'numeric', month: 'numeric', day: 'numeric'}));
    const tarihKumesi = [...new Set(tarihMetinleri)];
    return tarihKumesi;
}

async function getStoriesExtra(searchObject){
    let yazarlar,haftalar,oykuler,oykulerTum;
    
    if (searchObject.hafta || searchObject.yazar){
        [oykuler, oykulerTum] = await Promise.all([
            Oyku.find(searchObject,{ hafta: 1, yazar: 1, baslik:1, link:1}).lean().sort({ createdAt: -1 }),
            Oyku.find({},{ hafta: 1, yazar: 1}).lean()
        ]);
        yazarlar = orderedUniqueAuthors(oykulerTum);
        haftalar = [...new Set(oykulerTum.map(a=>a.hafta))];
    }
    else{
        oykuler = await Oyku.find(searchObject,{ hafta: 1, yazar: 1, baslik:1, link:1}).lean().sort({ createdAt: -1 });
        yazarlar = orderedUniqueAuthors(oykuler);
        haftalar = [...new Set(oykuler.map(a=>a.hafta))];
    }
    return [oykuler,yazarlar,haftalar];
}

module.exports = {
    getStories,
    getWeeks,
    getStoriesExtra
}