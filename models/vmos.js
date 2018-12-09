var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var vmosSchema = new mongoose.Schema({
    vision: String,
    mission: String,
    publishDate: {
        type: Date,
        default: Date.now()
    },
});


module.exports = mongoose.model("Vmos", vmosSchema);