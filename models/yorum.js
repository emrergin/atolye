const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const yorumSchema = new Schema({
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
  yorumcu: {
    type: String,
    required: true,
  },
  yorumcuOnayi: {
    type: Boolean,
    required: true,
    default: false
  },
  yazarOnayi: {
    type: Boolean,
  },
  yorumcuIsim: {
    type: String,
    required: true,
  },
  rating:{
    type:Number  
  }

}, { timestamps: true });

const Yorum = mongoose.model('Yorum',yorumSchema,'yorumlar');
module.exports = Yorum;