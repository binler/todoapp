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



/* GET home page. */
router.get('/', function(req, res, next) {
    var io = req.app.io;
    io.on('connection', function(socket) {
        socket.on('chat message', function(data) {
            mongoose.model('Messages').create({
                message: data.message,
                created_at: data.created_at
            }, function(err, results) {
                if (err) {
                    res.send('Co loi');
                } else {
                    io.emit('chat message', data);
                }
            });
        });
    });
    res.render('chat', {
        title: 'Chat Example'
    });
});


// app.io.on('connection', function(socket) {
//     console.log('a user connected');
//     socket.on('chat message', function(data) {
//         mongoose.model('Messages').create({
//             message: data.message,
//             created_at: data.created_at
//         }, function(err, results) {
//             if (err) {
//                 res.send('Co loi');
//             } else {
//                 app.io.emit('chat message', data);
//             }
//         });
//     });
// });


module.exports = router;
