const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const kullaniciSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  gercekAd: {
    type: String,
    required: true
  },
}, { timestamps: true });

const Kullanici = mongoose.model('Kullanici',kullaniciSchema,'kullanicilar');
// const Oyku = mongoose.model('Oyku', oykuSchema, `oykuler`);
module.exports = Kullanici;