var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    Account = require('../model/account'),
    methodOverride = require('method-override');

router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(methodOverride(function(req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

router.route('/')
    .all(function(req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/admin/login');
        }
    })
    .get(function(req, res, next) {
        mongoose.model('Rooms').find({}, function(err, results){
          if(err) next(err);
          res.render('admin', {
              user: req.user,
              title: 'Chat Application',
              rooms: results
          });
        });
    });

router.route('/room')
    .all(function(req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/admin/login');
        }
    })
    .get(function(req, res, next) {
        res.render('create_room', {
            title: 'Create Room chat'
        });
    })
    .post(function(req, res, next) {
        mongoose.model('Rooms').create({
            name: req.body.room_name
        }, function(err, result) {
            if (err) throw err;
            res.redirect('/admin');
        });
    });


// router.route('/room/:room')
//   .get(function(req, res, next){
//     mongoose.model('Rooms').find({}, function(err, results){
//       if(err) next(err);
//       res.render('chat_room', {
//           user: req.user,
//           title: 'Room: ' + req.params.room,
//           rooms: results
//       });
//     });
//   });


router.route('/register')
    .get(function(req, res, next) {
        res.render('register', {
            title: 'Let Register!!'
        });
    })
    .post(function(req, res, next) {
        Account.register(new Account({
            username: req.body.username
        }), req.body.password, function(err, account) {
            if (err) {
                return res.render('register', {
                    title: 'Let Register!!',
                    error: err.message
                });
            }

            passport.authenticate('local')(req, res, function() {
                req.session.save(function(err) {
                    if (err) {
                        return next(err);
                    }
                    res.redirect('/admin');
                });
            });
        });
    });

router.route('/login')
    .get(function(req, res, next) {
        res.render('login', {
            title: 'Let Go!!',
            error: req.flash('error')
        });
    })
    .post(passport.authenticate('local', {
        failureRedirect: '/admin/login',
        failureFlash: true
    }), function(req, res, next) {
        req.session.save(function(err) {
            if (err) {
                next(err);
            }
            res.redirect('/admin');
        });
    });


router.get('/logout', function(req, res, next) {
    req.logout();
    req.session.save(function(err) {
        if (err) {
            return next(err);
        }
        res.redirect('/admin/login');
    });
});



module.exports = function(io) {

    io.on('connection', function(socket) {
        var users = socket.request.user;
        var room = {};
        room.id = '57e389a0bfda7f1ca1932168';
        room.name = 'vtv3';

        function loadMessageRoom(){
          mongoose.model('Messages').find({room_id : room.id}, function(err, messages) {
              if (err) throw err;
              socket.emit('load messages', room, messages);
          });
        }

        loadMessageRoom();
        socket.join(room.id);
        socket.on('chat message', function(data) {
            mongoose.model('Messages').create({
                message: data.message,
                created_at: new Date(),
                _creator: users._id,
                room_id: room.id
            }, function(err, result) {
                if (err) throw err;
                io.to(room.id).emit('chat message', data);
            });

        });

        socket.on('switchRoom', function(newRoom){
          socket.leave(room.id);
          socket.join(newRoom.id);
          room = newRoom;
          loadMessageRoom();
          socket.emit('switchRoom', newRoom);
        });


    });

    return router;
};
