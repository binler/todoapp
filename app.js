var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

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
    chats = require('./routes/chat')(app.io),
    admins = require('./routes/admin');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Setting session


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser('keyboard cat'));
app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1);
app.use(session({
    secret: 'keyboard cat',
    saveUninitialized: true, // don't create session until something stored
    resave: false, //don't save session if unmodified
    cookie: {
        secure: true
    },
    store: new MongoStore({
        url: 'mongodb://localhost/testdb'
    })
}));

app.use('/', routes);
app.use('/users', users);
app.use('/todos', todos);
app.use('/chat', chats);
app.use('/admin', admins);



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
