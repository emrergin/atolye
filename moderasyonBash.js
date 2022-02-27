
require('dotenv').config();

const haftalikModerasyon=require('./modules/haftalikModerasyon')

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGOURL, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useFindAndModify: false
})
.then(()=> haftalikModerasyon())
.then(()=> mongoose.disconnect())
.catch(err => console.log(err));