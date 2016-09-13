var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
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
    .get(function(req, res, next) {
        mongoose.model('Todos').find({}, function(err, todolist) {
            if (err) {
                res.send(' Have problem');
            } else {
                res.render('todo', {
                    title: 'Todo App',
                    todos: todolist
                });
            }
        });
    })
    .post(function(req, res, next) {
        var tododescription = req.body.tododescription;
        mongoose.model('Todos').create({
            tododesc: tododescription
        }, function(err, todo) {
            if (err) {
                res.send('Have problem');
            } else {
                res.redirect('back');
            }
        });
    });



module.exports = router;
