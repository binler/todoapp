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
        mongoose.model('Rooms').find({}, function(err, results) {
            if (err) next(err);
            res.render('admin', {
                user: req.user,
                title: 'Chat Application',
                rooms: results
            });
        });
    });

router.route('/create-room')
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


router.route('/room/:roomname')
    .get(function(req, res, next) {
        mongoose.model('Rooms').find({}, function(err, results) {
            if (err) next(err);
            res.render('chat_room', {
                user: req.user,
                title: 'Room: ' + req.params.roomname,
                rooms: results
            });
        });
    });


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
    var room = {
        id: '',
        name: ''
    };
    var useronline = [];
    io.on('connection', function(socket) {
        var users = socket.request.user;
        useronline.push(users._id);
        var interval = setInterval(function(){
          io.emit('check online', useronline);
        }, 500);
        // var clientsCount = io.engine.clientsCount  count account connect socket io
        if (room.id !== '') {
            socket.join(room.id);
            loadMessageRoom(room.id);
        }

        function loadMessageRoom(id) {
            mongoose.model('Messages')
                .find({
                    room_id: id
                })
                .populate('_creator')
                .exec(function(err, messages) {
                    if (err) throw err;
                    socket.emit('load messages', room, messages);
                });
        }

        function loadUsers() {
            mongoose.model('accounts')
                .find({ _id : {$ne: users._id} })
                .exec(function(err, alluser) {
                    if (err) throw err;
                    socket.emit('load users', alluser);
                });
        }
        loadUsers();
        socket.on('chat message', function(data) {
            mongoose.model('Messages').create({
                message: data.message,
                created_at: data.created_at,
                _creator: users._id,
                room_id: room.id
            }, function(err, result) {
                if (err) throw err;
                io.to(room.id).emit('chat message', data, users);
            });

        });

        socket.on('switchRoom', function(newRoom) {
            if (room.id !== '') {
                socket.leave(room.id);
            }
            room = newRoom;
            socket.join(newRoom.id);
            loadMessageRoom(newRoom.id);
            socket.broadcast.to(newRoom.id).emit('switchRoom', users, newRoom);
        });

        socket.on('disconnect', function() {
            var index = useronline.indexOf(users._id);
            useronline.splice(index, 1);
            io.emit('check online', useronline);
            console.log('disconnect');
        });

    });

    return router;
};
