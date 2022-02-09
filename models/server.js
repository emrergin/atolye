const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serverSchema = new Schema({
  sonModerasyon: {
    type: Date,
    required: true,
  }
});

const Server = mongoose.model('Server',serverSchema,'server');
// const Oyku = mongoose.model('Oyku', oykuSchema, `oykuler`);
module.exports = Server;