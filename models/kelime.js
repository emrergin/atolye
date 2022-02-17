const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const kelimeSchema = new Schema({
  kelime: {
    type: String,
    required: true,
  },
  tur: {
    type: String,
  },
});

const Kelime = mongoose.model('Kelime',kelimeSchema,'kelimeler');
module.exports = Kelime;