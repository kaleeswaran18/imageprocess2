const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: String,
  jobTitle: String,
  website: String,
  email: String,
  phone: String,
  address: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Card', cardSchema);
