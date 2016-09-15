var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose');
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

var sess;

router.route('/')
  .all(function(req, res, next){
    sess = req.session;
    if(!sess.username){
      res.redirect('/admin/login');
    } else {
      res.redirect('/admin');
      next();
    }
  })
  .get(function(req, res, next){
    res.render('admin');
  });

router.route('/login')
  .get(function(req, res, next){
    res.render('login', {title: 'Let Go!!!'});
  })
  .post(function(req, res, next){
    sess.username = req.body.login_username;
    res.redirect('/admin');
  });



module.exports = router;
