var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    passport = require('passport'),
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


/* GET home page. */
router.route('/')
    .all(function(req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/admin/login');
        }
    })
    .get(function(req, res, next) {
        res.render('chat');
    });

module.exports = function(io) {

    io.on('connection', function(socket) {
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
