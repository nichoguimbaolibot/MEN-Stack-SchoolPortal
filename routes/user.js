var express = require('express');
var router = express.Router();
var User = require('../models/user');
var News = require('../models/newsAndAnnouncement');
var async = require('async');
var passport = require('passport');
var passportConfig = require('../config/passport');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var transporter = require('nodemailer-smtp-transport');
var Data = require('../models/data');

router.get('/login', function (req, res) {
  News.findOne({
      category: 'news'
    })
    .sort({
      _id: 1
    })
    .exec(function (err1, news) {
      News.findOne({
          category: 'announcement'
        })
        .sort({
          _id: 1
        })
        .exec(function (err, announcements) {
          if (err) return next(err1);
          if (err) return next(err);
          res.render('main/homeplayground', {
            news: news,
            announcements: announcements,
            message: req.flash('loginMessage'),
          });
        });
    });
});

router.post(
  '/login',
  passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  }),
  function (req, res) {},
);

router.get('/profile', function (req, res) {
  // User
  // .findOne({_id: req.user._id})
  // .populate('history.item')
  // .exec(function(err, user){
  // 	if(err) return next(err);
  // 	res.render('accounts/profile', {user : user});
  // });
  async.waterfall([
    function (callback) {
      User.findById({
          _id: req.user._id
        })
        .populate('history')
        .exec(function (err, user) {
          if (err) return next(err);
          console.log(user);
          callback(null, user);
        });
    },
    function (user) {
      // History
      // .find({customer: req.user.email})
      // .populate('item')
      // .exec(function(err, history){
      // 	if(err){
      // 		console.log(err);
      // 	}
      res.render('accounts/profile', {
        user: user
      });
      // });
    },
  ]);
});

router.get('/signup', function (req, res) {
  res.render('accounts/signup', {
    errors: req.flash('errors')
  });
});

router.post('/signup', function (req, res, next) {
  // async.waterfall([
  // function(callback){
  var user = new User();
  user.profile.name =
    req.body.firstName + ' ' + req.body.middleName + ' ' + req.body.lastName;
  user.email = req.body.email;
  user.age = req.body.age;
  user.user = 'admin';
  if (user.user === 'admin') {
    User.count({
      user: user.user
    }).exec(function (err, count) {
      var number = new Date().getFullYear() + '000000';
      user.idNumber = parseInt(number) + count;
      user.isAdmin = true;
      user.superUser = true;
    });
  } else if (user.user === 'faculty') {
    User.count({
      user: user.user
    }).exec(function (err, count) {
      var number = new Date().getFullYear() + '000000';
      user.idNumber = parseInt(number) + count;
      user.isAdmin = true;
    });
  } else {
    User.count({
      user: user.user
    }).exec(function (err, count) {
      var number = new Date().getFullYear() + '000000';
      user.idNumber = parseInt(number) + count;
    });
  }
  user.profile.picture = user.gravatar();
  user.birthdate = new Date(
    req.body.year + '-' + req.body.month + '-' + req.body.day,
  );
  if (!(req.body.password === req.body.confirmPassword)) {
    req.flash('errors', 'Your password and confirm password does not match');
    return res.redirect('/signup');
  }
  user.password = req.body.password;
  User.findOne({
    email: req.body.email
  }, function (err, existingUser) {
    if (existingUser) {
      req.flash('errors', 'Account with that email address already exist');
      return res.redirect('/signup');
    } else {
      user.save(function (err, user) {
        if (err) return next(err);
        req.logIn(user, function (err) {
          res.redirect('/admindashboard');
        });
      });
    }
  });
  // 	},
  // 	function(user){
  // 		var cart = new Cart();
  // 		cart.owner = user._id;
  // 		cart.save(function(err){
  // 			if(err) return next(err);
  // 			req.logIn(user, function(err){
  // 			return res.redirect("/");
  // 			});
  // 		});
  // 	}
  // ]);
});

router.get('/logout', function (req, res, next) {
  User.findById(req.user._id, function (err, user) {
    user.save(function (err, result) {
      if (err) return next(err);
      console.log(result);
    });
  });

  req.logout();
  res.redirect('/');
});

router.get('/edit-profile', function (req, res, next) {
  var month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  User.findById(req.user._id, function (err, user) {
    if (err) return next(err);
    var getMonth = month[parseInt(user.birthdate.getMonth())];
    res.render('accounts/edit-profile', {
      message: req.flash('success'),
      user: user,
      getMonth: getMonth,
      errors: req.flash('errors'),
    });
  });
});

router.post('/edit-profile', function (req, res, next) {
  User.findOne({
    _id: req.user._id
  }, function (err, user) {
    if (err) return next(err);
    console.log(req.body)
    if (req.body.email) user.email = req.body.email;
    if (req.body.contact) user.contact = req.body.contact;
    if (req.body.address) user.address = req.body.address;
    if (req.body.month && req.body.day && req.body.year) {
      user.birthdate = new Date(
        req.body.year + '-' + req.body.month + '-' + req.body.day,
      );
    }
    if (req.body.currentPass) {
      if (!user.comparePassword(req.body.currentPass)) {
        req.flash('errors', 'You have entered a wrong password');
        return res.redirect('/edit-profile');
      }
    }
    if (req.body.password && req.body.confirmPass) {
      if (!(req.body.password === req.body.confirmPass)) {
        req.flash(
          'errors',
          'Your new password and confirm password does not match',
        );
        return res.redirect('/edit-profile');
      }
    }
    if (req.body.password) {
      user.password = req.body.password;
    }
    user.save(function (err) {
      if (err) return next(err);
      req.flash('success', 'You successfully edit your profile');
      return res.redirect('/edit-profile');
    });
  });
});

router.get('/forgot', function (req, res) {
  res.render('accounts/forgot');
});

router.post('/forgot', function (req, res, next) {
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function (token, done) {
        User.findOne({
          email: req.body.email
        }, function (err, user) {
          if (!user) {
            req.flash('message', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function (err) {
            done(err, token, user);
          });
        });
      },
      function (token, user, done) {
        var smtpTransport = nodemailer.createTransport(
          transporter({
            service: 'Gmail',
            auth: {
              user: 'pbcssinc@gmail.com',
              pass: 'Pbcssinc!123',
            },
          }),
        );
        var mailOptions = {
          to: user.email,
          from: 'pbcssinc@gmail.com',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' +
            req.headers.host +
            '/reset/' +
            token +
            '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n',
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          console.log('mail sent');
          req.flash(
            'message',
            'An e-mail has been sent to ' +
            user.email +
            ' with further instructions.',
          );
          done(err, 'done');
        });
      },
    ],
    function (err) {
      if (err) return next(err);
      res.redirect('/forgot');
    },
  );
});

router.get('/reset/:token', function (req, res) {
  User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: {
        $gt: Date.now()
      },
    },
    function (err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('accounts/reset', {
        token: req.params.token
      });
    },
  );
});
router.get('/data', function (req, res, next) {
  res.render('accounts/test-account');
});

router.post('/data', function (req, res, next) {
  var data = new Data();

  // Vmos.findByIdAndRemove(req.body.id, function (err, vmos) {});
  data.studentNo = req.body.studentNo;
  data.firstName = req.body.firstName;
  data.lastName = req.body.lastName;
  data.save(function (err, data) {
    console.log(data);
    if (err) return next(err);
    req.flash(
      'success',
      'VMOS Updated'
    );
    console.log("updated")
    res.redirect('/data');
  });
});

router.post('/reset/:token', function (req, res) {
  async.waterfall(
    [
      function (done) {
        User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
              $gt: Date.now()
            },
          },
          function (err, user) {
            if (!user) {
              req.flash(
                'message',
                'Password reset token is invalid or has expired.',
              );
              return res.redirect('back');
            }
            if (req.body.password === req.body.confirm) {
              user.password = req.body.password;
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;

              user.save(function (err) {
                req.logIn(user, function (err) {
                  done(err, user);
                });
              });
            } else {
              req.flash('message', 'Passwords do not match.');
              return res.redirect('back');
            }
          },
        );
      },
      function (user, done) {
        var smtpTransport = nodemailer.createTransport(
          transporter({
            service: 'Gmail',
            auth: {
              user: 'pbcssinc@gmail.com',
              pass: 'Pbcssinc!123',
            },
          }),
        );
        var mailOptions = {
          to: user.email,
          from: 'pbcssinc@gmail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' +
            user.email +
            ' has just been changed.\n',
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          req.flash('message', 'Success! Your password has been changed.');
          done(err);
        });
      },
    ],
    function (err) {
      res.redirect('/');
    },
  );
});

module.exports = router;