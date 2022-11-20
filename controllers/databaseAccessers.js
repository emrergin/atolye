const Oyku = require('../models/oyku');
// const Taslak = require('../models/taslak');
// const Kullanici = require('../models/kullanici');

async function getStories(searchObject){
    const oykuler= await Oyku.find(searchObject,{ hafta: 1, yazar: 1, baslik:1, link:1}).sort({ createdAt: -1 });
    return oykuler;
}

module.exports = {
    getStories
}