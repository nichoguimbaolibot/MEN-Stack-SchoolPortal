var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var literarySchema = new mongoose.Schema({
  litNumber: Number,
  category: String,
  title: String,
  content: String,
  comments: String,
  firstName: String,
  lastName: String,
  middleName: String,
  student: String,
  publishDate: { type: Date, default: Date.now() },
  picture: { type: String, default: '' },
  archive: { type: Boolean, default: false },
  status: { type: Boolean, default: false },
});

module.exports = mongoose.model('Literary', literarySchema);
