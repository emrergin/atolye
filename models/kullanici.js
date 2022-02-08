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
  yetki:{
    type: String,
    enum: ['admin', 'aktif', 'deaktif',],
    default: 'aktif',
    required: true
  },
  sekil:{
    type: String,
    enum: ['okurYazar', 'yazar'],
    default: 'yazar',
    required: true
  },
  katilim:{
    type: String,
    enum: ['yazacak', 'yazmayacak', 'yazdi'],
    default: 'yazmayacak',
    required: true
  },
  yorumYuzdesi:{
    type: mongoose.Types.Decimal128,
    default: 1
  }
}, { timestamps: true });

const Kullanici = mongoose.model('Kullanici',kullaniciSchema,'kullanicilar');
// const Oyku = mongoose.model('Oyku', oykuSchema, `oykuler`);
module.exports = Kullanici;