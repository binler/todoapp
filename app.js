var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

var passportSocketIo = require("passport.socketio");

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

var app = express();

app.io = require('socket.io')();

var db = require('./model/db'),
    todo = require('./model/todo'),
    mesage = require('./model/mesage');

var routes = require('./routes/index'),
    users = require('./routes/users'),
    todos = require('./routes/todo'),
    admins = require('./routes/admin')(app.io);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Setup Session
app.use(session({
    secret: 'a4f8071f-c873-4447-8ee2',
    store: new MongoStore({
        url: 'mongodb://localhost/testdb',
    }),
    resave: true,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(flash());
app.use(passport.session());

// Registry Router
app.use('/', routes);
app.use('/users', users);
app.use('/todos', todos);
app.use('/admin', admins);


// Passport config
var Account = require('./model/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// https://namvuhn.wordpress.com/2016/05/10/nodejs-tim-hieu-ve-module-mongoose-trong-nodejs/

app.io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'connect.sid',
    secret: 'a4f8071f-c873-4447-8ee2',
    store: new MongoStore({
        url: 'mongodb://localhost/testdb',
    }),
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail,
    passport: passport
}));

function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');
    accept();
}

function onAuthorizeFail(data, message, error, accept) {
    if (error)
        throw new Error(message);
    console.log('failed connection to socket.io:',message);
    accept(null, false);

}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
