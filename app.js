var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var db = require('./db.js');

var index = require('./routes/index');
var users = require('./routes/users');
var imageObj = require('./app/models/image');
var app = express();
var recursive = require('recursive-readdir');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

imageObj.find().exec(function(e, s) {
	console.log(e, s);
	if (!s.length) {
		//insert here the data in db.
		var fs = require("fs");
		recursive('public/assets/img/', function(err, files) {
			// Files is an array of filename 
			var fileArray = [];
			console.log(files);
			if (files.length) {
				files.forEach(function(value) {
					var check = value.split("/");
					console.log("check", check);
					fileArray.push({
						"folder": check.length == 5 ? check[3] : '',
						title: check[check.length - 1]
					})
				})
				imageObj.create(fileArray, function(err, suc) {
					// body...
					console.log("err", err, "suc", suc)
				})


				console.log("fileArray is ", fileArray);

			}
		});
	}
})

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;