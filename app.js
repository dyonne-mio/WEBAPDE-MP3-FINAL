var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var moment = require('moment');

var mongoose = require('mongoose');
var session = require('express-session')

var indexRouter = require('./routes/index'); //calling controllers
var usersRouter = require('./routes/users');
var promptsRouter = require('./routes/prompts');


var app = express();

var Users = null;
var Prompts = null;
var Branches = null;
var PromptBranches = null;
var PromptViews = null;
var FollowedPrompts = null;
var Activities = null;
var HiddenBranches = null;

var port = 3000;

var shortDateFormat = "ddd @ h:mmA";
app.locals.moment = moment;
app.locals.shortDateFormat = shortDateFormat;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://admin:admin@cluster0-5rpcc.mongodb.net/writers_block_db?retryWrites=true&w=majority', { useNewUrlParser: true });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: "secret name",
    resave: true,
    saveUninitialized: true, //when a user first logs in for the first time, it will save that session
    //name : "cookie monster",//name of the session cookie
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 2
        //example if u want it to last until dec only:
        //expires: Date(2019, 12, 31, 23, 59)
    }
}));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/prompts', promptsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);

    if (err.status == 404) {
        res.render('404')
        ''
    } else {
        res.render('error');
    }
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected to MongoDB.");

    Users = require('./models/users.js');
    Prompts = require('./models/prompts.js');
    Branches = require('./models/branches.js');
    PromptViews = require('./models/prompt-views.js');
    PromptBranches = require('./models/prompt-branches.js');
    FollowedPrompts = require('./models/followed-prompts.js');
    Activities = require('./models/activities.js');
    HiddenBranches = require('./models/hidden-branches.js');

    app.listen(process.env.PORT || 3000, function() {
        console.log("Listening @ port " + port + ".");
    });
});

module.exports = app;