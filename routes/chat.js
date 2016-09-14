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
    mongoose.model('Messages').find({}, function(err, results){
      if (err) {
        res.send("have problem");
      } else {
        res.render('chat',{
          title: 'Chat Application',
          messages: results
        });
      }
    });
});

module.exports = function(io) {

    io.on('connection', function(socket) {
        console.log('a user connect');
        socket.on('chat message', function(data) {
            mongoose.model('Messages').create({
                message: data.message
            }, function(err, results) {
                if (err) {
                    res.send('Co loi');
                } else {
                    io.emit('chat message', data);
                }
            });
        });
    });


    return router;
};
