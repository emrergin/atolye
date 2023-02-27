const Oyku = require('../models/oyku');
const endOfWeek = require('date-fns/endOfWeek');

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


async function getStoriesWithPaginationExtra(fullQuery,sayfa){
    const perPage = 12;
    const totalNumberOfStories = await Oyku.countDocuments(fullQuery);
    const pageToGet = Math.min(sayfa,Math.ceil(totalNumberOfStories/perPage));
  
    const [oykuler, sonOyku, yazarlar]=await Promise.all([
        Oyku.find(fullQuery,{ hafta: 1, yazar: 1, baslik:1, link:1})
            .limit(perPage)
            .skip(Math.max(0,perPage * (pageToGet-1)))
            .sort({ createdAt: -1 }), 
        Oyku.find().sort({ _id: -1 }).limit(1),
        Oyku.find({}).distinct("yazar")
    ]);

    return [oykuler, sonOyku[0].hafta, yazarlar.sort(function (a, b) {
        return a.localeCompare(b);
      }), totalNumberOfStories, pageToGet ];
}



module.exports = {
    getStories,
    getWeeks,
    getStoriesWithPaginationExtra
}