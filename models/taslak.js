const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Kullanici = require('./kullanici');

const defaultDraft = [{
  type: "paragraph",
  children: [
    { text: "" },
  ],
}];

function getCurrentDate(){      
  const d=new Date();
  d.setHours(d.getHours() + 3);
  return d.toLocaleString("tr-TR", {year: 'numeric', month: 'long', 
  day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit'});
}

const taslakSchema = new Schema({
  icerik: {
    type: String,
    default: JSON.stringify(defaultDraft),
  },
  baslik: {
    type: String,
    default: getCurrentDate()
  },
  yazarObje:{
    type: Schema.Types.ObjectId, 
    ref: 'Kullanici'
  },
}, { timestamps: true });

// taslakSchema.pre('save', function (next) {
//     this.baslik = this.get('_id'); // considering _id is input by client
//     next();
// });

const Taslak = mongoose.model('Taslak', taslakSchema, `taslaklar`);
module.exports = Taslak;