var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var moment = require('moment');
var Schema = mongoose.Schema;

// The user schema attributes/ characteristics/ fields
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true
  },
  password: String,
  birthdate: Date,
  profile: {
    firstName: String,
    middleName: String,
    lastName: String,
    name: {
      type: String,
      default: ''
    },
    picture: {
      type: String,
      default: ''
    },
  },
  user: {
    type: String,
    default: 'student'
  },
  age: Number,
  gender: String,
  address: String,
  contact: String,
  grades: String,
  idNumber: Number,
  deactivate: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  section: {
    type: String,
    default: ''
  },
  yrLvl: {
    type: String,
    default: ''
  },
  publisher: {
    type: Boolean,
    default: false
  },
  // inbox: [{
  // 	type: Schema.Types.ObjectId,
  // 	ref: "Message"
  // }],
  // history: [{
  // 	type: Schema.Types.ObjectId,
  // 	ref: "History"
  // }],
  curriculum: String,
  faculty: [{
    type: Schema.Types.ObjectId,
    ref: 'Handle',
  }, ],
  isAdmin: {
    type: Boolean,
    default: false
  },
  superUser: {
    type: Boolean,
    default: false
  },
});

// Hash the password before save it to the database
UserSchema.pre('save', function (next) {
  var user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// compare password in the database and the one that the user type in
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.gravatar = function (size) {
  if (!this.size) size = 200;
  if (!this.email) return 'https://gravatar.com/avatar/?s' + size + '%d=retro';
  var md5 = crypto
    .createHash('md5')
    .update(this.email)
    .digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};

module.exports = mongoose.model('User', UserSchema);