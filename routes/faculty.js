var express = require('express');
var router = express.Router();
var expressSanitizer = require('express-sanitizer');
var User = require('../models/user');
var Pending = require('../models/pending');
var News = require('../models/newsAndAnnouncement');
var Curriculum = require('../models/curriculum');
var Subject = require('../models/subject');
var Handle = require('../models/facultyHandle');
var async = require('async');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var passportConfig = require('../config/passport');

function facultyAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.user == 'faculty') {
      return next();
    } else {
      return res.redirect('back');
    }
  } else {
    return res.redirect('/login');
  }
}

router.get('/encode', facultyAuthentication, function (req, res, next) {
  Subject.find({
    faculty: req.user._id
  }, function (err, subjects) {
    if (err) return next(err);
    res.render('faculty/viewencoded-grades', {
      subjects: subjects
    });
  });
});

router.get('/encode/:yr/:sec/:subj', facultyAuthentication, function (
  req,
  res,
  next,
) {
  Subject.find({
      yrLvl: req.params.yr,
      section: req.params.sec,
      subject: req.params.subject,
    },
    function (err, subject) {
      if (err) return next(err);
      res.render('faculty/viewgrades', {
        subject: subject
      });
    },
  );
});

router.get(
  '/encode-grades/:id/:yrLvl/:subject/:section',
  facultyAuthentication,
  function (req, res, next) {
    Subject.find({
      faculty: req.params.id,
      yrLvl: req.params.yrLvl,
      subject: req.params.subject,
      section: req.params.section,
    }).exec(function (err, handle) {
      // console.log(handle);
      // console.log(use)
      res.render('faculty/encode-grades', {
        handle: handle,
        yrLvl: req.params.yrLvl,
        subject: req.params.subject,
        section: req.params.section,
      });
    });
  },
);

router.post('/encode-grades', facultyAuthentication, function (req, res, next) {
  var grades = [];
  console.log('ohh: ' + req.body.toggle);
  var toggle = req.body.toggle;
  var password = (req.body.password).toString();
  var userPass = req.user.password;
  // if(req.body.password !== "123"){
  //   req.flash("message", "You entered a wrong password");
  //   return res.redirect("back");
  // }
  if (toggle == '') {
    if (!(req.body.yrLvl === 'grade11' || req.body.yrLvl === 'grade12')) {
      if (req.body.firstGrading) {
        if (req.body.firstGrading.length > 0) {
          var firstGrading = req.body.firstGrading;
          console.log(req.body.firstGrading);
        }
      }
      if (req.body.secondGrading) {
        if (req.body.secondGrading.length > 0) {
          var secondGrading = req.body.secondGrading;
        }
      }
      if (req.body.thirdGrading) {
        if (req.body.thirdGrading.length > 0) {
          var thirdGrading = req.body.thirdGrading;
        }
      }
      if (req.body.fourthGrading) {
        if (req.body.fourthGrading.length > 0) {
          var fourthGrading = req.body.fourthGrading;
        }
      }
      if (req.body.remarks) {
        if (req.body.remarks.length > 0) {
          var remarks = req.body.remarks;
        }
      }
      if (req.body.id) {
        if (req.body.id.length > 0) {
          for (var i = 0; i < req.body.id.length; i++) {
            if (req.body.firstGrading) {
              console.log('value: ' + firstGrading[i]);
              grades[i] = {
                firstGrading: firstGrading[i],
                first: false,
                postFirstGrading: true,
              };
              console.log('array: ' + grades[i].firstGrading);
              console.log('array: ' + grades[i].first);
            }
            if (req.body.secondGrading) {
              grades[i] = {
                secondGrading: secondGrading[i],
                second: false,
                postSecondGrading: true,
              };
            }
            if (req.body.thirdGrading) {
              grades[i] = {
                thirdGrading: thirdGrading[i],
                third: false,
                postThirdGrading: true,
              };
            }

            if (req.body.fourthGrading) {
              grades[i] = {
                fourthGrading: fourthGrading[i],
                postFourthGrading: true,
                fourth: false,
              };
            }

            if (
              req.body.firstGrading &&
              req.body.secondGrading &&
              req.body.thirdGrading &&
              req.body.fourthGrading
            ) {
              grades[i] = {
                firstGrading: firstGrading[i],
                first: false,
                postFirstGrading: true,
                secondGrading: secondGrading[i],
                second: false,
                postSecondGrading: true,
                thirdGrading: thirdGrading[i],
                third: false,
                postThirdGrading: true,
                fourthGrading: fourthGrading[i],
                fourth: false,
                postFourthGrading: true,
              };
            }
          }
        }
      }
    } else {
      if (req.body.firstSem) {
        if (req.body.firstSem >= 0 || '') {
          var firstSem = req.body.firstSem;
        }
      }
      if (req.body.secondSem) {
        if (req.body.secondSem >= 0 || '') {
          var secondSem = req.body.secondSem;
        }
      }
      if (req.body.id) {
        if (req.body.id.length > 0) {
          for (var i = 0; i < req.body.id.length; i++) {
            if (req.body.firstSem) {
              grades[i] = {
                firstSem: req.body.firstSem[i],
                firstSemester: false,
                postFirstSem: true,
              };
            }

            if (req.body.secondSem) {
              grades[i] = {
                secondSem: req.body.secondSem[i],
                secondSemester: false,
                postSecondSem: true,
              };
            }

            if (req.body.firstSem && req.body.secondSem) {
              grades[i] = {
                firstSem: req.body.firstSem[i],
                firstSemester: false,
                postFirstSem: true,
                secondSem: req.body.secondSem[i],
                postSecondSem: true,
                secondSemester: false,
              };
            }
          }
        }
      }
    }
    console.log(grades);
    var gradeArray = req.body.id;
    console.log('before loop:' + grades[i]);
    for (var i = 0; i < gradeArray.length; i++) {
      Subject.updateMany({
        _id: gradeArray[i]
      }, {
        $set: grades[i]
      }).exec(
        function (err, subject) {
          if (err) return next(err);
          console.log(subject);
        },
      );
    }
    res.redirect('/viewencoded-grades');

    // Subject.findById(req.params.id)
    // .exec(function(err, subject){
    //   if(err) return next(err);
    //   subject.firstGrading = req.body.firstGrading;
    //   subject.secondGrading = req.body.secondGrading;
    //   subject.thirdGrading = req.body.thirdGrading;
    //   subject.fourthGrading = req.body.fourthGrading;
    //   subject.finalGrading = req.body.finalGrading;
    //   subject.remarks = req.body.remarks;
    //   subject.save(function(err, subject){
    //     if(err) return next(err);
    //     console.log(subject);
    //     return res.redirect("back");
    //   });
    // });
  } else if (toggle == 'true' || toggle == true) {
    console.log('pasok');
    if (!(req.body.yrLvl === 'grade11' || req.body.yrLvl === 'grade12')) {
      if (req.body.firstGrading) {
        if (req.body.firstGrading.length > 0) {
          var firstGrading = req.body.firstGrading;
          console.log(req.body.firstGrading);
        }
      }
      if (req.body.secondGrading) {
        if (req.body.secondGrading.length > 0) {
          var secondGrading = req.body.secondGrading;
        }
      }
      if (req.body.thirdGrading) {
        if (req.body.thirdGrading.length > 0) {
          var thirdGrading = req.body.thirdGrading;
        }
      }
      if (req.body.fourthGrading) {
        if (req.body.fourthGrading.length > 0) {
          var fourthGrading = req.body.fourthGrading;
        }
      }
      if (req.body.id) {
        if (req.body.id.length > 0) {
          for (var i = 0; i < req.body.id.length; i++) {
            if (req.body.firstGrading) {
              console.log('value: ' + firstGrading[i]);
              grades[i] = {
                firstGrading: req.body.firstGrading[i],
              };
              console.log('array: ' + grades[i].firstGrading);
              console.log('array: ' + grades[i].first);
            }
            if (req.body.secondGrading) {
              grades[i] = {
                secondGrading: req.body.secondGrading[i],
              };
            }
            if (req.body.thirdGrading) {
              grades[i] = {
                thirdGrading: req.body.thirdGrading[i],
              };
            }

            if (req.body.fourthGrading) {
              grades[i] = {
                fourthGrading: req.body.fourthGrading[i],
              };
            }

            if (
              req.body.firstGrading &&
              req.body.secondGrading &&
              req.body.thirdGrading &&
              req.body.fourthGrading
            ) {
              grades[i] = {
                firstGrading: req.body.firstGrading[i],
                secondGrading: req.body.secondGrading[i],
                thirdGrading: req.body.thirdGrading[i],
                fourthGrading: req.body.fourthGrading[i],
              };
            }
          }
        }
      }
    } else {
      console.log('firstSem: ' + req.body.firstSem);
      if (req.body.firstSem) {
        if (req.body.firstSem) {
          var firstSem = req.body.firstSem;
        }
      }
      if (req.body.secondSem) {
        if (req.body.secondSem) {
          var secondSem = req.body.secondSem;
        }
      }
      if (req.body.id) {
        console.log('firstSem: ' + firstSem);
        if (req.body.id.length > 0) {
          // var firstSem = req.body.firstSem;
          for (var i = 0; i < req.body.id.length; i++) {
            if (req.body.firstSem) {
              grades[i] = {
                firstSem: req.body.firstSem[i],
              };
            }

            if (req.body.secondSem) {
              grades[i] = {
                secondSem: req.body.secondSem[i],
              };
            }

            if (req.body.firstSem && req.body.secondSem) {
              grades[i] = {
                firstSem: req.body.firstSem[i],
                secondSem: req.body.secondSem[i],
              };
            }
          }
        }
      }
    }
    console.log(grades);
    var gradeArray = req.body.id;
    console.log('before loop:' + grades[i]);
    for (var i = 0; i < gradeArray.length; i++) {
      Subject.updateMany({
        _id: gradeArray[i]
      }, {
        $set: grades[i]
      }).exec(
        function (err, subject) {
          if (err) return next(err);
          console.log(subject);
        },
      );
    }
    res.redirect('/viewencoded-grades');
  }
});

router.post('/encode-grades/save', facultyAuthentication, function (
  req,
  res,
  next,
) {
  var grades = [];
  if (!(req.body.yrLvl === 'grade11' || req.body.yrLvl === 'grade12')) {
    if (req.body.firstGrading) {
      if (req.body.firstGrading.length > 0) {
        var firstGrading = req.body.firstGrading;
        console.log(req.body.firstGrading);
      }
    }
    if (req.body.secondGrading) {
      if (req.body.secondGrading.length > 0) {
        var secondGrading = req.body.secondGrading;
      }
    }
    if (req.body.thirdGrading) {
      if (req.body.thirdGrading.length > 0) {
        var thirdGrading = req.body.thirdGrading;
      }
    }
    if (req.body.fourthGrading) {
      if (req.body.fourthGrading.length > 0) {
        var fourthGrading = req.body.fourthGrading;
      }
    }
    if (req.body.id) {
      if (req.body.id.length > 0) {
        for (var i = 0; i < req.body.id.length; i++) {
          if (req.body.firstGrading) {
            grades[i] = {
              firstGrading: firstGrading[i],
            };
          }
          if (req.body.secondGrading) {
            grades[i] = {
              secondGrading: secondGrading[i],
            };
          }
          if (req.body.thirdGrading) {
            grades[i] = {
              thirdGrading: thirdGrading[i],
            };
          }

          if (req.body.fourthGrading) {
            grades[i] = {
              fourthGrading: fourthGrading[i],
            };
          }

          if (
            req.body.firstGrading &&
            req.body.secondGrading &&
            req.body.thirdGrading &&
            req.body.fourthGrading
          ) {
            grades[i] = {
              firstGrading: firstGrading[i],
              secondGrading: secondGrading[i],
              thirdGrading: thirdGrading[i],
              fourthGrading: fourthGrading[i],
            };
          }
        }
      }
    }
  } else {
    if (req.body.firstSem) {
      if (req.body.firstSem > 0) {
        var firstSem = req.body.firstSem;
      }
    }
    if (req.body.secondSem) {
      if (req.body.secondSem > 0) {
        var secondSem = req.body.secondSem;
      }
    }
    if (req.body.id) {
      if (req.body.id.length > 0) {
        for (var i = 0; i < req.body.id.length; i++) {
          if (req.body.firstSem) {
            grades[i] = {
              firstSem: firstSem[i],
            };
          }

          if (req.body.secondSem) {
            grades[i] = {
              secondSem: secondSem[i],
            };
          }

          if (req.body.firstSem && req.body.secondSem) {
            grades[i] = {
              firstSem: firstSem[i],
              secondSem: secondSem[i],
            };
            console.log(grades[i]);
          }
        }
      }
    }
  }
  console.log('test: ' + grades);
  var gradeArray = req.body.id;
  for (var i = 0; i < gradeArray.length; i++) {
    Subject.update({
      _id: gradeArray[i]
    }, {
      $set: grades[i]
    }).exec(function (
      err,
      subject,
    ) {
      if (err) return next(err);
      console.log(subject);
      req.flash("message", "You successfully encode a grade.");
      return res.redirect('/viewencoded-grades');
    });
  }

  // Subject.findById(req.params.id)
  // .exec(function(err, subject){
  //   if(err) return next(err);
  //   subject.firstGrading = req.body.firstGrading;
  //   subject.secondGrading = req.body.secondGrading;
  //   subject.thirdGrading = req.body.thirdGrading;
  //   subject.fourthGrading = req.body.fourthGrading;
  //   subject.finalGrading = req.body.finalGrading;
  //   subject.remarks = req.body.remarks;
  //   subject.save(function(err, subject){
  //     if(err) return next(err);
  //     console.log(subject);
  //     return res.redirect("back");
  //   });
  // });
});

router.get('/encode1-grades', facultyAuthentication, function (req, res, next) {
  if (req.query.yrLvl1 && req.query.section) {
    const regex = new RegExp(escapeRegex(req.query.section), 'gi');
    const regex1 = new RegExp(escapeRegex(req.query.yrLvl1), 'gi');
    Handle.find({
        faculty: req.user._id,
        section: regex,
        yrLvl: regex1
      })
      .sort({
        section: 1,
        yrLvl: 1
      })
      .exec(function (err, handles) {
        if (err) return next(err);
        res.render('faculty/encode1-grades', {
          handles: handles
        });
      });
  } else {
    Handle.find({
      faculty: req.user._id
    }).exec(function (err, handles) {
      res.render('faculty/encode1-grades', {
        handles: handles
      });
    });
  }
});

router.get(
  '/viewgrades/:id/:yrLvl/:subject/:section',
  facultyAuthentication,
  function (req, res, next) {
    Subject.find({
        faculty: req.params.id,
        yrLvl: req.params.yrLvl,
        subject: req.params.subject,
        section: req.params.section,
      },
      function (err, subjects) {
        res.render('faculty/viewgrades', {
          subjects: subjects,
          yrLvl: req.params.yrLvl,
          subject: req.params.subject,
          section: req.params.section,
        });
      },
    );
  },
);

router.get('/viewencoded-grades', facultyAuthentication, function (
  req,
  res,
  next,
) {
  if (req.query.yrLvl1 && req.query.section) {
    const regex = new RegExp(escapeRegex(req.query.section), 'gi');
    const regex1 = new RegExp(escapeRegex(req.query.yrLvl1), 'gi');
    Handle.find({
        faculty: req.user._id,
        section: regex,
        yrLvl: regex1
      })
      .sort({
        section: 1,
        yrLvl: 1
      })
      .exec(function (err, handles) {
        if (err) return next(err);
        res.render('faculty/viewencoded-grades', {
          handles: handles
        });
      });
  } else {
    Handle.find({
      faculty: req.user._id
    }).exec(function (err, handles) {
      res.render('faculty/viewencoded-grades', {
        handles: handles
      });
    });
  }
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = router;