var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var dataSchema = new mongoose.Schema({
    studentNo: Number,
    firstName: String,
    lastName: String,
    publishDate: {
        type: Date,
        default: Date.now()
    },
});


module.exports = mongoose.model("Data", dataSchema);