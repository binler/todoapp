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
        res.render('admin', {
            user: req.user
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

    io.on('connection', function(socket) {
        console.log(socket.request.user);
        mongoose.model('Messages').find({}, function(err, messages) {
            if (err) throw err;
            socket.emit('load old messages', messages);
        });

        socket.on('chat message', function(data) {
            mongoose.model('Messages').create({
                message: data.message,
                created_at: new Date()
            }, function(err, result) {
                if (err) throw err;
                io.emit('chat message', data);
            });
        });


    });

    return router;
};
