var express = require('express');
var router = express.Router();
var expressSanitizer = require('express-sanitizer');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var transporter = require('nodemailer-smtp-transport');
var User = require('../models/user');
var Pending = require('../models/pending');
var News = require('../models/newsAndAnnouncement');
var Curriculum = require('../models/curriculum');
var Literary = require('../models/literary');
var Subject = require('../models/subject');
var Handle = require('../models/facultyHandle');
var Vmos = require('../models/vmos');
var async = require('async');
var passport = require('passport');
var passportConfig = require('../config/passport');

router.use(expressSanitizer());

function adminAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin || req.user.superUser && req.user.user == "admin") {
      return next();
    } else if (req.user.publisher == true || req.user.publisher == "true") {
      return next();
    } else {
      return res.redirect('back');
    }
  } else {
    return res.redirect('/login');
  }
}

router.get('/users/new', adminAuthentication, function (req, res, next) {
  User.count({
    user: 'admin'
  }).exec(function (err, adminCount) {
    var adminNumber = new Date().getFullYear() + '000000';
    var adminCounter = parseInt(adminNumber) + parseInt(adminCount);
    User.count({
      user: 'faculty'
    }).exec(function (err, facultyCount) {
      var facultyNumber = new Date().getFullYear() + '0000000';
      var facultyCounter = parseInt(facultyNumber) + parseInt(facultyCount);
      User.count({
        user: 'student'
      }).exec(function (err, studentCount) {
        if (err) return next(err);
        var studentNumber = new Date().getFullYear() + '00000000';
        var studentCounter = parseInt(studentNumber) + parseInt(studentCount);
        res.render('admin/users-new', {
          errors: req.flash('errors'),
          studentCount: studentCounter,
          facultyCount: facultyCounter,
          adminCount: adminCounter,
        });
      });
    });
  });
});

router.post('/users', adminAuthentication, function (req, res, next) {
  // async.waterfall([
  //     function(callback){
  var user = new User();
  console.log(user);
  if (req.body.user === 'student') {
    if (
      req.body.firstName &&
      req.body.lastName &&
      req.body.age &&
      req.body.address &&
      req.body.email &&
      req.body.contact &&
      req.body.user &&
      // req.body.section &&
      // req.body.yrLvl &&
      req.body.idNumber &&
      req.body.contact &&
      req.body.year &&
      req.body.month &&
      req.body.day &&
      req.body.password &&
      req.body.confirmPassword
    ) {
      user.profile.name =
        req.body.firstName +
        ' ' +
        req.body.middleName +
        ' ' +
        req.body.lastName;
      user.profile.firstName = req.body.firstName;
      user.profile.lastName = req.body.lastName;
      user.profile.middleName = req.body.middleName;
      user.email = req.body.email;
      user.profile.picture = user.gravatar();
      user.age = req.body.age;
      user.user = req.body.user;
      // user.section = req.body.section;
      // user.yrLvl = req.body.yrLvl;
      user.idNumber = req.body.idNumber;
      user.gender = req.body.gender;
      user.address = req.body.address;

      user.contact = '+63' + parseInt(req.body.contact);
      user.birthdate = new Date(
        req.body.year + '-' + req.body.month + '-' + req.body.day,
      );
      if (!(req.body.password === req.body.confirmPassword)) {
        req.flash(
          'errors',
          'Your password and confirm password does not match',
        );
        return res.redirect('/users/new');
      }
      user.isAdmin = false;
      user.password = req.body.password;
      User.findOne({
        email: req.body.email
      }, function (err, existingUser) {
        if (existingUser) {
          req.flash('errors', 'Account with that email address already exist');
          return res.redirect('/users/new');
        } else {
          console.log("pasok");
          user.save(function (err, user) {
            console.log("lol")
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
              to: req.body.email,
              from: 'pbcssinc@gmail.com',
              subject: 'New Account Created',
              text: 'Username:' +
                '\n\n' +
                user.email +
                '\n\n' +
                'Password:' +
                req.body.password
            };
            smtpTransport.sendMail(mailOptions, function (err) {
              if (err) return next(err);
              console.log('mail sent');
              req.flash(
                'message',
                'An e-mail has been sent to ' +
                user.email,
              );
            });
            if (err) return next(err);

            req.flash("message", "You successfully created a new account");
            res.redirect('/users/new');
            // callback(null, user);
          });
          // console.log(user);
        }
      });
    } else {
      console.log(req.body);
      req.flash('errors', 'Please fillup all the required information.');
      res.redirect('/users/new');
    }
  } else {
    if (
      req.body.firstName &&
      req.body.lastName &&
      req.body.age &&
      req.body.address &&
      req.body.email &&
      req.body.contact &&
      req.body.user &&
      req.body.idNumber &&
      req.body.contact &&
      req.body.year &&
      req.body.month &&
      req.body.day &&
      req.body.password &&
      req.body.confirmPassword
    ) {
      user.profile.name =
        req.body.firstName +
        ' ' +
        req.body.middleName +
        ' ' +
        req.body.lastName;
      user.profile.firstName = req.body.firstName;
      user.profile.lastName = req.body.lastName;
      if (req.body.middleName) {
        user.profile.middleName = req.body.middleName;
      }
      user.email = req.body.email;
      user.profile.picture = user.gravatar();
      user.age = req.body.age;
      user.user = req.body.user;
      // user.section = req.body.section;
      // user.yrLvl = req.body.yrLvl;
      user.idNumber = req.body.idNumber;
      user.gender = req.body.gender;
      user.address = req.body.address;

      user.contact = '+63' + parseInt(req.body.contact);
      user.birthdate = new Date(
        req.body.year + '-' + req.body.month + '-' + req.body.day,
      );
      if (!(req.body.password === req.body.confirmPassword)) {
        req.flash(
          'errors',
          'Your password and confirm password does not match',
        );
        return res.redirect('/users/new');
      }
      if (req.body.user === 'faculty') {
        user.isAdmin = false;
      } else if (req.body.user === 'admin') {
        user.isAdmin = true;
        user.superUser = true;
      } else {
        user.isAdmin = false;
      }

      user.password = req.body.password;
      User.findOne({
        email: req.body.email
      }, function (err, existingUser) {
        if (existingUser) {
          req.flash('errors', 'Account with that email address already exist');
          return res.redirect('/users/new');
        } else {

          user.save(function (err, user) {
            if (err) return next(err);
            req.flash("message", "You successfully created a new account");
            // console.log('lolx')
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
              to: req.body.email,
              from: 'pbcssinc@gmail.com',
              subject: 'New Account Created',
              text: 'Username:' +
                '\n\n' +
                user.email +
                '\n\n' +
                'Password:' +
                req.body.password
            };
            smtpTransport.sendMail(mailOptions, function (err) {
              if (err) return next(err);
              console.log('mail sent');
              req.flash(
                'message',
                'An e-mail has been sent to ' +
                user.email,
              );
            });
            return res.redirect('/users/new');
            // callback(null, user);
          });
          console.log(user);
        }
      });
    } else {
      console.log(req.body);
      req.flash('errors', 'Please fillup all the required information.');
      res.redirect('/users/new');
    }
  }
});

// router.post('/users', adminAuthentication, function(req, res, next) {
//   // async.waterfall([
//   //     function(callback){
//   var user = new User();
//   if (
//     req.body.firstName &&
//     req.body.middleName &&
//     req.body.lastName &&
//     req.body.age &&
//     req.body.address &&
//     req.body.email &&
//     req.body.contact &&
//     req.body.user &&
//     req.body.section &&
//     req.body.yrLvl &&
//     req.body.idNumber &&
//     req.body.contact &&
//     req.body.year &&
//     req.body.month &&
//     req.body.day &&
//     req.body.password &&
//     req.body.confirmPassword
//   ) {
//     user.profile.name =
//       req.body.firstName + ' ' + req.body.middleName + ' ' + req.body.lastName;
//     user.profile.firstName = req.body.firstName;
//     user.profile.lastName = req.body.lastName;
//     user.profile.middleName = req.body.middleName;
//     user.email = req.body.email;
//     user.profile.picture = user.gravatar();
//     user.age = req.body.age;
//     user.user = req.body.user;
//     user.section = req.body.section;
//     user.yrLvl = req.body.yrLvl;
//     user.idNumber = req.body.idNumber;
//     user.gender = req.body.gender;
//     user.address = req.body.address;

//     user.contact = '+63' + parseInt(req.body.contact);
//     // if(user.user === "admin"){
//     //     User.count({user: user.user}).exec(function(err, count){
//     //     var number = (new Date()).getFullYear() +  "000000";
//     //     user.idNumber = parseInt(number) + count;
//     // });
//     // } else if(user.user === "faculty"){
//     //     User.count({user: user.user}).exec(function(err, count){
//     //         var number = (new Date()).getFullYear() +  "000000";
//     //         user.idNumber = parseInt(number) + count;
//     //     });
//     // }else{
//     //     User.count({user: user.user}).exec(function(err, count){
//     //         var number = (new Date()).getFullYear() +  "000000";
//     //         user.idNumber = parseInt(number) + count;
//     //     });
//     // }
//     user.birthdate = new Date(
//       req.body.year + '-' + req.body.month + '-' + req.body.day,
//     );
//     if (!(req.body.password === req.body.confirmPassword)) {
//       req.flash('errors', 'Your password and confirm password does not match');
//       return res.redirect('/users/new');
//     }
//     if (req.body.user === 'faculty') {
//       user.isAdmin = true;
//     } else if (req.body.user === 'admin') {
//       user.isAdmin = true;
//       user.superUser = true;
//     } else {
//       user.isAdmin = false;
//     }

//     user.password = req.body.password;
//     User.findOne({ email: req.body.email }, function(err, existingUser) {
//       if (existingUser) {
//         req.flash('errors', 'Account with that email address already exist');
//         return res.redirect('/users/new');
//       } else {
//         user.save(function(err, user) {
//           if (err) return next(err);
//           res.redirect('/users/new');
//           // callback(null, user);
//         });
//         console.log(user);
//       }
//     });
//     //     },
//     //     function(user){
//     //         var cart = new Cart();
//     //         cart.owner = user._id;
//     //         cart.save(function(err){
//     //             if(err) return next(err);
//     //             res.redirect("/users");
//     //         });
//     //     }
//     // ]);

//     //     },
//     //     function(user){
//     //         var cart = new Cart();
//     //         cart.owner = user._id;
//     //         cart.save(function(err){
//     //             if(err) return next(err);
//     //             res.redirect("/users");
//     //         });
//     //     }
//     // ]);
//   } else {
//     console.log(req.body);
//     req.flash('errors', 'Please fillup all the required information.');
//     res.redirect('/users/new');
//   }
// });

router.get('/manage', adminAuthentication, function (req, res, next) {
  if (req.query.sort) {
    console.log("pasok");
    Pending.find({}).sort({
      lastName: -1,
      firstName: -1
    }).exec(function (err, allPending) {
      if (err) return next(err);
      res.render('admin/manage-users', {
        allPending: allPending
      });
    });
  } else {
    Pending.find({}, function (err, allPending) {
      if (err) return next(err);
      res.render('admin/manage-users', {
        allPending: allPending
      });
    });
  }
});

router.get('/manage/:id', adminAuthentication, function (req, res, next) {
  Pending.findById(req.params.id, function (err, pending) {
    User.count({
      user: 'student'
    }).exec(function (err, studentCount) {
      if (err) return next(err);
      var studentNumber = new Date().getFullYear() + '00000000';
      var studentCounter = parseInt(studentNumber) + parseInt(studentCount);
      if (err) return next(err);
      res.render('admin/register-student', {
        pending: pending,
        studentCount: studentCounter,
        errors: req.flash('errors'),
        success: req.flash('success'),
      });
    });
  });
});

router.post('/manage/:id', adminAuthentication, function (req, res, next) {
  // async.waterfall([
  //     function(callback){
  var user = new User();
  if (
    req.body.firstName &&
    req.body.lastName &&
    req.body.age &&
    req.body.address &&
    req.body.email &&
    req.body.contact &&
    req.body.user &&
    // req.body.section &&
    // req.body.yrLvl &&
    req.body.idNum &&
    req.body.year &&
    req.body.month &&
    req.body.gender &&
    req.body.day &&
    req.body.password &&
    req.body.confirmPassword
  ) {
    user.profile.name =
      req.body.firstName + ' ' + req.body.middleName + ' ' + req.body.lastName;
    user.profile.firstName = req.body.firstName;
    user.profile.lastName = req.body.lastName;
    user.profile.middleName = req.body.middleName;
    user.email = req.body.email;
    user.profile.picture = user.gravatar();
    user.age = req.body.age;
    user.user = req.body.user;
    // user.section = req.body.section;
    // user.yrLvl = req.body.yrLvl;
    user.idNumber = req.body.idNum;
    user.gender = req.body.gender;
    user.address = req.body.address;
    user.contact = '+63' + parseInt(req.body.contact);
    // if(user.user === "admin"){
    //     User.count({user: user.user}).exec(function(err, count){
    //     var number = (new Date()).getFullYear() +  "000000";
    //     user.idNumber = parseInt(number) + count;
    // });
    // } else if(user.user === "faculty"){
    //     User.count({user: user.user}).exec(function(err, count){
    //         var number = (new Date()).getFullYear() +  "000000";
    //         user.idNumber = parseInt(number) + count;
    //     });
    // }else{
    //     User.count({user: user.user}).exec(function(err, count){
    //         var number = (new Date()).getFullYear() +  "000000";
    //         user.idNumber = parseInt(number) + count;
    //     });
    // }
    user.birthdate = new Date(
      req.body.year + '-' + req.body.month + '-' + req.body.day,
    );
    if (!(req.body.password === req.body.confirmPassword)) {
      req.flash('errors', 'Your password and confirm password does not match');
      return res.redirect('/manage/' + req.param.id);
    }
    if (req.body.user === 'faculty') {
      user.isAdmin = true;
    } else if (req.body.user === 'admin') {
      user.isAdmin = true;
      user.superUser = true;
    } else {
      user.isAdmin = false;
    }

    user.password = req.body.password;
    User.findOne({
      email: req.body.email
    }, function (err, existingUser) {
      if (existingUser) {
        req.flash('errors', 'Account with that email address already exist');
        return res.redirect('/manage/' + req.params.id);
      } else {
        user.save(function (err, user) {
          if (err) return next(err);
          Pending.findByIdAndRemove(req.params.id, function (err, pendingUser) {
            if (err) return next(err);
            console.log(pendingUser);
            req.flash("message", "The account has been created successfully.");
            return res.redirect('/manage');
          });
          // callback(null, user);
        });
      }
    });

    //     },
    //     function(user){
    //         var cart = new Cart();
    //         cart.owner = user._id;
    //         cart.save(function(err){
    //             if(err) return next(err);
    //             res.redirect("/users");
    //         });
    //     }
    // ]);
  } else {
    req.flash('errors', 'Please fillup all the required information.');
    console.log(req.body);
    return res.redirect('/manage/' + req.params.id);
  }
});

router.delete('/manage/:id', adminAuthentication, function (req, res, next) {
  Pending.findByIdAndRemove(req.params.id, function (err, pendingUser) {
    if (err) return next(err);
    req.flash("message", "Deletion successful.");
    res.redirect('/manage');
  });
});

router.get('/manageaccount', function (req, res, next) {
  if (req.query.Admin) {
    const regex = new RegExp(escapeRegex(req.query.Admin), "gi");
    User.find({
      user: "admin"
    }).sort({
      idNumber: -1
    }).exec(function (err, allUsers) {
      if (err) return next(err);
      res.render('admin/manageaccount', {
        users: allUsers
      });
    });

  } else if (req.query.Faculty) {
    const regex = new RegExp(escapeRegex(req.query.Faculty), "gi");
    User.find({
      user: "faculty"
    }).sort({
      idNumber: -1
    }).exec(function (err, allUsers) {
      if (err) return next(err);
      res.render('admin/manageaccount', {
        users: allUsers
      });
    });

  } else if (req.query.Student) {
    const regex = new RegExp(escapeRegex(req.query.Student), "gi");
    User.find({
      user: "student"
    }).sort({
      idNumber: -1
    }).exec(function (err, allUsers) {
      if (err) return next(err);
      res.render('admin/manageaccount', {
        users: allUsers
      });
    });


  } else {
    User.find({}, function (err, allUsers) {
      if (err) return next(err);
      res.render('admin/manageaccount', {
        users: allUsers
      });
    });
  }


});

router.get('/manageaccount/:id', adminAuthentication, function (req, res, next) {
  User.findById(req.params.id, function (err, user) {
    if (err) return next(err);
    console.log(user);
    res.render('admin/userdetails', {
      user: user
    });
  });
});

router.post("/manageaccount/:id", adminAuthentication, function (req, res, next) {
  User.findById(req.params.id, function (err, user) {
    if (err) return next(err);
    user.deactivate = true;
    user.save(function (err, save) {
      if (err) return next(err);
      req.flash("message", "You successfully deactivated this account");
      return res.redirect("/manageaccount");
    });
  });
});

router.get('/postnewsandannouncements', adminAuthentication, function (req, res, next) {
  User.count().exec(function (err, counter) {
    res.render('admin/postnews', {
      counter: counter
    });
  });
});

router.post('/postnewsandannouncements', adminAuthentication, function (req, res, next) {
  if (req.body.category && req.body.title && req.body.content) {
    var news = new News();
    news.postNumber = req.body.postNumber;
    news.category = req.body.category;
    news.title = req.body.title;
    news.content = req.sanitize(req.body.content);
    news.save(function (err, news) {
      if (err) return next(err);
      console.log(news);
      req.flash("message", "Added a new article.");
      res.redirect('/postnewsandannouncements');
    });
  }
  console.log(req.body);
});

router.get('/managenewsandannouncements', adminAuthentication, function (req, res, next) {
  if (req.query.sort == "postNumber") {
    const regex = new RegExp(escapeRegex(req.query.sort), "gi");
    News.find({
      archive: false
    }).sort({
      postNumber: 1
    }).exec(function (err, allNews) {
      if (err) return next(err);
      res.render('admin/managenews', {
        allNews: allNews
      });
    });
  } else if (req.query.category) {
    const regex = new RegExp(escapeRegex(req.query.category), "gi");
    News.find({
      archive: false,
      category: "news"
    }).sort({
      publishDate: -1
    }).exec(function (err, allNews) {
      if (err) return next(err);
      res.render('admin/managenews', {
        allNews: allNews
      });
    });

  } else if (req.query.announce) {
    const regex = new RegExp(escapeRegex(req.query.announce), "gi");
    News.find({
      archive: false,
      category: "announcement"
    }).sort({
      publishDate: -1
    }).exec(function (err, allNews) {
      if (err) return next(err);
      res.render('admin/managenews', {
        allNews: allNews
      });
    });
  } else {
    console.log("wew");
    News.find({
      archive: false
    }, function (err, allNews) {
      if (err) return next(err);
      res.render('admin/managenews', {
        allNews: allNews
      });
    });
  }
});

router.delete('/managenewsandannouncements/:id', adminAuthentication, function (req, res, next) {
  News.findById(req.params.id, function (err, news) {
    news.archive = true;
    news.content = req.sanitize(req.body.content);
    news.save(function (err, news) {
      if (err) return next(err);
      req.flash("message", "You successfully deleted an article.");
      res.redirect('/managenewsandannouncements');
    });
  });
});

router.post('/managenewsandannouncements/:id/edit', adminAuthentication, function (req, res, next) {
  News.findById(req.params.id, function (err, news) {
    if (err) return next(err);
    news.category = req.body.category;
    news.title = req.body.title;
    news.content = req.body.content;
    news.save(function (err, news) {
      if (err) return next(err);
      req.flash("message", "You successfully create a new " + req.body.category + ".");
      res.redirect('/managenewsandannouncements');
    });
  });
});

router.get('/enrollment', adminAuthentication, function (req, res, next) {
  if (req.query.lastName) {

    User.find({
      user: 'student',
      $or: [{
        section: '',
        yrLvl: ''
      }, {
        curriculum: "04/" + ((new Date()).getFullYear() - 1)
      }]
    }).sort({
      "profile.lastName": 1,
      "profile.firstName": 1,
      idNumber: -1
    }).exec(function (err, users) {
      if (err) return next(err);
      res.render('admin/enroll-student', {
        users: users
      });
    });
  } else if (req.query.idNumber) {
    User.find({
      user: 'student',
      idNumber: req.query.idNumber,
      $or: [{
        section: '',
        yrLvl: ''
      }, {
        curriculum: "04/" + ((new Date()).getFullYear() - 1)
      }]
    }, function (err, users) {
      if (err) return next(err);
      return res.render('admin/enroll-student', {
        users: users
      });
    });
  } else {
    User.find({
      user: 'student',
      $or: [{
        section: '',
        yrLvl: ''
      }, {
        curriculum: "04/" + ((new Date()).getFullYear() - 1)
      }]
    }).sort({
      _id: -1
    }).exec(function (err, users) {
      if (err) return next(err);
      console.log(users);
      res.render('admin/enroll-student', {
        users: users
      });

    });
  }
});

router.get('/enrollment/:id', adminAuthentication, function (req, res, next) {
  User.findById(req.params.id, function (err, user) {
    Handle.find({}, function (err, handles) {
      Curriculum.findOne({
        studentId: req.params.id,
        academicYear: (new Date()).getFullYear() + "-" + ((new Date()).getFullYear() + 1)
      }).exec(function (err, curriculum) {
        if (err) return next(err);
        User.find({
            user: 'faculty'
          })
          .populate("faculty")
          .exec(function (err, faculties) {
            if (err) return next(err);
            res.render('admin/enrolling', {
              user: user,
              faculties: faculties,
              handles: handles,
              curriculum: curriculum
            });
          });
      });
    });
  });
});

router.post('/enrollment/:id', adminAuthentication, function (req, res, next) {
  var curriculum = new Curriculum();
  User.findById(req.params.id, function (err, user) {
    user.section = req.body.section;
    user.yrLvl = req.body.yrLvl;
    user.curriculum = "04/" + (new Date()).getFullYear();
    curriculum.firstName = user.profile.firstName;
    curriculum.middleName = user.profile.middleName;
    curriculum.lastName = user.profile.lastName;
    curriculum.email = user.email;
    curriculum.studentId = user._id;
    curriculum.yrLvl = req.body.yrLvl;
    curriculum.section = req.body.section;
    if (req.body.yrLvl === "grade10" || req.body.yrLvl === "grade1" || req.body.yrLvl === "grade2" || req.body.yrLvl === "grade3" || req.body.yrLvl === "grade4" || req.body.yrLvl === "grade5" || req.body.yrLvl === "grade6" || req.body.yrLvl === "grade7" || req.body.yrLvl === "grade8" || req.body.yrLvl === "grade9") {
      if (!(req.body.faculty1 && req.body.faculty2 && req.body.faculty3 && req.body.faculty4 && req.body.faculty5 && req.body.faculty6 && req.body.faculty7 || req.body.faculty8 || req.body.faculty9 || req.body.faculty10)) {
        req.flash("message", "There is no faculty assigned on some subjects.");
        console.log("error ka")
        return res.redirect("/enrollment/" + req.params.id);
      }
    }
    if (req.body.yrLvl === "grade11" || req.body.yrLvl === "grade12") {
      if (!(req.body.shfaculty1 && req.body.shfaculty2 && req.body.shfaculty3 && req.body.shfaculty4 && req.body.shfaculty5 && req.body.shfaculty6 && req.body.shfaculty7 || req.body.shfaculty8 || req.body.shfaculty9 || req.body.shfaculty10)) {
        console.log("oops bawal pumasok")
        req.flash("message", "There is no faculty assigned on some subjects.");
        return res.redirect("/enrollment/" + req.params.id);
      }
    }
    console.log(user);
    console.log(req.body.yrLvl + ' and ' + req.body.yrLvl.length);
    if (req.body.yrLvl === 'grade1' || req.body.yrLvl === 'grade2') {
      var subject1 = new Subject();
      subject1.subject = req.body.subject1;
      subject1.email = user.email;
      subject1.firstName = user.profile.firstName;
      subject1.middleName = user.profile.middleName;
      subject1.lastName = user.profile.lastName;
      subject1.section = req.body.section;
      subject1.yrLvl = req.body.yrLvl;
      subject1.faculty = req.body.faculty1;
      curriculum.subjects.push(subject1);
      // Handle.findOne({
      //   faculty: req.body.faculty1, 
      //   subject: req.body.subject1, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      subject1.save();
      var subject2 = new Subject();
      subject2.subject = req.body.subject2;
      subject2.email = user.email;
      subject2.firstName = user.profile.firstName;
      subject2.middleName = user.profile.middleName;
      subject2.lastName = user.profile.lastName;
      subject2.section = req.body.section;
      subject2.yrLvl = req.body.yrLvl;
      subject2.faculty = req.body.faculty2;
      curriculum.subjects.push(subject2);
      subject2.save();
      // Handle.findOne({
      //   faculty: req.body.faculty2, 
      //   subject: req.body.subject2, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject3 = new Subject();
      subject3.subject = req.body.subject3;
      subject3.email = user.email;
      subject3.firstName = user.profile.firstName;
      subject3.middleName = user.profile.middleName;
      subject3.lastName = user.profile.lastName;
      subject3.section = req.body.section;
      subject3.yrLvl = req.body.yrLvl;
      subject3.faculty = req.body.faculty3;
      curriculum.subjects.push(subject3);
      subject3.save();
      // Handle.findOne({
      //   faculty: req.body.faculty3, 
      //   subject: req.body.subject3, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject4 = new Subject();
      subject4.subject = req.body.subject4;
      subject4.email = user.email;
      subject4.firstName = user.profile.firstName;
      subject4.middleName = user.profile.middleName;
      subject4.lastName = user.profile.lastName;
      subject4.section = req.body.section;
      subject4.yrLvl = req.body.yrLvl;
      subject4.faculty = req.body.faculty4;
      curriculum.subjects.push(subject4);
      subject4.save();
      // Handle.findOne({
      //   faculty: req.body.faculty4, 
      //   subject: req.body.subject4, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject5 = new Subject();
      subject5.subject = req.body.subject5;
      subject5.email = user.email;
      subject5.firstName = user.profile.firstName;
      subject5.middleName = user.profile.middleName;
      subject5.lastName = user.profile.lastName;
      subject5.section = req.body.section;
      subject5.yrLvl = req.body.yrLvl;
      subject5.faculty = req.body.faculty5;
      curriculum.subjects.push(subject5);
      subject5.save();
      // Handle.findOne({
      //   faculty: req.body.faculty5, 
      //   subject: req.body.subject5, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject6 = new Subject();
      subject6.subject = req.body.subject6;
      subject6.email = user.email;
      subject6.firstName = user.profile.firstName;
      subject6.middleName = user.profile.middleName;
      subject6.lastName = user.profile.lastName;
      subject6.section = req.body.section;
      subject6.yrLvl = req.body.yrLvl;
      subject6.faculty = req.body.faculty6;
      curriculum.subjects.push(subject6);
      subject6.save();
      // Handle.findOne({
      //   faculty: req.body.faculty6, 
      //   subject: req.body.subject6, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject7 = new Subject();
      subject7.subject = req.body.subject7;
      subject7.email = user.email;
      subject7.firstName = user.profile.firstName;
      subject7.middleName = user.profile.middleName;
      subject7.lastName = user.profile.lastName;
      subject7.section = req.body.section;
      subject7.yrLvl = req.body.yrLvl;
      subject7.faculty = req.body.faculty7;
      curriculum.subjects.push(subject7);
      subject7.save();
      // Handle.findOne({
      //   faculty: req.body.faculty7, 
      //   subject: req.body.subject7, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      user.save(function (err, user) {
        if (err) return next(err);
        console.log(user);
      });
      curriculum.save(function (err, curr) {
        if (err) return next(err);
        console.log(curr);
      });
      console.log(
        req.body.faculty1 +
        ', ' +
        req.body.faculty2 +
        ', ' +
        req.body.faculty3 +
        ', ' +
        req.body.faculty4 +
        ', ' +
        req.body.faculty5 +
        ', ' +
        req.body.faculty6 +
        ', ' +
        req.body.faculty7,
      );
      console.log('Success');
    } else if (req.body.yrLvl === 'grade3') {
      var subject1 = new Subject();
      subject1.subject = req.body.subject1;
      subject1.email = user.email;
      subject1.firstName = user.profile.firstName;
      subject1.middleName = user.profile.middleName;
      subject1.lastName = user.profile.lastName;
      subject1.section = req.body.section;
      subject1.yrLvl = req.body.yrLvl;
      subject1.faculty = req.body.faculty1;
      curriculum.subjects.push(subject1);
      // Handle.findOne({
      //   faculty: req.body.faculty1, 
      //   subject: req.body.subject1, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      subject1.save();
      var subject2 = new Subject();
      subject2.subject = req.body.subject2;
      subject2.email = user.email;
      subject2.firstName = user.profile.firstName;
      subject2.middleName = user.profile.middleName;
      subject2.lastName = user.profile.lastName;
      subject2.section = req.body.section;
      subject2.yrLvl = req.body.yrLvl;
      subject2.faculty = req.body.faculty2;
      curriculum.subjects.push(subject2);
      subject2.save();
      // Handle.findOne({
      //   faculty: req.body.faculty2, 
      //   subject: req.body.subject2, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject3 = new Subject();
      subject3.subject = req.body.subject3;
      subject3.email = user.email;
      subject3.firstName = user.profile.firstName;
      subject3.middleName = user.profile.middleName;
      subject3.lastName = user.profile.lastName;
      subject3.section = req.body.section;
      subject3.yrLvl = req.body.yrLvl;
      subject3.faculty = req.body.faculty3;
      curriculum.subjects.push(subject3);
      subject3.save();
      // Handle.findOne({
      //   faculty: req.body.faculty3, 
      //   subject: req.body.subject3, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject4 = new Subject();
      subject4.subject = req.body.subject4;
      subject4.email = user.email;
      subject4.firstName = user.profile.firstName;
      subject4.middleName = user.profile.middleName;
      subject4.lastName = user.profile.lastName;
      subject4.section = req.body.section;
      subject4.yrLvl = req.body.yrLvl;
      subject4.faculty = req.body.faculty4;
      curriculum.subjects.push(subject4);
      subject4.save();
      // Handle.findOne({
      //   faculty: req.body.faculty4, 
      //   subject: req.body.subject4, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject5 = new Subject();
      subject5.subject = req.body.subject5;
      subject5.email = user.email;
      subject5.firstName = user.profile.firstName;
      subject5.middleName = user.profile.middleName;
      subject5.lastName = user.profile.lastName;
      subject5.section = req.body.section;
      subject5.yrLvl = req.body.yrLvl;
      subject5.faculty = req.body.faculty5;
      curriculum.subjects.push(subject5);
      subject5.save();
      // Handle.findOne({
      //   faculty: req.body.faculty5, 
      //   subject: req.body.subject5, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject6 = new Subject();
      subject6.subject = req.body.subject6;
      subject6.email = user.email;
      subject6.firstName = user.profile.firstName;
      subject6.middleName = user.profile.middleName;
      subject6.lastName = user.profile.lastName;
      subject6.section = req.body.section;
      subject6.yrLvl = req.body.yrLvl;
      subject6.faculty = req.body.faculty6;
      curriculum.subjects.push(subject6);
      subject6.save();
      // Handle.findOne({
      //   faculty: req.body.faculty6, 
      //   subject: req.body.subject6, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject7 = new Subject();
      subject7.subject = req.body.subject7;
      subject7.email = user.email;
      subject7.firstName = user.profile.firstName;
      subject7.middleName = user.profile.middleName;
      subject7.lastName = user.profile.lastName;
      subject7.section = req.body.section;
      subject7.yrLvl = req.body.yrLvl;
      subject7.faculty = req.body.faculty7;
      curriculum.subjects.push(subject7);
      subject7.save();
      // Handle.findOne({
      //   faculty: req.body.faculty7, 
      //   subject: req.body.subject7, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject8 = new Subject();
      subject8.subject = req.body.subject8;
      subject8.email = user.email;
      subject8.firstName = user.profile.firstName;
      subject8.middleName = user.profile.middleName;
      subject8.lastName = user.profile.lastName;
      subject8.section = req.body.section;
      subject8.yrLvl = req.body.yrLvl;
      subject8.faculty = req.body.faculty8;
      curriculum.subjects.push(subject8);
      subject8.save();
      // Handle.findOne({
      //   faculty: req.body.faculty8, 
      //   subject: req.body.subject8, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      user.save(function (err, user) {
        if (err) return next(err);
        console.log(user);
      });
      curriculum.save(function (err, curr) {
        if (err) return next(err);
        console.log(curr);
      });
      console.log('Success');
    } else if (
      req.body.yrLvl === 'grade7' ||
      req.body.yrLvl === 'grade8' ||
      req.body.yrLvl === 'grade9' ||
      req.body.yrLvl === 'grade10'
    ) {
      var subject1 = new Subject();
      subject1.subject = req.body.subject1;
      subject1.email = user.email;
      subject1.firstName = user.profile.firstName;
      subject1.middleName = user.profile.middleName;
      subject1.lastName = user.profile.lastName;
      subject1.section = req.body.section;
      subject1.yrLvl = req.body.yrLvl;
      subject1.faculty = req.body.faculty1;
      curriculum.subjects.push(subject1);
      // Handle.findOne({
      //   faculty: req.body.faculty1, 
      //   subject: req.body.subject1, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      subject1.save();
      var subject2 = new Subject();
      subject2.subject = req.body.subject2;
      subject2.email = user.email;
      subject2.firstName = user.profile.firstName;
      subject2.middleName = user.profile.middleName;
      subject2.lastName = user.profile.lastName;
      subject2.section = req.body.section;
      subject2.yrLvl = req.body.yrLvl;
      subject2.faculty = req.body.faculty2;
      curriculum.subjects.push(subject2);
      subject2.save();
      // Handle.findOne({
      //   faculty: req.body.faculty2, 
      //   subject: req.body.subject2, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject3 = new Subject();
      subject3.subject = req.body.subject3;
      subject3.email = user.email;
      subject3.firstName = user.profile.firstName;
      subject3.middleName = user.profile.middleName;
      subject3.lastName = user.profile.lastName;
      subject3.section = req.body.section;
      subject3.yrLvl = req.body.yrLvl;
      subject3.faculty = req.body.faculty3;
      curriculum.subjects.push(subject3);
      subject3.save();
      // Handle.findOne({
      //   faculty: req.body.faculty3, 
      //   subject: req.body.subject3, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject4 = new Subject();
      subject4.subject = req.body.subject4;
      subject4.email = user.email;
      subject4.firstName = user.profile.firstName;
      subject4.middleName = user.profile.middleName;
      subject4.lastName = user.profile.lastName;
      subject4.section = req.body.section;
      subject4.yrLvl = req.body.yrLvl;
      subject4.faculty = req.body.faculty4;
      curriculum.subjects.push(subject4);
      subject4.save();
      // Handle.findOne({
      //   faculty: req.body.faculty4, 
      //   subject: req.body.subject4, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject5 = new Subject();
      subject5.subject = req.body.subject5;
      subject5.email = user.email;
      subject5.firstName = user.profile.firstName;
      subject5.middleName = user.profile.middleName;
      subject5.lastName = user.profile.lastName;
      subject5.section = req.body.section;
      subject5.yrLvl = req.body.yrLvl;
      subject5.faculty = req.body.faculty5;
      curriculum.subjects.push(subject5);
      subject5.save();
      // Handle.findOne({
      //   faculty: req.body.faculty5, 
      //   subject: req.body.subject5, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject6 = new Subject();
      subject6.subject = req.body.subject6;
      subject6.email = user.email;
      subject6.firstName = user.profile.firstName;
      subject6.middleName = user.profile.middleName;
      subject6.lastName = user.profile.lastName;
      subject6.section = req.body.section;
      subject6.yrLvl = req.body.yrLvl;
      subject6.faculty = req.body.faculty6;
      curriculum.subjects.push(subject6);
      subject6.save();
      // Handle.findOne({
      //   faculty: req.body.faculty6, 
      //   subject: req.body.subject6, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject7 = new Subject();
      subject7.subject = req.body.subject7;
      subject7.email = user.email;
      subject7.firstName = user.profile.firstName;
      subject7.middleName = user.profile.middleName;
      subject7.lastName = user.profile.lastName;
      subject7.section = req.body.section;
      subject7.yrLvl = req.body.yrLvl;
      subject7.faculty = req.body.faculty7;
      curriculum.subjects.push(subject7);
      subject7.save();
      // Handle.findOne({
      //   faculty: req.body.faculty7, 
      //   subject: req.body.subject7, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject8 = new Subject();
      subject8.subject = req.body.subject8;
      subject8.email = user.email;
      subject8.firstName = user.profile.firstName;
      subject8.middleName = user.profile.middleName;
      subject8.lastName = user.profile.lastName;
      subject8.section = req.body.section;
      subject8.yrLvl = req.body.yrLvl;
      subject8.faculty = req.body.faculty8;
      curriculum.subjects.push(subject8);
      subject8.save();
      // Handle.findOne({
      //   faculty: req.body.faculty8, 
      //   subject: req.body.subject8, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject9 = new Subject();
      subject9.subject = req.body.subject9;
      subject9.email = user.email;
      subject9.firstName = user.profile.firstName;
      subject9.middleName = user.profile.middleName;
      subject9.lastName = user.profile.lastName;
      subject9.section = req.body.section;
      subject9.yrLvl = req.body.yrLvl;
      subject9.faculty = req.body.faculty9;
      subject9.save();
      // Handle.findOne({
      //   faculty: req.body.faculty9, 
      //   subject: req.body.subject9, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      curriculum.subjects.push(subject9);
      user.save(function (err, user) {
        if (err) return next(err);
        console.log(user);
      });
      curriculum.save(function (err, curr) {
        if (err) return next(err);
        console.log(curr);
      });
      console.log('Success');
    } else if (
      req.body.yrLvl === 'grade4' ||
      req.body.yrLvl === 'grade5' ||
      req.body.yrLvl === 'grade6'
    ) {
      var subject1 = new Subject();
      subject1.subject = req.body.subject1;
      subject1.email = user.email;
      subject1.firstName = user.profile.firstName;
      subject1.middleName = user.profile.middleName;
      subject1.lastName = user.profile.lastName;
      subject1.section = req.body.section;
      subject1.yrLvl = req.body.yrLvl;
      subject1.faculty = req.body.faculty1;
      curriculum.subjects.push(subject1);
      // Handle.findOne({
      //   faculty: req.body.faculty1, 
      //   subject: req.body.subject1, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      subject1.save();
      var subject2 = new Subject();
      subject2.subject = req.body.subject2;
      subject2.email = user.email;
      subject2.firstName = user.profile.firstName;
      subject2.middleName = user.profile.middleName;
      subject2.lastName = user.profile.lastName;
      subject2.section = req.body.section;
      subject2.yrLvl = req.body.yrLvl;
      subject2.faculty = req.body.faculty2;
      curriculum.subjects.push(subject2);
      subject2.save();
      // Handle.findOne({
      //   faculty: req.body.faculty2, 
      //   subject: req.body.subject2, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject3 = new Subject();
      subject3.subject = req.body.subject3;
      subject3.email = user.email;
      subject3.firstName = user.profile.firstName;
      subject3.middleName = user.profile.middleName;
      subject3.lastName = user.profile.lastName;
      subject3.section = req.body.section;
      subject3.yrLvl = req.body.yrLvl;
      subject3.faculty = req.body.faculty3;
      curriculum.subjects.push(subject3);
      subject3.save();
      // Handle.findOne({
      //   faculty: req.body.faculty3, 
      //   subject: req.body.subject3, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject4 = new Subject();
      subject4.subject = req.body.subject4;
      subject4.email = user.email;
      subject4.firstName = user.profile.firstName;
      subject4.middleName = user.profile.middleName;
      subject4.lastName = user.profile.lastName;
      subject4.section = req.body.section;
      subject4.yrLvl = req.body.yrLvl;
      subject4.faculty = req.body.faculty4;
      curriculum.subjects.push(subject4);
      subject4.save();
      // Handle.findOne({
      //   faculty: req.body.faculty4, 
      //   subject: req.body.subject4, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject5 = new Subject();
      subject5.subject = req.body.subject5;
      subject5.email = user.email;
      subject5.firstName = user.profile.firstName;
      subject5.middleName = user.profile.middleName;
      subject5.lastName = user.profile.lastName;
      subject5.section = req.body.section;
      subject5.yrLvl = req.body.yrLvl;
      subject5.faculty = req.body.faculty5;
      curriculum.subjects.push(subject5);
      subject5.save();
      // Handle.findOne({
      //   faculty: req.body.faculty5, 
      //   subject: req.body.subject5, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject6 = new Subject();
      subject6.subject = req.body.subject6;
      subject6.email = user.email;
      subject6.firstName = user.profile.firstName;
      subject6.middleName = user.profile.middleName;
      subject6.lastName = user.profile.lastName;
      subject6.section = req.body.section;
      subject6.yrLvl = req.body.yrLvl;
      subject6.faculty = req.body.faculty6;
      curriculum.subjects.push(subject6);
      subject6.save();
      // Handle.findOne({
      //   faculty: req.body.faculty6, 
      //   subject: req.body.subject6, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject7 = new Subject();
      subject7.subject = req.body.subject7;
      subject7.email = user.email;
      subject7.firstName = user.profile.firstName;
      subject7.middleName = user.profile.middleName;
      subject7.lastName = user.profile.lastName;
      subject7.section = req.body.section;
      subject7.yrLvl = req.body.yrLvl;
      subject7.faculty = req.body.faculty7;
      curriculum.subjects.push(subject7);
      subject7.save();
      // Handle.findOne({
      //   faculty: req.body.faculty7, 
      //   subject: req.body.subject7, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject8 = new Subject();
      subject8.subject = req.body.subject8;
      subject8.email = user.email;
      subject8.firstName = user.profile.firstName;
      subject8.middleName = user.profile.middleName;
      subject8.lastName = user.profile.lastName;
      subject8.section = req.body.section;
      subject8.yrLvl = req.body.yrLvl;
      subject8.faculty = req.body.faculty8;
      curriculum.subjects.push(subject8);
      subject8.save();
      // Handle.findOne({
      //   faculty: req.body.faculty8, 
      //   subject: req.body.subject8, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject9 = new Subject();
      subject9.subject = req.body.subject10;
      subject9.email = user.email;
      subject9.firstName = user.profile.firstName;
      subject9.middleName = user.profile.middleName;
      subject9.lastName = user.profile.lastName;
      subject9.section = req.body.section;
      subject9.yrLvl = req.body.yrLvl;
      subject9.faculty = req.body.faculty10;
      subject9.save();
      // Handle.findOne({
      //   faculty: req.body.faculty10, 
      //   subject: req.body.subject10, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      curriculum.subjects.push(subject9);
      user.save(function (err, user) {
        if (err) return next(err);
        console.log(user);
      });
      curriculum.save(function (err, curr) {
        if (err) return next(err);
        console.log(curr);
      });
      console.log('Success');
    } else if (req.body.yrLvl === "grade11" && req.body.section === "Sciences Technology Engineering and Mathematics") {
      var subject1 = new Subject();
      subject1.subject = req.body.shsubject1;
      subject1.email = user.email;
      subject1.firstName = user.profile.firstName;
      subject1.middleName = user.profile.middleName;
      subject1.lastName = user.profile.lastName;
      subject1.section = req.body.section;
      subject1.yrLvl = req.body.yrLvl;
      subject1.faculty = req.body.shfaculty1;
      curriculum.subjects.push(subject1);
      // Handle.findOne({
      //   faculty: req.body.faculty1, 
      //   subject: req.body.subject1, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      subject1.save();
      var subject2 = new Subject();
      subject2.subject = req.body.shsubject2;
      subject2.email = user.email;
      subject2.firstName = user.profile.firstName;
      subject2.middleName = user.profile.middleName;
      subject2.lastName = user.profile.lastName;
      subject2.section = req.body.section;
      subject2.yrLvl = req.body.yrLvl;
      subject2.faculty = req.body.shfaculty2;
      curriculum.subjects.push(subject2);
      subject2.save();
      // Handle.findOne({
      //   faculty: req.body.faculty2, 
      //   subject: req.body.subject2, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject3 = new Subject();
      subject3.subject = req.body.shsubject3;
      subject3.email = user.email;
      subject3.firstName = user.profile.firstName;
      subject3.middleName = user.profile.middleName;
      subject3.lastName = user.profile.lastName;
      subject3.section = req.body.section;
      subject3.yrLvl = req.body.yrLvl;
      subject3.faculty = req.body.shfaculty3;
      curriculum.subjects.push(subject3);
      subject3.save();
      // Handle.findOne({
      //   faculty: req.body.faculty3, 
      //   subject: req.body.subject3, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject4 = new Subject();
      subject4.subject = req.body.shsubject4;
      subject4.email = user.email;
      subject4.firstName = user.profile.firstName;
      subject4.middleName = user.profile.middleName;
      subject4.lastName = user.profile.lastName;
      subject4.section = req.body.section;
      subject4.yrLvl = req.body.yrLvl;
      subject4.faculty = req.body.shfaculty4;
      curriculum.subjects.push(subject4);
      subject4.save();
      // Handle.findOne({
      //   faculty: req.body.faculty4, 
      //   subject: req.body.subject4, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject5 = new Subject();
      subject5.subject = req.body.shsubject5;
      subject5.email = user.email;
      subject5.firstName = user.profile.firstName;
      subject5.middleName = user.profile.middleName;
      subject5.lastName = user.profile.lastName;
      subject5.section = req.body.section;
      subject5.yrLvl = req.body.yrLvl;
      subject5.faculty = req.body.shfaculty5;
      curriculum.subjects.push(subject5);
      subject5.save();
      // Handle.findOne({
      //   faculty: req.body.faculty5, 
      //   subject: req.body.subject5, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject6 = new Subject();
      subject6.subject = req.body.shsubject6;
      subject6.email = user.email;
      subject6.firstName = user.profile.firstName;
      subject6.middleName = user.profile.middleName;
      subject6.lastName = user.profile.lastName;
      subject6.section = req.body.section;
      subject6.yrLvl = req.body.yrLvl;
      subject6.faculty = req.body.shfaculty6;
      curriculum.subjects.push(subject6);
      subject6.save();
      // Handle.findOne({
      //   faculty: req.body.faculty6, 
      //   subject: req.body.subject6, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject7 = new Subject();
      subject7.subject = req.body.shsubject7;
      subject7.email = user.email;
      subject7.firstName = user.profile.firstName;
      subject7.middleName = user.profile.middleName;
      subject7.lastName = user.profile.lastName;
      subject7.section = req.body.section;
      subject7.yrLvl = req.body.yrLvl;
      subject7.faculty = req.body.shfaculty7;
      curriculum.subjects.push(subject7);
      subject7.save();
      // Handle.findOne({
      //   faculty: req.body.faculty7, 
      //   subject: req.body.subject7, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject8 = new Subject();
      subject8.subject = req.body.shsubject8;
      subject8.email = user.email;
      subject8.firstName = user.profile.firstName;
      subject8.middleName = user.profile.middleName;
      subject8.lastName = user.profile.lastName;
      subject8.section = req.body.section;
      subject8.yrLvl = req.body.yrLvl;
      subject8.faculty = req.body.shfaculty8;
      curriculum.subjects.push(subject8);
      subject8.save();
      // Handle.findOne({
      //   faculty: req.body.faculty8, 
      //   subject: req.body.subject8, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject9 = new Subject();
      subject9.subject = req.body.shsubject9;
      subject9.email = user.email;
      subject9.firstName = user.profile.firstName;
      subject9.middleName = user.profile.middleName;
      subject9.lastName = user.profile.lastName;
      subject9.section = req.body.section;
      subject9.yrLvl = req.body.yrLvl;
      subject9.faculty = req.body.shfaculty9;
      subject9.save();
      // Handle.findOne({
      //   faculty: req.body.faculty10, 
      //   subject: req.body.subject10, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      curriculum.subjects.push(subject9);
      user.save(function (err, user) {
        if (err) return next(err);
        console.log(user);
      });
      curriculum.save(function (err, curr) {
        if (err) return next(err);
        console.log(curr);
      });
      console.log('Success');
    } else if (req.body.yrLvl === "grade11" && req.body.section === "Accountancy") {
      var subject1 = new Subject();
      subject1.subject = req.body.shsubject1;
      subject1.email = user.email;
      subject1.firstName = user.profile.firstName;
      subject1.middleName = user.profile.middleName;
      subject1.lastName = user.profile.lastName;
      subject1.section = req.body.section;
      subject1.yrLvl = req.body.yrLvl;
      subject1.faculty = req.body.shfaculty1;
      curriculum.subjects.push(subject1);
      // Handle.findOne({
      //   faculty: req.body.faculty1, 
      //   subject: req.body.subject1, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      subject1.save();
      var subject2 = new Subject();
      subject2.subject = req.body.shsubject2;
      subject2.email = user.email;
      subject2.firstName = user.profile.firstName;
      subject2.middleName = user.profile.middleName;
      subject2.lastName = user.profile.lastName;
      subject2.section = req.body.section;
      subject2.yrLvl = req.body.yrLvl;
      subject2.faculty = req.body.shfaculty2;
      curriculum.subjects.push(subject2);
      subject2.save();
      // Handle.findOne({
      //   faculty: req.body.faculty2, 
      //   subject: req.body.subject2, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject3 = new Subject();
      subject3.subject = req.body.shsubject3;
      subject3.email = user.email;
      subject3.firstName = user.profile.firstName;
      subject3.middleName = user.profile.middleName;
      subject3.lastName = user.profile.lastName;
      subject3.section = req.body.section;
      subject3.yrLvl = req.body.yrLvl;
      subject3.faculty = req.body.shfaculty3;
      curriculum.subjects.push(subject3);
      subject3.save();
      // Handle.findOne({
      //   faculty: req.body.faculty3, 
      //   subject: req.body.subject3, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject4 = new Subject();
      subject4.subject = req.body.shsubject4;
      subject4.email = user.email;
      subject4.firstName = user.profile.firstName;
      subject4.middleName = user.profile.middleName;
      subject4.lastName = user.profile.lastName;
      subject4.section = req.body.section;
      subject4.yrLvl = req.body.yrLvl;
      subject4.faculty = req.body.shfaculty4;
      curriculum.subjects.push(subject4);
      subject4.save();
      // Handle.findOne({
      //   faculty: req.body.faculty4, 
      //   subject: req.body.subject4, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject5 = new Subject();
      subject5.subject = req.body.shsubject5;
      subject5.email = user.email;
      subject5.firstName = user.profile.firstName;
      subject5.middleName = user.profile.middleName;
      subject5.lastName = user.profile.lastName;
      subject5.section = req.body.section;
      subject5.yrLvl = req.body.yrLvl;
      subject5.faculty = req.body.shfaculty5;
      curriculum.subjects.push(subject5);
      subject5.save();
      // Handle.findOne({
      //   faculty: req.body.faculty5, 
      //   subject: req.body.subject5, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject6 = new Subject();
      subject6.subject = req.body.shsubject6;
      subject6.email = user.email;
      subject6.firstName = user.profile.firstName;
      subject6.middleName = user.profile.middleName;
      subject6.lastName = user.profile.lastName;
      subject6.section = req.body.section;
      subject6.yrLvl = req.body.yrLvl;
      subject6.faculty = req.body.shfaculty6;
      curriculum.subjects.push(subject6);
      subject6.save();
      // Handle.findOne({
      //   faculty: req.body.faculty6, 
      //   subject: req.body.subject6, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject7 = new Subject();
      subject7.subject = req.body.shsubject7;
      subject7.email = user.email;
      subject7.firstName = user.profile.firstName;
      subject7.middleName = user.profile.middleName;
      subject7.lastName = user.profile.lastName;
      subject7.section = req.body.section;
      subject7.yrLvl = req.body.yrLvl;
      subject7.faculty = req.body.shfaculty7;
      curriculum.subjects.push(subject7);
      subject7.save();
      // Handle.findOne({
      //   faculty: req.body.faculty7, 
      //   subject: req.body.subject7, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject8 = new Subject();
      subject8.subject = req.body.shsubject8;
      subject8.email = user.email;
      subject8.firstName = user.profile.firstName;
      subject8.middleName = user.profile.middleName;
      subject8.lastName = user.profile.lastName;
      subject8.section = req.body.section;
      subject8.yrLvl = req.body.yrLvl;
      subject8.faculty = req.body.shfaculty8;
      curriculum.subjects.push(subject8);
      subject8.save();
      // Handle.findOne({
      //   faculty: req.body.faculty8, 
      //   subject: req.body.subject8, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      // Handle.findOne({
      //   faculty: req.body.faculty10, 
      //   subject: req.body.subject10, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      user.save(function (err, user) {
        if (err) return next(err);
        console.log(user);
      });
      curriculum.save(function (err, curr) {
        if (err) return next(err);
        console.log(curr);
      });
      console.log('Success');
    } else if (req.body.yrLvl === "grade11" && req.body.section === "Business Management") {
      var subject1 = new Subject();
      subject1.subject = req.body.shsubject1;
      subject1.email = user.email;
      subject1.firstName = user.profile.firstName;
      subject1.middleName = user.profile.middleName;
      subject1.lastName = user.profile.lastName;
      subject1.section = req.body.section;
      subject1.yrLvl = req.body.yrLvl;
      subject1.faculty = req.body.shfaculty1;
      curriculum.subjects.push(subject1);
      // Handle.findOne({
      //   faculty: req.body.faculty1, 
      //   subject: req.body.subject1, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      subject1.save();
      var subject2 = new Subject();
      subject2.subject = req.body.shsubject2;
      subject2.email = user.email;
      subject2.firstName = user.profile.firstName;
      subject2.middleName = user.profile.middleName;
      subject2.lastName = user.profile.lastName;
      subject2.section = req.body.section;
      subject2.yrLvl = req.body.yrLvl;
      subject2.faculty = req.body.shfaculty2;
      curriculum.subjects.push(subject2);
      subject2.save();
      // Handle.findOne({
      //   faculty: req.body.faculty2, 
      //   subject: req.body.subject2, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject3 = new Subject();
      subject3.subject = req.body.shsubject3;
      subject3.email = user.email;
      subject3.firstName = user.profile.firstName;
      subject3.middleName = user.profile.middleName;
      subject3.lastName = user.profile.lastName;
      subject3.section = req.body.section;
      subject3.yrLvl = req.body.yrLvl;
      subject3.faculty = req.body.shfaculty3;
      curriculum.subjects.push(subject3);
      subject3.save();
      // Handle.findOne({
      //   faculty: req.body.faculty3, 
      //   subject: req.body.subject3, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject4 = new Subject();
      subject4.subject = req.body.shsubject4;
      subject4.email = user.email;
      subject4.firstName = user.profile.firstName;
      subject4.middleName = user.profile.middleName;
      subject4.lastName = user.profile.lastName;
      subject4.section = req.body.section;
      subject4.yrLvl = req.body.yrLvl;
      subject4.faculty = req.body.shfaculty4;
      curriculum.subjects.push(subject4);
      subject4.save();
      // Handle.findOne({
      //   faculty: req.body.faculty4, 
      //   subject: req.body.subject4, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject5 = new Subject();
      subject5.subject = req.body.shsubject5;
      subject5.email = user.email;
      subject5.firstName = user.profile.firstName;
      subject5.middleName = user.profile.middleName;
      subject5.lastName = user.profile.lastName;
      subject5.section = req.body.section;
      subject5.yrLvl = req.body.yrLvl;
      subject5.faculty = req.body.shfaculty5;
      curriculum.subjects.push(subject5);
      subject5.save();
      // Handle.findOne({
      //   faculty: req.body.faculty5, 
      //   subject: req.body.subject5, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject6 = new Subject();
      subject6.subject = req.body.shsubject6;
      subject6.email = user.email;
      subject6.firstName = user.profile.firstName;
      subject6.middleName = user.profile.middleName;
      subject6.lastName = user.profile.lastName;
      subject6.section = req.body.section;
      subject6.yrLvl = req.body.yrLvl;
      subject6.faculty = req.body.shfaculty6;
      curriculum.subjects.push(subject6);
      subject6.save();
      // Handle.findOne({
      //   faculty: req.body.faculty6, 
      //   subject: req.body.subject6, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject7 = new Subject();
      subject7.subject = req.body.shsubject7;
      subject7.email = user.email;
      subject7.firstName = user.profile.firstName;
      subject7.middleName = user.profile.middleName;
      subject7.lastName = user.profile.lastName;
      subject7.section = req.body.section;
      subject7.yrLvl = req.body.yrLvl;
      subject7.faculty = req.body.shfaculty7;
      curriculum.subjects.push(subject7);
      subject7.save();
      // Handle.findOne({
      //   faculty: req.body.faculty7, 
      //   subject: req.body.subject7, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject8 = new Subject();
      subject8.subject = req.body.shsubject8;
      subject8.email = user.email;
      subject8.firstName = user.profile.firstName;
      subject8.middleName = user.profile.middleName;
      subject8.lastName = user.profile.lastName;
      subject8.section = req.body.section;
      subject8.yrLvl = req.body.yrLvl;
      subject8.faculty = req.body.shfaculty8;
      curriculum.subjects.push(subject8);
      subject8.save();
      // Handle.findOne({
      //   faculty: req.body.faculty8, 
      //   subject: req.body.subject8, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      // Handle.findOne({
      //   faculty: req.body.faculty10, 
      //   subject: req.body.subject10, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      user.save(function (err, user) {
        if (err) return next(err);
        console.log(user);
      });
      curriculum.save(function (err, curr) {
        if (err) return next(err);
        console.log(curr);
      });
      console.log('Success');
    } else if (req.body.yrLvl === "grade11" && req.body.section === "Humanities and Social Sciences") {
      var subject1 = new Subject();
      subject1.subject = req.body.shsubject1;
      subject1.email = user.email;
      subject1.firstName = user.profile.firstName;
      subject1.middleName = user.profile.middleName;
      subject1.lastName = user.profile.lastName;
      subject1.section = req.body.section;
      subject1.yrLvl = req.body.yrLvl;
      subject1.faculty = req.body.shfaculty1;
      curriculum.subjects.push(subject1);
      // Handle.findOne({
      //   faculty: req.body.faculty1, 
      //   subject: req.body.subject1, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      subject1.save();
      var subject2 = new Subject();
      subject2.subject = req.body.shsubject2;
      subject2.email = user.email;
      subject2.firstName = user.profile.firstName;
      subject2.middleName = user.profile.middleName;
      subject2.lastName = user.profile.lastName;
      subject2.section = req.body.section;
      subject2.yrLvl = req.body.yrLvl;
      subject2.faculty = req.body.shfaculty2;
      curriculum.subjects.push(subject2);
      subject2.save();
      // Handle.findOne({
      //   faculty: req.body.faculty2, 
      //   subject: req.body.subject2, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject3 = new Subject();
      subject3.subject = req.body.shsubject3;
      subject3.email = user.email;
      subject3.firstName = user.profile.firstName;
      subject3.middleName = user.profile.middleName;
      subject3.lastName = user.profile.lastName;
      subject3.section = req.body.section;
      subject3.yrLvl = req.body.yrLvl;
      subject3.faculty = req.body.shfaculty3;
      curriculum.subjects.push(subject3);
      subject3.save();
      // Handle.findOne({
      //   faculty: req.body.faculty3, 
      //   subject: req.body.subject3, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject4 = new Subject();
      subject4.subject = req.body.shsubject4;
      subject4.email = user.email;
      subject4.firstName = user.profile.firstName;
      subject4.middleName = user.profile.middleName;
      subject4.lastName = user.profile.lastName;
      subject4.section = req.body.section;
      subject4.yrLvl = req.body.yrLvl;
      subject4.faculty = req.body.shfaculty4;
      curriculum.subjects.push(subject4);
      subject4.save();
      // Handle.findOne({
      //   faculty: req.body.faculty4, 
      //   subject: req.body.subject4, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject5 = new Subject();
      subject5.subject = req.body.shsubject5;
      subject5.email = user.email;
      subject5.firstName = user.profile.firstName;
      subject5.middleName = user.profile.middleName;
      subject5.lastName = user.profile.lastName;
      subject5.section = req.body.section;
      subject5.yrLvl = req.body.yrLvl;
      subject5.faculty = req.body.shfaculty5;
      curriculum.subjects.push(subject5);
      subject5.save();
      // Handle.findOne({
      //   faculty: req.body.faculty5, 
      //   subject: req.body.subject5, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject6 = new Subject();
      subject6.subject = req.body.shsubject6;
      subject6.email = user.email;
      subject6.firstName = user.profile.firstName;
      subject6.middleName = user.profile.middleName;
      subject6.lastName = user.profile.lastName;
      subject6.section = req.body.section;
      subject6.yrLvl = req.body.yrLvl;
      subject6.faculty = req.body.shfaculty6;
      curriculum.subjects.push(subject6);
      subject6.save();
      // Handle.findOne({
      //   faculty: req.body.faculty6, 
      //   subject: req.body.subject6, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject7 = new Subject();
      subject7.subject = req.body.shsubject7;
      subject7.email = user.email;
      subject7.firstName = user.profile.firstName;
      subject7.middleName = user.profile.middleName;
      subject7.lastName = user.profile.lastName;
      subject7.section = req.body.section;
      subject7.yrLvl = req.body.yrLvl;
      subject7.faculty = req.body.shfaculty7;
      curriculum.subjects.push(subject7);
      subject7.save();
      // Handle.findOne({
      //   faculty: req.body.faculty7, 
      //   subject: req.body.subject7, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject8 = new Subject();
      subject8.subject = req.body.shsubject8;
      subject8.email = user.email;
      subject8.firstName = user.profile.firstName;
      subject8.middleName = user.profile.middleName;
      subject8.lastName = user.profile.lastName;
      subject8.section = req.body.section;
      subject8.yrLvl = req.body.yrLvl;
      subject8.faculty = req.body.shfaculty8;
      curriculum.subjects.push(subject8);
      subject8.save();
      // Handle.findOne({
      //   faculty: req.body.faculty8, 
      //   subject: req.body.subject8, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      // Handle.findOne({
      //   faculty: req.body.faculty10, 
      //   subject: req.body.subject10, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      user.save(function (err, user) {
        if (err) return next(err);
        console.log(user);
      });
      curriculum.save(function (err, curr) {
        if (err) return next(err);
        console.log(curr);
      });
      console.log('Success');
    } else if (req.body.yrLvl === "grade11" && req.body.section === "Information and Communication Technology") {
      var subject1 = new Subject();
      subject1.subject = req.body.shsubject1;
      subject1.email = user.email;
      subject1.firstName = user.profile.firstName;
      subject1.middleName = user.profile.middleName;
      subject1.lastName = user.profile.lastName;
      subject1.section = req.body.section;
      subject1.yrLvl = req.body.yrLvl;
      subject1.faculty = req.body.shfaculty1;
      curriculum.subjects.push(subject1);
      // Handle.findOne({
      //   faculty: req.body.faculty1, 
      //   subject: req.body.subject1, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      subject1.save();
      var subject2 = new Subject();
      subject2.subject = req.body.shsubject2;
      subject2.email = user.email;
      subject2.firstName = user.profile.firstName;
      subject2.middleName = user.profile.middleName;
      subject2.lastName = user.profile.lastName;
      subject2.section = req.body.section;
      subject2.yrLvl = req.body.yrLvl;
      subject2.faculty = req.body.shfaculty2;
      curriculum.subjects.push(subject2);
      subject2.save();
      // Handle.findOne({
      //   faculty: req.body.faculty2, 
      //   subject: req.body.subject2, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject3 = new Subject();
      subject3.subject = req.body.shsubject3;
      subject3.email = user.email;
      subject3.firstName = user.profile.firstName;
      subject3.middleName = user.profile.middleName;
      subject3.lastName = user.profile.lastName;
      subject3.section = req.body.section;
      subject3.yrLvl = req.body.yrLvl;
      subject3.faculty = req.body.shfaculty3;
      curriculum.subjects.push(subject3);
      subject3.save();
      // Handle.findOne({
      //   faculty: req.body.faculty3, 
      //   subject: req.body.subject3, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject4 = new Subject();
      subject4.subject = req.body.shsubject4;
      subject4.email = user.email;
      subject4.firstName = user.profile.firstName;
      subject4.middleName = user.profile.middleName;
      subject4.lastName = user.profile.lastName;
      subject4.section = req.body.section;
      subject4.yrLvl = req.body.yrLvl;
      subject4.faculty = req.body.shfaculty4;
      curriculum.subjects.push(subject4);
      subject4.save();
      // Handle.findOne({
      //   faculty: req.body.faculty4, 
      //   subject: req.body.subject4, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject5 = new Subject();
      subject5.subject = req.body.shsubject5;
      subject5.email = user.email;
      subject5.firstName = user.profile.firstName;
      subject5.middleName = user.profile.middleName;
      subject5.lastName = user.profile.lastName;
      subject5.section = req.body.section;
      subject5.yrLvl = req.body.yrLvl;
      subject5.faculty = req.body.shfaculty5;
      curriculum.subjects.push(subject5);
      subject5.save();
      // Handle.findOne({
      //   faculty: req.body.faculty5, 
      //   subject: req.body.subject5, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject6 = new Subject();
      subject6.subject = req.body.shsubject6;
      subject6.email = user.email;
      subject6.firstName = user.profile.firstName;
      subject6.middleName = user.profile.middleName;
      subject6.lastName = user.profile.lastName;
      subject6.section = req.body.section;
      subject6.yrLvl = req.body.yrLvl;
      subject6.faculty = req.body.shfaculty6;
      curriculum.subjects.push(subject6);
      subject6.save();
      // Handle.findOne({
      //   faculty: req.body.faculty6, 
      //   subject: req.body.subject6, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject7 = new Subject();
      subject7.subject = req.body.shsubject7;
      subject7.email = user.email;
      subject7.firstName = user.profile.firstName;
      subject7.middleName = user.profile.middleName;
      subject7.lastName = user.profile.lastName;
      subject7.section = req.body.section;
      subject7.yrLvl = req.body.yrLvl;
      subject7.faculty = req.body.shfaculty7;
      curriculum.subjects.push(subject7);
      subject7.save();

      user.save(function (err, user) {
        if (err) return next(err);
        console.log(user);
      });
      curriculum.save(function (err, curr) {
        if (err) return next(err);
        console.log(curr);
      });
      console.log('Success');
    } else if (req.body.yrLvl === "grade11" && req.body.section === "Home Economics") {
      var subject1 = new Subject();
      subject1.subject = req.body.shsubject1;
      subject1.email = user.email;
      subject1.firstName = user.profile.firstName;
      subject1.middleName = user.profile.middleName;
      subject1.lastName = user.profile.lastName;
      subject1.section = req.body.section;
      subject1.yrLvl = req.body.yrLvl;
      subject1.faculty = req.body.shfaculty1;
      curriculum.subjects.push(subject1);
      // Handle.findOne({
      //   faculty: req.body.faculty1, 
      //   subject: req.body.subject1, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      subject1.save();
      var subject2 = new Subject();
      subject2.subject = req.body.shsubject2;
      subject2.email = user.email;
      subject2.firstName = user.profile.firstName;
      subject2.middleName = user.profile.middleName;
      subject2.lastName = user.profile.lastName;
      subject2.section = req.body.section;
      subject2.yrLvl = req.body.yrLvl;
      subject2.faculty = req.body.shfaculty2;
      curriculum.subjects.push(subject2);
      subject2.save();
      // Handle.findOne({
      //   faculty: req.body.faculty2, 
      //   subject: req.body.subject2, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject3 = new Subject();
      subject3.subject = req.body.shsubject3;
      subject3.email = user.email;
      subject3.firstName = user.profile.firstName;
      subject3.middleName = user.profile.middleName;
      subject3.lastName = user.profile.lastName;
      subject3.section = req.body.section;
      subject3.yrLvl = req.body.yrLvl;
      subject3.faculty = req.body.shfaculty3;
      curriculum.subjects.push(subject3);
      subject3.save();
      // Handle.findOne({
      //   faculty: req.body.faculty3, 
      //   subject: req.body.subject3, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject4 = new Subject();
      subject4.subject = req.body.shsubject4;
      subject4.email = user.email;
      subject4.firstName = user.profile.firstName;
      subject4.middleName = user.profile.middleName;
      subject4.lastName = user.profile.lastName;
      subject4.section = req.body.section;
      subject4.yrLvl = req.body.yrLvl;
      subject4.faculty = req.body.shfaculty4;
      curriculum.subjects.push(subject4);
      subject4.save();
      // Handle.findOne({
      //   faculty: req.body.faculty4, 
      //   subject: req.body.subject4, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject5 = new Subject();
      subject5.subject = req.body.shsubject5;
      subject5.email = user.email;
      subject5.firstName = user.profile.firstName;
      subject5.middleName = user.profile.middleName;
      subject5.lastName = user.profile.lastName;
      subject5.section = req.body.section;
      subject5.yrLvl = req.body.yrLvl;
      subject5.faculty = req.body.shfaculty5;
      curriculum.subjects.push(subject5);
      subject5.save();
      // Handle.findOne({
      //   faculty: req.body.faculty5, 
      //   subject: req.body.subject5, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject6 = new Subject();
      subject6.subject = req.body.shsubject6;
      subject6.email = user.email;
      subject6.firstName = user.profile.firstName;
      subject6.middleName = user.profile.middleName;
      subject6.lastName = user.profile.lastName;
      subject6.section = req.body.section;
      subject6.yrLvl = req.body.yrLvl;
      subject6.faculty = req.body.shfaculty6;
      curriculum.subjects.push(subject6);
      subject6.save();
      // Handle.findOne({
      //   faculty: req.body.faculty6, 
      //   subject: req.body.subject6, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject7 = new Subject();
      subject7.subject = req.body.shsubject7;
      subject7.email = user.email;
      subject7.firstName = user.profile.firstName;
      subject7.middleName = user.profile.middleName;
      subject7.lastName = user.profile.lastName;
      subject7.section = req.body.section;
      subject7.yrLvl = req.body.yrLvl;
      subject7.faculty = req.body.shfaculty7;
      curriculum.subjects.push(subject7);
      subject7.save();

      user.save(function (err, user) {
        if (err) return next(err);
        console.log(user);
      });
      curriculum.save(function (err, curr) {
        if (err) return next(err);
        console.log(curr);
      });
      console.log('Success');
    } else if (req.body.yrLvl === "grade12" && req.body.section === "Sciences Technology Engineering and Mathematics") {
      var subject1 = new Subject();
      subject1.subject = req.body.shsubject1;
      subject1.email = user.email;
      subject1.firstName = user.profile.firstName;
      subject1.middleName = user.profile.middleName;
      subject1.lastName = user.profile.lastName;
      subject1.section = req.body.section;
      subject1.yrLvl = req.body.yrLvl;
      subject1.faculty = req.body.shfaculty1;
      curriculum.subjects.push(subject1);
      // Handle.findOne({
      //   faculty: req.body.faculty1, 
      //   subject: req.body.subject1, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      subject1.save();
      var subject2 = new Subject();
      subject2.subject = req.body.shsubject2;
      subject2.email = user.email;
      subject2.firstName = user.profile.firstName;
      subject2.middleName = user.profile.middleName;
      subject2.lastName = user.profile.lastName;
      subject2.section = req.body.section;
      subject2.yrLvl = req.body.yrLvl;
      subject2.faculty = req.body.shfaculty2;
      curriculum.subjects.push(subject2);
      subject2.save();
      // Handle.findOne({
      //   faculty: req.body.faculty2, 
      //   subject: req.body.subject2, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject3 = new Subject();
      subject3.subject = req.body.shsubject3;
      subject3.email = user.email;
      subject3.firstName = user.profile.firstName;
      subject3.middleName = user.profile.middleName;
      subject3.lastName = user.profile.lastName;
      subject3.section = req.body.section;
      subject3.yrLvl = req.body.yrLvl;
      subject3.faculty = req.body.shfaculty3;
      curriculum.subjects.push(subject3);
      subject3.save();
      // Handle.findOne({
      //   faculty: req.body.faculty3, 
      //   subject: req.body.subject3, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject4 = new Subject();
      subject4.subject = req.body.shsubject4;
      subject4.email = user.email;
      subject4.firstName = user.profile.firstName;
      subject4.middleName = user.profile.middleName;
      subject4.lastName = user.profile.lastName;
      subject4.section = req.body.section;
      subject4.yrLvl = req.body.yrLvl;
      subject4.faculty = req.body.shfaculty4;
      curriculum.subjects.push(subject4);
      subject4.save();
      // Handle.findOne({
      //   faculty: req.body.faculty4, 
      //   subject: req.body.subject4, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject5 = new Subject();
      subject5.subject = req.body.shsubject5;
      subject5.email = user.email;
      subject5.firstName = user.profile.firstName;
      subject5.middleName = user.profile.middleName;
      subject5.lastName = user.profile.lastName;
      subject5.section = req.body.section;
      subject5.yrLvl = req.body.yrLvl;
      subject5.faculty = req.body.shfaculty5;
      curriculum.subjects.push(subject5);
      subject5.save();
      // Handle.findOne({
      //   faculty: req.body.faculty5, 
      //   subject: req.body.subject5, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject6 = new Subject();
      subject6.subject = req.body.shsubject6;
      subject6.email = user.email;
      subject6.firstName = user.profile.firstName;
      subject6.middleName = user.profile.middleName;
      subject6.lastName = user.profile.lastName;
      subject6.section = req.body.section;
      subject6.yrLvl = req.body.yrLvl;
      subject6.faculty = req.body.shfaculty6;
      curriculum.subjects.push(subject6);
      subject6.save();
      // Handle.findOne({
      //   faculty: req.body.faculty6, 
      //   subject: req.body.subject6, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject7 = new Subject();
      subject7.subject = req.body.shsubject7;
      subject7.email = user.email;
      subject7.firstName = user.profile.firstName;
      subject7.middleName = user.profile.middleName;
      subject7.lastName = user.profile.lastName;
      subject7.section = req.body.section;
      subject7.yrLvl = req.body.yrLvl;
      subject7.faculty = req.body.shfaculty7;
      curriculum.subjects.push(subject7);
      subject7.save();
      // Handle.findOne({
      //   faculty: req.body.faculty7, 
      //   subject: req.body.subject7, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject8 = new Subject();
      subject8.subject = req.body.shsubject8;
      subject8.email = user.email;
      subject8.firstName = user.profile.firstName;
      subject8.middleName = user.profile.middleName;
      subject8.lastName = user.profile.lastName;
      subject8.section = req.body.section;
      subject8.yrLvl = req.body.yrLvl;
      subject8.faculty = req.body.shfaculty8;
      curriculum.subjects.push(subject8);
      subject8.save();
      // Handle.findOne({
      //   faculty: req.body.faculty8, 
      //   subject: req.body.subject8, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject9 = new Subject();
      subject9.subject = req.body.shsubject9;
      subject9.email = user.email;
      subject9.firstName = user.profile.firstName;
      subject9.middleName = user.profile.middleName;
      subject9.lastName = user.profile.lastName;
      subject9.section = req.body.section;
      subject9.yrLvl = req.body.yrLvl;
      subject9.faculty = req.body.shfaculty9;
      subject9.save();
      // Handle.findOne({
      //   faculty: req.body.faculty10, 
      //   subject: req.body.subject10, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      curriculum.subjects.push(subject9);
      user.save(function (err, user) {
        if (err) return next(err);
        console.log(user);
      });
      curriculum.save(function (err, curr) {
        if (err) return next(err);
        console.log(curr);
      });
      console.log('Success');
    } else if (req.body.yrLvl === "grade12" && req.body.section === "Accountancy") {
      var subject1 = new Subject();
      subject1.subject = req.body.shsubject1;
      subject1.email = user.email;
      subject1.firstName = user.profile.firstName;
      subject1.middleName = user.profile.middleName;
      subject1.lastName = user.profile.lastName;
      subject1.section = req.body.section;
      subject1.yrLvl = req.body.yrLvl;
      subject1.faculty = req.body.shfaculty1;
      curriculum.subjects.push(subject1);
      // Handle.findOne({
      //   faculty: req.body.faculty1, 
      //   subject: req.body.subject1, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      subject1.save();
      var subject2 = new Subject();
      subject2.subject = req.body.shsubject2;
      subject2.email = user.email;
      subject2.firstName = user.profile.firstName;
      subject2.middleName = user.profile.middleName;
      subject2.lastName = user.profile.lastName;
      subject2.section = req.body.section;
      subject2.yrLvl = req.body.yrLvl;
      subject2.faculty = req.body.shfaculty2;
      curriculum.subjects.push(subject2);
      subject2.save();
      // Handle.findOne({
      //   faculty: req.body.faculty2, 
      //   subject: req.body.subject2, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject3 = new Subject();
      subject3.subject = req.body.shsubject3;
      subject3.email = user.email;
      subject3.firstName = user.profile.firstName;
      subject3.middleName = user.profile.middleName;
      subject3.lastName = user.profile.lastName;
      subject3.section = req.body.section;
      subject3.yrLvl = req.body.yrLvl;
      subject3.faculty = req.body.shfaculty3;
      curriculum.subjects.push(subject3);
      subject3.save();
      // Handle.findOne({
      //   faculty: req.body.faculty3, 
      //   subject: req.body.subject3, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject4 = new Subject();
      subject4.subject = req.body.shsubject4;
      subject4.email = user.email;
      subject4.firstName = user.profile.firstName;
      subject4.middleName = user.profile.middleName;
      subject4.lastName = user.profile.lastName;
      subject4.section = req.body.section;
      subject4.yrLvl = req.body.yrLvl;
      subject4.faculty = req.body.shfaculty4;
      curriculum.subjects.push(subject4);
      subject4.save();
      // Handle.findOne({
      //   faculty: req.body.faculty4, 
      //   subject: req.body.subject4, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject5 = new Subject();
      subject5.subject = req.body.shsubject5;
      subject5.email = user.email;
      subject5.firstName = user.profile.firstName;
      subject5.middleName = user.profile.middleName;
      subject5.lastName = user.profile.lastName;
      subject5.section = req.body.section;
      subject5.yrLvl = req.body.yrLvl;
      subject5.faculty = req.body.shfaculty5;
      curriculum.subjects.push(subject5);
      subject5.save();
      // Handle.findOne({
      //   faculty: req.body.faculty5, 
      //   subject: req.body.subject5, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject6 = new Subject();
      subject6.subject = req.body.shsubject6;
      subject6.email = user.email;
      subject6.firstName = user.profile.firstName;
      subject6.middleName = user.profile.middleName;
      subject6.lastName = user.profile.lastName;
      subject6.section = req.body.section;
      subject6.yrLvl = req.body.yrLvl;
      subject6.faculty = req.body.shfaculty6;
      curriculum.subjects.push(subject6);
      subject6.save();
      // Handle.findOne({
      //   faculty: req.body.faculty6, 
      //   subject: req.body.subject6, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject7 = new Subject();
      subject7.subject = req.body.shsubject7;
      subject7.email = user.email;
      subject7.firstName = user.profile.firstName;
      subject7.middleName = user.profile.middleName;
      subject7.lastName = user.profile.lastName;
      subject7.section = req.body.section;
      subject7.yrLvl = req.body.yrLvl;
      subject7.faculty = req.body.shfaculty7;
      curriculum.subjects.push(subject7);
      subject7.save();
      // Handle.findOne({
      //   faculty: req.body.faculty7, 
      //   subject: req.body.subject7, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject8 = new Subject();
      subject8.subject = req.body.shsubject8;
      subject8.email = user.email;
      subject8.firstName = user.profile.firstName;
      subject8.middleName = user.profile.middleName;
      subject8.lastName = user.profile.lastName;
      subject8.section = req.body.section;
      subject8.yrLvl = req.body.yrLvl;
      subject8.faculty = req.body.shfaculty8;
      curriculum.subjects.push(subject8);
      subject8.save();
      // Handle.findOne({
      //   faculty: req.body.faculty8, 
      //   subject: req.body.subject8, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      // Handle.findOne({
      //   faculty: req.body.faculty10, 
      //   subject: req.body.subject10, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      user.save(function (err, user) {
        if (err) return next(err);
        console.log(user);
      });
      curriculum.save(function (err, curr) {
        if (err) return next(err);
        console.log(curr);
      });
      console.log('Success');
    } else if (req.body.yrLvl === "grade12" && req.body.section === "Business Management") {
      var subject1 = new Subject();
      subject1.subject = req.body.shsubject1;
      subject1.email = user.email;
      subject1.firstName = user.profile.firstName;
      subject1.middleName = user.profile.middleName;
      subject1.lastName = user.profile.lastName;
      subject1.section = req.body.section;
      subject1.yrLvl = req.body.yrLvl;
      subject1.faculty = req.body.shfaculty1;
      curriculum.subjects.push(subject1);
      // Handle.findOne({
      //   faculty: req.body.faculty1, 
      //   subject: req.body.subject1, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      subject1.save();
      var subject2 = new Subject();
      subject2.subject = req.body.shsubject2;
      subject2.email = user.email;
      subject2.firstName = user.profile.firstName;
      subject2.middleName = user.profile.middleName;
      subject2.lastName = user.profile.lastName;
      subject2.section = req.body.section;
      subject2.yrLvl = req.body.yrLvl;
      subject2.faculty = req.body.shfaculty2;
      curriculum.subjects.push(subject2);
      subject2.save();
      // Handle.findOne({
      //   faculty: req.body.faculty2, 
      //   subject: req.body.subject2, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject3 = new Subject();
      subject3.subject = req.body.shsubject3;
      subject3.email = user.email;
      subject3.firstName = user.profile.firstName;
      subject3.middleName = user.profile.middleName;
      subject3.lastName = user.profile.lastName;
      subject3.section = req.body.section;
      subject3.yrLvl = req.body.yrLvl;
      subject3.faculty = req.body.shfaculty3;
      curriculum.subjects.push(subject3);
      subject3.save();
      // Handle.findOne({
      //   faculty: req.body.faculty3, 
      //   subject: req.body.subject3, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject4 = new Subject();
      subject4.subject = req.body.shsubject4;
      subject4.email = user.email;
      subject4.firstName = user.profile.firstName;
      subject4.middleName = user.profile.middleName;
      subject4.lastName = user.profile.lastName;
      subject4.section = req.body.section;
      subject4.yrLvl = req.body.yrLvl;
      subject4.faculty = req.body.shfaculty4;
      curriculum.subjects.push(subject4);
      subject4.save();
      // Handle.findOne({
      //   faculty: req.body.faculty4, 
      //   subject: req.body.subject4, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject5 = new Subject();
      subject5.subject = req.body.shsubject5;
      subject5.email = user.email;
      subject5.firstName = user.profile.firstName;
      subject5.middleName = user.profile.middleName;
      subject5.lastName = user.profile.lastName;
      subject5.section = req.body.section;
      subject5.yrLvl = req.body.yrLvl;
      subject5.faculty = req.body.shfaculty5;
      curriculum.subjects.push(subject5);
      subject5.save();
      // Handle.findOne({
      //   faculty: req.body.faculty5, 
      //   subject: req.body.subject5, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject6 = new Subject();
      subject6.subject = req.body.shsubject6;
      subject6.email = user.email;
      subject6.firstName = user.profile.firstName;
      subject6.middleName = user.profile.middleName;
      subject6.lastName = user.profile.lastName;
      subject6.section = req.body.section;
      subject6.yrLvl = req.body.yrLvl;
      subject6.faculty = req.body.shfaculty6;
      curriculum.subjects.push(subject6);
      subject6.save();
      // Handle.findOne({
      //   faculty: req.body.faculty6, 
      //   subject: req.body.subject6, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject7 = new Subject();
      subject7.subject = req.body.shsubject7;
      subject7.email = user.email;
      subject7.firstName = user.profile.firstName;
      subject7.middleName = user.profile.middleName;
      subject7.lastName = user.profile.lastName;
      subject7.section = req.body.section;
      subject7.yrLvl = req.body.yrLvl;
      subject7.faculty = req.body.shfaculty7;
      curriculum.subjects.push(subject7);
      subject7.save();
      // Handle.findOne({
      //   faculty: req.body.faculty7, 
      //   subject: req.body.subject7, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject8 = new Subject();
      subject8.subject = req.body.shsubject8;
      subject8.email = user.email;
      subject8.firstName = user.profile.firstName;
      subject8.middleName = user.profile.middleName;
      subject8.lastName = user.profile.lastName;
      subject8.section = req.body.section;
      subject8.yrLvl = req.body.yrLvl;
      subject8.faculty = req.body.shfaculty8;
      curriculum.subjects.push(subject8);
      subject8.save();
      // Handle.findOne({
      //   faculty: req.body.faculty8, 
      //   subject: req.body.subject8, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      // Handle.findOne({
      //   faculty: req.body.faculty10, 
      //   subject: req.body.subject10, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      user.save(function (err, user) {
        if (err) return next(err);
        console.log(user);
      });
      curriculum.save(function (err, curr) {
        if (err) return next(err);
        console.log(curr);
      });
      console.log('Success');
    } else if (req.body.yrLvl === "grade12" && req.body.section === "Humanities and Social Sciences") {
      var subject1 = new Subject();
      subject1.subject = req.body.shsubject1;
      subject1.email = user.email;
      subject1.firstName = user.profile.firstName;
      subject1.middleName = user.profile.middleName;
      subject1.lastName = user.profile.lastName;
      subject1.section = req.body.section;
      subject1.yrLvl = req.body.yrLvl;
      subject1.faculty = req.body.shfaculty1;
      curriculum.subjects.push(subject1);
      // Handle.findOne({
      //   faculty: req.body.faculty1, 
      //   subject: req.body.subject1, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      subject1.save();
      var subject2 = new Subject();
      subject2.subject = req.body.shsubject2;
      subject2.email = user.email;
      subject2.firstName = user.profile.firstName;
      subject2.middleName = user.profile.middleName;
      subject2.lastName = user.profile.lastName;
      subject2.section = req.body.section;
      subject2.yrLvl = req.body.yrLvl;
      subject2.faculty = req.body.shfaculty2;
      curriculum.subjects.push(subject2);
      subject2.save();
      // Handle.findOne({
      //   faculty: req.body.faculty2, 
      //   subject: req.body.subject2, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject3 = new Subject();
      subject3.subject = req.body.shsubject3;
      subject3.email = user.email;
      subject3.firstName = user.profile.firstName;
      subject3.middleName = user.profile.middleName;
      subject3.lastName = user.profile.lastName;
      subject3.section = req.body.section;
      subject3.yrLvl = req.body.yrLvl;
      subject3.faculty = req.body.shfaculty3;
      curriculum.subjects.push(subject3);
      subject3.save();
      // Handle.findOne({
      //   faculty: req.body.faculty3, 
      //   subject: req.body.subject3, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject4 = new Subject();
      subject4.subject = req.body.shsubject4;
      subject4.email = user.email;
      subject4.firstName = user.profile.firstName;
      subject4.middleName = user.profile.middleName;
      subject4.lastName = user.profile.lastName;
      subject4.section = req.body.section;
      subject4.yrLvl = req.body.yrLvl;
      subject4.faculty = req.body.shfaculty4;
      curriculum.subjects.push(subject4);
      subject4.save();
      // Handle.findOne({
      //   faculty: req.body.faculty4, 
      //   subject: req.body.subject4, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject5 = new Subject();
      subject5.subject = req.body.shsubject5;
      subject5.email = user.email;
      subject5.firstName = user.profile.firstName;
      subject5.middleName = user.profile.middleName;
      subject5.lastName = user.profile.lastName;
      subject5.section = req.body.section;
      subject5.yrLvl = req.body.yrLvl;
      subject5.faculty = req.body.shfaculty5;
      curriculum.subjects.push(subject5);
      subject5.save();
      // Handle.findOne({
      //   faculty: req.body.faculty5, 
      //   subject: req.body.subject5, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject6 = new Subject();
      subject6.subject = req.body.shsubject6;
      subject6.email = user.email;
      subject6.firstName = user.profile.firstName;
      subject6.middleName = user.profile.middleName;
      subject6.lastName = user.profile.lastName;
      subject6.section = req.body.section;
      subject6.yrLvl = req.body.yrLvl;
      subject6.faculty = req.body.shfaculty6;
      curriculum.subjects.push(subject6);
      subject6.save();
      // Handle.findOne({
      //   faculty: req.body.faculty6, 
      //   subject: req.body.subject6, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject7 = new Subject();
      subject7.subject = req.body.shsubject7;
      subject7.email = user.email;
      subject7.firstName = user.profile.firstName;
      subject7.middleName = user.profile.middleName;
      subject7.lastName = user.profile.lastName;
      subject7.section = req.body.section;
      subject7.yrLvl = req.body.yrLvl;
      subject7.faculty = req.body.shfaculty7;
      curriculum.subjects.push(subject7);
      subject7.save();
      // Handle.findOne({
      //   faculty: req.body.faculty7, 
      //   subject: req.body.subject7, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject8 = new Subject();
      subject8.subject = req.body.shsubject8;
      subject8.email = user.email;
      subject8.firstName = user.profile.firstName;
      subject8.middleName = user.profile.middleName;
      subject8.lastName = user.profile.lastName;
      subject8.section = req.body.section;
      subject8.yrLvl = req.body.yrLvl;
      subject8.faculty = req.body.shfaculty8;
      curriculum.subjects.push(subject8);
      subject8.save();
      // Handle.findOne({
      //   faculty: req.body.faculty8, 
      //   subject: req.body.subject8, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      // Handle.findOne({
      //   faculty: req.body.faculty10, 
      //   subject: req.body.subject10, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      user.save(function (err, user) {
        if (err) return next(err);
        console.log(user);
      });
      curriculum.save(function (err, curr) {
        if (err) return next(err);
        console.log(curr);
      });
      console.log('Success');
    } else if (req.body.yrLvl === "grade12" && req.body.section === "Information and Communication Technology") {
      var subject1 = new Subject();
      subject1.subject = req.body.shsubject1;
      subject1.email = user.email;
      subject1.firstName = user.profile.firstName;
      subject1.middleName = user.profile.middleName;
      subject1.lastName = user.profile.lastName;
      subject1.section = req.body.section;
      subject1.yrLvl = req.body.yrLvl;
      subject1.faculty = req.body.shfaculty1;
      curriculum.subjects.push(subject1);
      // Handle.findOne({
      //   faculty: req.body.faculty1, 
      //   subject: req.body.subject1, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      subject1.save();
      var subject2 = new Subject();
      subject2.subject = req.body.shsubject2;
      subject2.email = user.email;
      subject2.firstName = user.profile.firstName;
      subject2.middleName = user.profile.middleName;
      subject2.lastName = user.profile.lastName;
      subject2.section = req.body.section;
      subject2.yrLvl = req.body.yrLvl;
      subject2.faculty = req.body.shfaculty2;
      curriculum.subjects.push(subject2);
      subject2.save();
      // Handle.findOne({
      //   faculty: req.body.faculty2, 
      //   subject: req.body.subject2, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject3 = new Subject();
      subject3.subject = req.body.shsubject3;
      subject3.email = user.email;
      subject3.firstName = user.profile.firstName;
      subject3.middleName = user.profile.middleName;
      subject3.lastName = user.profile.lastName;
      subject3.section = req.body.section;
      subject3.yrLvl = req.body.yrLvl;
      subject3.faculty = req.body.shfaculty3;
      curriculum.subjects.push(subject3);
      subject3.save();
      // Handle.findOne({
      //   faculty: req.body.faculty3, 
      //   subject: req.body.subject3, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject4 = new Subject();
      subject4.subject = req.body.shsubject4;
      subject4.email = user.email;
      subject4.firstName = user.profile.firstName;
      subject4.middleName = user.profile.middleName;
      subject4.lastName = user.profile.lastName;
      subject4.section = req.body.section;
      subject4.yrLvl = req.body.yrLvl;
      subject4.faculty = req.body.shfaculty4;
      curriculum.subjects.push(subject4);
      subject4.save();
      // Handle.findOne({
      //   faculty: req.body.faculty4, 
      //   subject: req.body.subject4, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject5 = new Subject();
      subject5.subject = req.body.shsubject5;
      subject5.email = user.email;
      subject5.firstName = user.profile.firstName;
      subject5.middleName = user.profile.middleName;
      subject5.lastName = user.profile.lastName;
      subject5.section = req.body.section;
      subject5.yrLvl = req.body.yrLvl;
      subject5.faculty = req.body.shfaculty5;
      curriculum.subjects.push(subject5);
      subject5.save();
      // Handle.findOne({
      //   faculty: req.body.faculty5, 
      //   subject: req.body.subject5, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject6 = new Subject();
      subject6.subject = req.body.shsubject6;
      subject6.email = user.email;
      subject6.firstName = user.profile.firstName;
      subject6.middleName = user.profile.middleName;
      subject6.lastName = user.profile.lastName;
      subject6.section = req.body.section;
      subject6.yrLvl = req.body.yrLvl;
      subject6.faculty = req.body.shfaculty6;
      curriculum.subjects.push(subject6);
      subject6.save();
      // Handle.findOne({
      //   faculty: req.body.faculty6, 
      //   subject: req.body.subject6, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject7 = new Subject();
      subject7.subject = req.body.shsubject7;
      subject7.email = user.email;
      subject7.firstName = user.profile.firstName;
      subject7.middleName = user.profile.middleName;
      subject7.lastName = user.profile.lastName;
      subject7.section = req.body.section;
      subject7.yrLvl = req.body.yrLvl;
      subject7.faculty = req.body.shfaculty7;
      curriculum.subjects.push(subject7);
      subject7.save();
      // Handle.findOne({
      //   faculty: req.body.faculty7, 
      //   subject: req.body.subject7, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject8 = new Subject();
      subject8.subject = req.body.shsubject8;
      subject8.email = user.email;
      subject8.firstName = user.profile.firstName;
      subject8.middleName = user.profile.middleName;
      subject8.lastName = user.profile.lastName;
      subject8.section = req.body.section;
      subject8.yrLvl = req.body.yrLvl;
      subject8.faculty = req.body.shfaculty8;
      curriculum.subjects.push(subject8);
      subject8.save();
      // Handle.findOne({
      //   faculty: req.body.faculty8, 
      //   subject: req.body.subject8, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      // Handle.findOne({
      //   faculty: req.body.faculty10, 
      //   subject: req.body.subject10, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      user.save(function (err, user) {
        if (err) return next(err);
        console.log(user);
      });
      curriculum.save(function (err, curr) {
        if (err) return next(err);
        console.log(curr);
      });
      console.log('Success');
    } else if (req.body.yrLvl === "grade12" && req.body.section === "Home Economics") {
      var subject1 = new Subject();
      subject1.subject = req.body.shsubject1;
      subject1.email = user.email;
      subject1.firstName = user.profile.firstName;
      subject1.middleName = user.profile.middleName;
      subject1.lastName = user.profile.lastName;
      subject1.section = req.body.section;
      subject1.yrLvl = req.body.yrLvl;
      subject1.faculty = req.body.shfaculty1;
      curriculum.subjects.push(subject1);
      // Handle.findOne({
      //   faculty: req.body.faculty1, 
      //   subject: req.body.subject1, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      subject1.save();
      var subject2 = new Subject();
      subject2.subject = req.body.shsubject2;
      subject2.email = user.email;
      subject2.firstName = user.profile.firstName;
      subject2.middleName = user.profile.middleName;
      subject2.lastName = user.profile.lastName;
      subject2.section = req.body.section;
      subject2.yrLvl = req.body.yrLvl;
      subject2.faculty = req.body.shfaculty2;
      curriculum.subjects.push(subject2);
      subject2.save();
      // Handle.findOne({
      //   faculty: req.body.faculty2, 
      //   subject: req.body.subject2, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject3 = new Subject();
      subject3.subject = req.body.shsubject3;
      subject3.email = user.email;
      subject3.firstName = user.profile.firstName;
      subject3.middleName = user.profile.middleName;
      subject3.lastName = user.profile.lastName;
      subject3.section = req.body.section;
      subject3.yrLvl = req.body.yrLvl;
      subject3.faculty = req.body.shfaculty3;
      curriculum.subjects.push(subject3);
      subject3.save();
      // Handle.findOne({
      //   faculty: req.body.faculty3, 
      //   subject: req.body.subject3, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject4 = new Subject();
      subject4.subject = req.body.shsubject4;
      subject4.email = user.email;
      subject4.firstName = user.profile.firstName;
      subject4.middleName = user.profile.middleName;
      subject4.lastName = user.profile.lastName;
      subject4.section = req.body.section;
      subject4.yrLvl = req.body.yrLvl;
      subject4.faculty = req.body.shfaculty4;
      curriculum.subjects.push(subject4);
      subject4.save();
      // Handle.findOne({
      //   faculty: req.body.faculty4, 
      //   subject: req.body.subject4, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject5 = new Subject();
      subject5.subject = req.body.shsubject5;
      subject5.email = user.email;
      subject5.firstName = user.profile.firstName;
      subject5.middleName = user.profile.middleName;
      subject5.lastName = user.profile.lastName;
      subject5.section = req.body.section;
      subject5.yrLvl = req.body.yrLvl;
      subject5.faculty = req.body.shfaculty5;
      curriculum.subjects.push(subject5);
      subject5.save();
      // Handle.findOne({
      //   faculty: req.body.faculty5, 
      //   subject: req.body.subject5, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject6 = new Subject();
      subject6.subject = req.body.shsubject6;
      subject6.email = user.email;
      subject6.firstName = user.profile.firstName;
      subject6.middleName = user.profile.middleName;
      subject6.lastName = user.profile.lastName;
      subject6.section = req.body.section;
      subject6.yrLvl = req.body.yrLvl;
      subject6.faculty = req.body.shfaculty6;
      curriculum.subjects.push(subject6);
      subject6.save();
      // Handle.findOne({
      //   faculty: req.body.faculty6, 
      //   subject: req.body.subject6, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject7 = new Subject();
      subject7.subject = req.body.shsubject7;
      subject7.email = user.email;
      subject7.firstName = user.profile.firstName;
      subject7.middleName = user.profile.middleName;
      subject7.lastName = user.profile.lastName;
      subject7.section = req.body.section;
      subject7.yrLvl = req.body.yrLvl;
      subject7.faculty = req.body.shfaculty7;
      curriculum.subjects.push(subject7);
      subject7.save();
      // Handle.findOne({
      //   faculty: req.body.faculty7, 
      //   subject: req.body.subject7, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      var subject8 = new Subject();
      subject8.subject = req.body.shsubject8;
      subject8.email = user.email;
      subject8.firstName = user.profile.firstName;
      subject8.middleName = user.profile.middleName;
      subject8.lastName = user.profile.lastName;
      subject8.section = req.body.section;
      subject8.yrLvl = req.body.yrLvl;
      subject8.faculty = req.body.shfaculty8;
      curriculum.subjects.push(subject8);
      subject8.save();
      // Handle.findOne({
      //   faculty: req.body.faculty8, 
      //   subject: req.body.subject8, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      // Handle.findOne({
      //   faculty: req.body.faculty10, 
      //   subject: req.body.subject10, 
      //   section: req.body.section, 
      //   yrLvl: req.body.yrLvl}, 
      //   function(err, handle){
      //     handle.handles.push(subject1);
      //     handle.save();
      // });
      user.save(function (err, user) {
        if (err) return next(err);
        console.log(user);
      });
      curriculum.save(function (err, curr) {
        if (err) return next(err);
        console.log(curr);
      });
      console.log('Success');
    }

    console.log(user + ' and ' + curriculum);
    req.flash("message", "You successfully enrolled a new student");
    return res.redirect('/enrollment');
  });
});

router.get('/studentlist', adminAuthentication, function (req, res, next) {
  Subject.findOne({
    yrLvl: 'grade1'
  }, function (err, subject) {
    if (err) return next(err);
    if (req.query.sort) {
      User.find({
        user: 'student'
      }).sort({
        idNumber: 1
      }).exec(function (err, users) {
        if (err) return next(err);
        res.render('admin/studentlist', {
          users: users,
          subject: subject,
        });
      });

    } else if (req.query.lastName) {
      User.find({
        user: 'student'
      }).sort({
        "profile.lastName": 1,
        "profile.firstName": 1
      }).exec(function (err, users) {
        if (err) return next(err);
        res.render('admin/studentlist', {
          users: users,
          subject: subject,
        });
      });

    } else if (req.query.yrLvl) {
      User.find({
        user: 'student'
      }).sort({
        yrLvl: 1,
        section: 1
      }).exec(function (err, users) {
        if (err) return next(err);
        res.render('admin/studentlist', {
          users: users,
          subject: subject,
        });
      });
    } else if (req.query.section && req.query.yrLvl1) {
      const regex = new RegExp(escapeRegex(req.query.section), "gi");
      const regex1 = new RegExp(escapeRegex(req.query.yrLvl1), "gi");
      User.find({
        user: 'student',
        section: regex,
        yrLvl: regex1
      }).sort({
        yrLvl: 1,
        section: 1
      }).exec(function (err, users) {
        if (err) return next(err);
        res.render('admin/studentlist', {
          users: users,
          subject: subject,
        });
      });
    } else {
      User.find({
        user: 'student'
      }, function (err, users) {
        if (err) return next(err);
        res.render('admin/studentlist', {
          users: users,
          subject: subject,
        });
      });
    }
  });
});

router.post("/studentlist", adminAuthentication, function (req, res, next) {
  console.log(req.body.grading)
  Subject
    .count({
      academicYear: (new Date()).getFullYear() + "-" + ((new Date()).getFullYear() + 1)
    })
    .exec(function (err, counter) {
      console.log(counter);
      if (counter >= 0) {
        console.log("lol")
        if (req.body.grading === "firstGrading") {
          // for(var i = 0; i < counter; i++){
          Subject.updateMany({
            academicYear: (new Date()).getFullYear() + "-" + ((new Date()).getFullYear() + 1)
          }, {
            first: true
          }).exec(function (err, subjects) {
            if (err) return next(err);
            console.log("subjects exec: " + subjects);
          });
          Subject.find({
            academicYear: (new Date()).getFullYear() + "-" + ((new Date()).getFullYear() + 1)
          }, function (err, subjects) {
            if (err) return next(err);
            console.log(subjects);
            if (!subjects) {
              Subject.updateMany({
                academicYear: ((new Date()).getFullYear() - 1) + "-" + (new Date()).getFullYear()
              }, {
                first: true
              })
              Subject.find({}, function (err, secondSubjects) {
                if (err) return next(err);
                console.log(secondSubjects);
              });
            }
          });
          // }
        } else if (req.body.grading === "secondGrading") {
          // for(var i = 0; i < counter; i++){
          Subject.updateMany({
            academicYear: (new Date()).getFullYear() + "-" + ((new Date()).getFullYear() + 1)
          }, {
            second: true
          }).exec();
          Subject.find({
            academicYear: (new Date()).getFullYear() + "-" + ((new Date()).getFullYear() + 1)
          }, function (err, subjects) {
            if (err) return next(err);
            console.log(subjects);
            if (!subjects) {
              Subject.updateMany({
                academicYear: ((new Date()).getFullYear() - 1) + "-" + (new Date()).getFullYear()
              }, {
                second: true
              })
              Subject.find({}, function (err, secondSubjects) {
                if (err) return next(err);
                console.log(secondSubjects);
              });
            }
          });
          // }
        } else if (req.body.grading === "thirdGrading") {
          // for(var i = 0; i < counter; i++){
          Subject.updateMany({
            academicYear: (new Date()).getFullYear() + "-" + ((new Date()).getFullYear() + 1)
          }, {
            third: true
          }).exec();
          Subject.find({
            academicYear: (new Date()).getFullYear() + "-" + ((new Date()).getFullYear() + 1)
          }, function (err, subjects) {
            if (err) return next(err);
            console.log(subjects);
            if (!subjects) {
              Subject.updateMany({
                academicYear: ((new Date()).getFullYear() - 1) + "-" + (new Date()).getFullYear()
              }, {
                third: true
              }).exec();
              Subject.find({}, function (err, secondSubjects) {
                if (err) return next(err);
                console.log(secondSubjects);
              });
            }
          });
          // }
        } else if (req.body.grading === "fourthGrading") {
          for (var i = 0; i < counter; i++) {
            Subject.updateMany({
              academicYear: (new Date()).getFullYear() + "-" + ((new Date()).getFullYear() + 1)
            }, {
              fourth: true
            }).exec()
            Subject.find({
              academicYear: (new Date()).getFullYear() + "-" + ((new Date()).getFullYear() + 1)
            }, function (err, subjects) {
              if (err) return next(err);
              console.log(subjects);
              if (!subjects) {
                Subject.updateMany({
                  academicYear: ((new Date()).getFullYear() - 1) + "-" + (new Date()).getFullYear()
                }, {
                  fourth: true
                }).exec()
                Subject.find({}, function (err, secondSubjects) {
                  if (err) return next(err);
                  console.log(secondSubjects);
                });
              }
            });
          }
        } else if (req.body.grading === "firstSem") {
          for (var i = 0; i < counter; i++) {
            Subject.updateMany({
              academicYear: (new Date()).getFullYear() + "-" + ((new Date()).getFullYear() + 1)
            }, {
              firstSemester: true
            }).exec()
            Subject.find({
              academicYear: (new Date()).getFullYear() + "-" + ((new Date()).getFullYear() + 1)
            }, function (err, subjects) {
              if (err) return next(err);
              console.log(subjects);
              if (!subjects) {
                Subject.updateMany({
                  academicYear: ((new Date()).getFullYear() - 1) + "-" + (new Date()).getFullYear()
                }, {
                  firstSemester: true
                }).exec()
                Subject.find({}, function (err, secondSubjects) {
                  if (err) return next(err);
                  console.log(secondSubjects);
                });
              }
            });
          }
        } else if (req.body.grading === "secondSem") {
          for (var i = 0; i < counter; i++) {
            Subject.updateMany({
              academicYear: (new Date()).getFullYear() + "-" + ((new Date()).getFullYear() + 1)
            }, {
              secondSemester: true
            }).exec()
            Subject.find({
              academicYear: (new Date()).getFullYear() + "-" + ((new Date()).getFullYear() + 1)
            }, function (err, subjects) {
              if (err) return next(err);
              console.log(subjects);
              if (!subjects) {
                Subject.updateMany({
                  academicYear: ((new Date()).getFullYear() - 1) + "-" + (new Date()).getFullYear()
                }, {
                  secondSemester: true
                }).exec()
                Subject.find({}, function (err, secondSubjects) {
                  if (err) return next(err);
                  console.log(secondSubjects);
                });
              }
            });
          }
        }
      } else if (counter == 0) {
        if (req.body.grading === "firstGrading") {
          Subject
            .updateMany({
              academicYear: ((new Date()).getFullYear() - 1) + "-" + (new Date()).getFullYear()
            }, {
              first: true
            }).exec();
          Subject.find({}, function (err, secondSubjects) {
            if (err) return next(err);
            console.log(secondSubjects);
          });
        }
      } else if (req.body.grading === "secondGrading") {
        Subject
          .updateMany({
            academicYear: ((new Date()).getFullYear() - 1) + "-" + (new Date()).getFullYear()
          }, {
            second: true
          }).exec();
        Subject.find({}, function (err, secondSubjects) {
          if (err) return next(err);
          console.log(secondSubjects);
        });
      } else if (req.body.grading === "thirdGrading") {
        Subject.updateMany({
          academicYear: ((new Date()).getFullYear() - 1) + "-" + (new Date()).getFullYear()
        }, {
          third: true
        }).exec();
        Subject.find({}, function (err, secondSubjects) {
          if (err) return next(err);
          console.log(secondSubjects);
        });
      } else if (req.body.grading === "fourthGrading") {
        Subject.updateMany({
          academicYear: ((new Date()).getFullYear() - 1) + "-" + (new Date()).getFullYear()
        }, {
          fourth: true
        }).exec();
        Subject.find({}, function (err, secondSubjects) {
          if (err) return next(err);
          console.log(secondSubjects);
        });
      } else if (req.body.grading === "firstSem") {
        Subject.updateMany({
          academicYear: ((new Date()).getFullYear() - 1) + "-" + (new Date()).getFullYear()
        }, {
          firstSemester: true
        }).exec();
        Subject.find({}, function (err, secondSubjects) {
          if (err) return next(err);
          console.log(secondSubjects);
        });
      } else if (req.body.grading === "secondSem") {
        Subject.updateMany({
          academicYear: ((new Date()).getFullYear() - 1) + "-" + (new Date()).getFullYear()
        }, {
          secondSemester: true
        }).exec();
        Subject.find({}, function (err, secondSubjects) {
          if (err) return next(err);
          console.log(secondSubjects);
        });
      }
      if (req.body.grading === "firstGrading") {
        req.flash("message", "You enable encoding of grades for First Grading.");
        return res.redirect("/studentlist");
      } else if (req.body.grading === "secondGrading") {
        req.flash("message", "You enable encoding of grades for Second Grading.");
        return res.redirect("/studentlist");
      } else if (req.body.grading === "thirdGrading") {
        req.flash("message", "You enable encoding of grades for Third Grading.");
        return res.redirect("/studentlist");
      } else if (req.body.grading === "fourthGrading") {
        req.flash("message", "You enable encoding of grades for Fourth Grading.");
        return res.redirect("/studentlist");
      } else if (req.body.grading === "firstSem") {
        req.flash("message", "You enable encoding of grades for First Semester.");
        return res.redirect("/studentlist");
      } else if (req.body.grading === "secondSem") {
        req.flash("message", "You enable encoding of grades for Second Semester.");
        return res.redirect("/studentlist");
      }
    });

});

router.put("/studentlist", adminAuthentication, function (req, res, next) {
  Subject
    .count({
      academicYear: (new Date()).getFullYear() + "-" + ((new Date()).getFullYear() + 1)
    })
    .exec(function (err, counter) {
      console.log(counter);
      if (counter > 0) {
        Subject.updateMany({
          academicYear: (new Date()).getFullYear() + "-" + ((new Date()).getFullYear() + 1)
        }, {
          first: false,
          second: false,
          third: false,
          fourth: false,
          firstSemester: false,
          secondSemester: false
        }).exec(function (err, subjects) {
          if (err) return next(err);
          console.log(subjects);
        });
      } else if (counter == 0) {
        Subject.updateMany({
          academicYear: ((new Date()).getFullYear() - 1) + "-" + ((new Date()).getFullYear())
        }, {
          first: false,
          second: false,
          third: false,
          fourth: false,
          firstSemester: false,
          secondSemester: false
        }).exec(function (err, subjects) {
          if (err) return next(err);
          console.log(subjects);
        });
      }
      req.flash("message", "You successfully disabled the encoding of grades.");
      return res.redirect("/studentlist");
    });

});

router.get('/studentlist/:id', adminAuthentication, function (req, res, next) {
  if (req.query.academicYear) {
    Curriculum.find({
      studentId: req.params.id
    }, function (err, curriculums) {
      Curriculum.findOne({
          studentId: req.params.id,
          academicYear: req.query.academicYear
        })
        .populate('subjects')
        .exec(function (err, curriculum) {
          console.log(curriculum);
          if (curriculum) {
            User.findById(req.params.id, function (err, user) {
              return res.render('admin/viewgrade', {
                curriculums: curriculums,
                curriculum: curriculum,
                user: user,
                studentId: req.params.id
              });
            });
          }
        });
    });
  } else {
    Curriculum.find({
      studentId: req.params.id
    }, function (err, curriculums) {
      Curriculum.findOne({
          studentId: req.params.id,
          academicYear:
            (new Date()).getFullYear() + '-' + (new Date().getFullYear() + 1)
        })
        .populate('subjects')
        .exec(function (err, curriculum) {
          console.log(curriculum);
          if (curriculum) {
            User.findById(req.params.id, function (err, user) {
              return res.render('admin/viewgrade', {
                curriculums: curriculums,
                curriculum: curriculum,
                user: user,
                studentId: req.params.id
              });
            });
          } else if (!curriculum) {
            Curriculum.findOne({
                studentId: req.params.id,
                academicYear:
                  ((new Date()).getFullYear() - 1) + '-' + (new Date()).getFullYear()
              })
              .populate('subjects')
              .exec(function (err, curriculum) {
                User.findById(req.params.id, function (err, user) {
                  return res.render('admin/viewgrade', {
                    curriculums: curriculums,
                    curriculum: curriculum,
                    user: user,
                    studentId: req.params.id
                  });
                });
              });
          }
        });
    });
  }
});

router.post('/vmos', function (req, res, next) {
  var vmos = new Vmos();

  // Vmos.findByIdAndRemove(req.body.id, function (err, vmos) {});
  vmos.vision = req.body.vision;
  vmos.mission = req.body.mission;
  vmos.save(function (err, vmos) {
    if (err) return next(err);
    req.flash(
      'success',
      'VMOS Updated'
    );
    console.log("updated")
    res.redirect('/vmos');
  });
});

router.get("/manage-faculty", adminAuthentication, function (req, res, next) {
  if (req.query.lastName) {
    User.find({
      user: 'faculty'
    }).sort({
      "profile.lastName": 1,
      "profile.firstName": 1
    }).exec(function (err, users) {
      if (err) return next(err);
      res.render('admin/manage-faculty', {
        users: users
      });
    });
  } else {
    User.find({
      user: "faculty"
    }, function (err, users) {
      if (err) return next(err);
      res.render("admin/manage-faculty", {
        users: users
      });
    });
  }
});
router.get("/manage-faculty/:id", adminAuthentication, function (req, res, next) {
  User
    .findById({
      _id: req.params.id
    })
    .populate("faculty")
    .exec(function (err, users) {

      if (err) return next(err);
      console.log(users);
      res.render("admin/assignSubjects", {
        users: users
      });
    });
});
router.get('/vmos', function (req, res, next) {
  Vmos.find({}, function (err, visionmission) {
    if (err) return next(err);
    console.log(visionmission[0].vision);
    res.render('admin/vmos', {
      visionmission: visionmission
    });
  });
  // Vmos.find({}, function (err, vmos) {
  //   // console.log(vmos.vision)
  //   if (err) return next(err);
  //   console.log(vmos);
  //   console.log(vision);
  //   res.render('admin/vmos', {
  //     vmos: vmos
  //     // mission: mission,
  //   });
  // });
});

router.get("/manage-faculty/:id", adminAuthentication, function (req, res, next) {
  User
    .findById({
      _id: req.params.id
    })
    .populate("faculty")
    .exec(function (err, users) {

      if (err) return next(err);
      console.log(users);
      res.render("admin/assignSubjects", {
        users: users
      });
    });
});

router.post("/manage-faculty/:id", adminAuthentication, function (req, res, next) {
  User.findById({
    _id: req.params.id
  }, function (err, user) {
    Handle.findOne({
      subject: req.body.subject,
      section: req.body.section,
      yrLvl: req.body.yrLvl
    }, function (err, teacher) {
      if (err) return next(err);

      if (teacher) {
        req.flash("message", "there is already a faculty assigned to this subject");
        return res.redirect("back");
      } else {

        var handle = new Handle();
        handle.subject = req.body.subject;
        handle.section = req.body.section;
        handle.yrLvl = req.body.yrLvl;
        handle.faculty = user._id;
        handle.save(function (err, handle) {
          if (err) return next(err);
          console.log(handle);
        });

        user.faculty.push(handle);
        user.save(function (err, user) {
          if (err) return next(err);
          console.log(user);
          req.flash("message", "Successfully assigned a subject");
        });
        return res.redirect("back");
      }
    });
  });
});

router.put("/manage-faculty/:id", adminAuthentication, function (req, res, next) {
  if (req.body.publisher == "true" || req.body.publisher == true) {
    User.update({
      _id: req.params.id
    }, {
      publisher: false
    }).exec(function (err, user) {
      if (err) return next(err);
      User.findById(req.params.id, function (err, user) {

        // user.publisher = true;
        // user.save(function(err, user){
        //   if(err) return next(err);
        //   console.log(user);
        // });
        req.flash("message", "You successfully disabled the manage publisher on this staff.");
        return res.redirect("/manage-faculty/" + user._id);
      });
    });

  } else {
    User.update({
      _id: req.params.id
    }, {
      publisher: true
    }).exec(function (err, user) {
      if (err) return next(err);
      User.findById(req.params.id, function (err, user) {
        req.flash("message", "You successfully enable the manage publisher on this staff.");
        return res.redirect("/manage-faculty/" + user._id);
      });
    });
  }
});
router.delete("/manage-faculty/:id", adminAuthentication, function (req, res, next) {
  Handle.findByIdAndRemove(req.params.id, function (err, subject) {
    if (err) return next(err);
    req.flash("message", "You successfully deleted a handled subject of this staff");
    return res.redirect("back");
  });
});

router.get('/managepubs', adminAuthentication, function (req, res, next) {
  if (req.query.sort) {
    Literary.find({
      status: false,
      archive: false
    }).sort({
      litNumber: 1
    }).exec(function (err, literaries) {
      if (err) return next(err);
      res.render('admin/managepublication', {
        literaries: literaries
      });
    });
  } else if (req.query.photojournal) {
    Literary.find({
      status: false,
      archive: false,
      category: "photojournal"
    }).sort({
      publishDate: 1
    }).exec(function (err, literaries) {
      if (err) return next(err);
      res.render('admin/managepublication', {
        literaries: literaries
      });
    });
  } else if (req.query.editorial) {
    Literary.find({
      status: false,
      archive: false,
      category: "editorial"
    }).sort({
      publishDate: 1
    }).exec(function (err, literaries) {
      if (err) return next(err);
      res.render('admin/managepublication', {
        literaries: literaries
      });
    });
  } else if (req.query.story) {
    Literary.find({
      status: false,
      archive: false,
      category: "story"
    }).sort({
      publishDate: 1
    }).exec(function (err, literaries) {
      if (err) return next(err);
      res.render('admin/managepublication', {
        literaries: literaries
      });
    });
  } else if (req.query.poem) {
    Literary.find({
      status: false,
      archive: false,
      category: "poem"
    }).sort({
      publishDate: 1
    }).exec(function (err, literaries) {
      if (err) return next(err);
      res.render('admin/managepublication', {
        literaries: literaries
      });
    });
  } else {
    Literary.find({
      status: false,
      archive: false
    }, function (err, literaries) {
      if (err) return next(err);
      res.render('admin/managepublication', {
        literaries: literaries
      });
    });
  }
});

// router.delete('/managepubs/:id', function(req, res, next) {
//   Literary.findByIdAndRemove(req.params.id, function(err, news) {
//       if (err) return next(err);
//       console.log(news);
//       res.redirect('/managepubs');
//   });
// });

// router.post('/managepubs/:id', function(req, res, next) {
//   Literary.findById(req.params.id, function(err, news) {
//     news.status = true;
//     news.save(function(err, news) {
//       if (err) return next(err);
//       res.redirect('/managepubs');
//     });
//   });
// });

router.post('/managepubs/:id/edit', adminAuthentication, function (req, res, next) {
  Literary.findById(req.params.id, function (err, news) {
    if (err) return next(err);
    news.category = req.body.category;
    news.title = req.body.title;
    news.content = req.body.content;
    news.comments = req.body.comments;
    news.save(function (err, news) {
      if (err) return next(err);
      req.flash("message", "You successfully added a publication!");
      res.redirect('/managepubs');
    });
  });
});

router.post("/managepubs/delete", adminAuthentication, function (req, res, next) {
  if (req.body.uniqueId && req.body.uniqueId.constructor == String) {
    Literary.update({
      _id: req.body.uniqueId
    }, {
      archive: true
    }).exec(function (err, lit) {
      if (err) return next(err);
      req.flash("message", "You successfully deleted a publication!");
      return res.redirect("/managepubs");
    });
  } else if (req.body.uniqueId && req.body.uniqueId.constructor == Array) {
    var litArray = req.body.uniqueId;
    litArray.forEach(function (lit) {
      Literary.update({
        _id: lit
      }, {
        archive: true
      }).exec(function (err, lit) {
        if (err) return next(err);
        req.flash("message", "You successfully added a publication!");

      });
    });
    return res.redirect("/managepubs");
  } else {
    req.flash("message", "You didnt select an ID.");
    return res.redirect("/managepubs");
  }

});

router.post("/managepubs/accept", adminAuthentication, function (req, res, next) {


  if (req.body.uniqueId && req.body.uniqueId.constructor == String) {
    Literary.update({
      _id: req.body.uniqueId
    }, {
      status: true
    }).exec(function (err, lit) {
      console.log(lit);
      if (err) return next(err);
      req.flash("message", "You successfully published!");
      return res.redirect("/managepubs");
    });
  } else if (req.body.uniqueId && req.body.uniqueId.constructor == Array) {
    var litArray = req.body.uniqueId;
    for (var i = 0; i < litArray.length; i++) {
      Literary.update({
        _id: litArray[i]
      }, {
        status: true
      }).exec(function (err, lit) {
        console.log(lit);
      });
    }
    return res.redirect("/managepubs");
  } else if (!req.body.uniqueId) {
    req.flash("message", "You didnt select any ID.");
    return res.redirect('/managepubs');
  } else {
    req.flash("message", "You didnt select any ID.");
    return res.redirect("/managepubs");
  }

});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;