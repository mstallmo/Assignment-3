var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    methodOverride = require('method-override'),
    hostname = process.env.HOSTNAME || 'localhost',
    port = 8080;

app.get("/", function (req, res) {
  res.redirect("/index.html");
});

var db = require('mongoskin').db('mongodb://user:password@localhost:27017/photos');
console.log(db);


app.get("/addtodo", function (req, res) {
	var x = req.query;
	var callback = function(error, result){
		if(result)
		{
			res.end("added");
		}
	}
	db.collection("todo").insert(x, callback);
 });

 app.get("/renamephoto", function (req, res) {
 	var x = req.query;
 	var callback = function(error, result){
 		if(result)
 		{
 			res.end("done");
 		}
 	}

	db.collection("data").findOne({id: x.id}, function(err, result1) {
		if(result1){
			console.log(result1);
			result1.name = x.name;
			db.collection("data").save(result1, callback);
		}
		else{
			db.collection("data").insert(x, callback);
		}
	});

  });




app.get("/deletephoto", function (req, res) {
	var id = req.query.id;
	var callback = function(error, result){
		if(result)
		{
			res.end("deleted");
		}
	}
	db.collection("data").remove({"id": id}, callback);
});


app.get("/listphotos", function (req, res) {
	db.collection("data").find().toArray(function(err, result) {
    	if (result)
    	{
			res.end(JSON.stringify(result));
		}
	});
});

app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(__dirname + '/client'));
app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));


var fs = require('fs');
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./credentials.json');
var s3 = new AWS.S3()//.client;

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
app.use('/uploadFile', multipartMiddleware);

app.post('/uploadFile', function(req, res){
     var intname = req.body.fileInput;
     var fordb = JSON.parse(decodeURIComponent(req.body.fordb));
     console.log(JSON.stringify(fordb));

     db.collection("data").insert(fordb, function(err2, result){
         if(result){
             res.end("success");
         }
     });

     var tmpPath = req.files.input.path;
     var s3Path = '/' + intname;

     fs.readFile(tmpPath, function (err, data) {
         var params = {
             Bucket:'ameweb',
             ACL:'public-read',
             Key:intname,
             Body: data
         };
         s3.putObject(params, function(err1, data) {});
		 });

});

console.log("Simple static server listening at http://" + hostname + ":" + port);
app.listen(port, hostname);
