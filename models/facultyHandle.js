var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var handleSchema = new Schema({
        faculty: String,
        subject: String,
        section: String,
        yrLvl: String,
        academicYear: {type: String, default: (new Date()).getFullYear() + "-" + ((new Date()).getFullYear() + 1) },
});

module.exports = mongoose.model("Handle", handleSchema);