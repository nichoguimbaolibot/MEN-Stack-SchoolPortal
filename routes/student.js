var express = require('express');
var router = express.Router();
var expressSanitizer = require('express-sanitizer');
var User = require('../models/user');
var Pending = require('../models/pending');
var News = require('../models/newsAndAnnouncement');
var Curriculum = require('../models/curriculum');

var Literary = require('../models/literary');
var async = require('async');
var passport = require('passport');
var passportConfig = require('../config/passport');

router.use(expressSanitizer());
router.get('/studentdashboard', function(req, res, next) {
  res.render('student/dashboard');
});

router.get('/createliteraryworks', function(req, res, next) {
  Literary.count().exec(function(err, counter) {
    res.render('student/createlitworks', { counter: counter });
  });
});

router.get('/myliterary', function(req, res, next) {
  Literary.find({ student: req.user._id }, function(err, literaries) {
    if (err) return next(err);
    res.render('student/myliterary', { literaries: literaries });
  });
});
router.post('/myliterary/:id/edit', function(req, res, next) {
  Literary.findById(req.params.id, function(err, literaries) {
    if (err) return next(err);
    literaries.category = req.body.category;
    literaries.title = req.body.title;
    literaries.content = req.body.content;
    literaries.comments = req.body.comments;
    literaries.save(function(err, literaries) {
      if (err) return next(err);
      res.redirect('/myliterary');
    });
  });
});

router.post('/createliteraryworks', function(req, res, next) {
  if (req.body.category && req.body.title && req.body.content) {
    var literary = new Literary();
    console.log(req.user);
    literary.litNumber = req.body.litNumber;
    literary.category = req.body.category;
    literary.title = req.body.title;
    literary.firstName = req.user.profile.firstName;
    literary.middleName = req.user.profile.middleName;
    literary.lastName = req.user.profile.lastName;
    literary.student = req.user._id;
    literary.comments = req.sanitize(req.body.content);
    literary.content = req.sanitize(req.body.content);
    literary.save(function(err, literary) {
      if (err) return next(err);
      req.flash(
        'success',
        'Your account is in proccess now by the administrator',
      );
      console.log(literary);
      res.redirect('/createliteraryworks');
    });
  }
  console.log(req.body);
});

router.get('/viewgrade', function(req, res, next) {
  // console.log('user:' + req.user);
  // Curriculum.findOne({ email: req.user.email })
  //   .populate('subjects')
  //   .exec(function(err, curriculum) {
  //     if (err) return next(err);
  //     console.log('subjects: ' + curriculum);
  //     res.render('student/grade', { curriculum: curriculum });
  //   });
  if (req.body.academicYear) {
    Curriculum.find({ email: req.user.email }, function(err, curriculums) {
      if (err) return next(err);
      Curriculum.findOne({
        email: req.user.email,
        academicYear: req.body.academicYear,
      })
        .populate('subjects')
        .exec(function(err, curriculum) {
          console.log(curriculum);
          if (curriculum) {
            User.findById(req.user._id, function(err, user) {
              res.render('student/grade', {
                curriculums: curriculums,
                curriculum: curriculum,
                user: user,
              });
            });
          }
        });
    });
  } else {
    Curriculum.find({ email: req.user.email }, function(err, curriculums) {
      if (err) return next(err);
      Curriculum.findOne({
        email: req.user.email,
        academicYear:
          new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      })
        .populate('subjects')
        .exec(function(err, curriculum) {
          console.log(curriculum);
          if (curriculum) {
            User.findById(req.user._id, function(err, user) {
              res.render('student/grade', {
                curriculums: curriculums,
                curriculum: curriculum,
                user: user,
              });
            });
          } else if (!curriculum) {
            Curriculum.findOne({
              email: req.user.email,
              academicYear:
                new Date().getFullYear() - 1 + '-' + new Date().getFullYear(),
            })
              .populate('subjects')
              .exec(function(err, curriculum) {
                User.findById(req.params.id, function(err, user) {
                  res.render('student/grade', {
                    curriculums: curriculums,
                    curriculum: curriculum,
                    user: user,
                  });
                });
              });
          }
        });
    });
  }
});

module.exports = router;
