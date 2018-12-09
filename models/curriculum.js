var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var curriculumSchema = new Schema({
    yrLvl: String,
    subjects: [{
            type: Schema.Types.ObjectId,
            ref: "Subject"
    }],
    section: String,
    academicYear: {type: String, default: (new Date()).getFullYear() + "-" +((new Date()).getFullYear() + 1)},
    firstName: String,
    middleName: String,
    lastName: String,
    email: String,
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    date: { type: Date, default: Date.now()}
});

module.exports = mongoose.model("Curriculum", curriculumSchema);