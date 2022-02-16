const Kullanici = require('./kullanici');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const oykuSchema = new Schema({
  hafta: {
    type: Number,
    required: true,
  },
  yazar: {
    type: String,
    required: true,
  },
  baslik: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  metin: {
    type: String
  },
  yorumAtamasi: {
    type: Boolean,
    default: true,
    required: true
  },
  yazarObje:{
    type: Schema.Types.ObjectId, 
    ref: 'Kullanici'
  },
}, { timestamps: true });

const Oyku = mongoose.model('Oyku', oykuSchema, `oykuler`);
module.exports = Oyku;