var mongoose = require("mongoose");
var moment = require("moment");
var Schema = mongoose.Schema;

var pendingSchema = new Schema({
    studentNo: Number,
    email: String,
    firstName: String,
    lastName: String,
    middleName: String,
    fullName: String,
    age: Number,
    birthdate: Date,
    address: String,
    gender: String,
    contact: String,
    status: {
        type: String,
        default: "Pending"
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("Pending", pendingSchema);