var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var subjectSchema = new Schema({
    firstGrading: {type: String, default: "0"},
    secondGrading: {type: String, default: "0"},
    thirdGrading: {type: String, default: "0"},
    fourthGrading: {type: String, default: "0"},
    finalGrading: {type: String, default: "0"},
    remarks: { type: String, default: "" },
    firstSem: {type: String, default: "0"},
    postFirstSem:{type: Boolean, default: false},
    secondSem: {type: String, default: "0"},
    postSecondSem: {type:Boolean, default: false},
    firstSemester: {type: Boolean, default: false},
    postFirstGrading: {type: Boolean, default: false},
    postThirdGrading: {type: Boolean, default: false},
    postSecondGrading: {type: Boolean, default: false},
    postFourthGrading:  {type: Boolean, default: false},
    secondSemester: {type: Boolean, default: false},
    first: {type: Boolean, default: false},
    second: {type: Boolean, default: false},
    third: {type: Boolean, default: false},
    fourth: {type: Boolean, default: false},
    remarkEncode: {type: Boolean, default: false},
    subject: String,
    email: String,
    firstName: String,
    lastName: String,
    middleName: String,
    academicYear: {type: String, default: (new Date()).getFullYear()+ "-" + ((new Date()).getFullYear() + 1)},
    yrLvl: String,
    section: String,
    faculty: String

});

module.exports = mongoose.model("Subject", subjectSchema);