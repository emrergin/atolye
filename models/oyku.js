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
}, { timestamps: true });

const Oyku = mongoose.model('Oyku', oykuSchema, `oykuler`);
module.exports = Oyku;