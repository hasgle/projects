//====================================================================require basic essntials============================================
var express=require('express');
var app=express();
var http=require('http');
var fs=require('fs');
var path = require('path');
var hbs=require('express-handlebars');
var multer  = require('multer');
var validator=require('express-validator');
var session=require('express-session');
//==================================================================requiring and initialising aws-sdk objects=============================
var AWS = require('aws-sdk');
const paths = require('path');
AWS.config.update({region: 'ap-northeast-1'});
var rekognition = new AWS.Rekognition({apiVersion: '2016-06-27'});




//configuring the AWS environment


var s3 = new AWS.S3();

var ssn;
function uploadToS3(path,filename){

var params1 = {
  Bucket: 'dristi',
  Body : fs.createReadStream(path),
  Key :paths.basename(path)
};

s3.upload(params1, function (err, data) {
  //handle error
  if (err) {
    console.log("Error", err);
  }

  //success
  if (data) {
  console.log(data);
  indexFaces(filename);
  }
});

}
 function indexFaces(image_id){

var params = {
  CollectionId: "first", 
  DetectionAttributes: [
  ], 
  ExternalImageId: image_id, 
  Image: {
   S3Object: {
    Bucket: "dristi", 
    Name: image_id
   }
  }
 };
 rekognition.indexFaces(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
  
 });




 }

//=============================setting view engine====================================================
app.engine('hbs',hbs({extname:'hbs' ,defaultLayout :'layout' , layoutsDir :__dirname+'/views'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret:'hasgle',
  resave: false,
  saveUninitialized: false
})); 
app.use(validator());
app.use(express.static(path.join(__dirname, 'public')));

//=========================================initialising server========================
var server=http.createServer(app);
server.listen('8080',function(err){

if(err) throw err;
else console.log('server started on port 80');

});
//=========================================================multer initialisation==================
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads')
    }, 
    filename: function(req, file, next){
        console.log(file);
        const ext = file.mimetype.split('/')[1];
        next(null, file.fieldname + '-' + Date.now() + '.'+ext);
      }
   
});

var upload = multer({
storage: storage,
limits:{fileSize:1000000},
fileFilter:function(req,file,cb){
checkFileType(file,cb);

}}).single('img');

function checkFileType(file,cb){
const types=/jpg|jpeg|png|gif/;
const ext=types.test(file.mimetype.split('/')[1].toLowerCase());
 if(ext)
 {
 	return cb(null,true);

 }
 else{
cb('ERROR: invalid file format',true)
 }

}

//==================================================================routes ====================

app.get('/create-collection',function(req,res){
res.render('collection-form',{title:'collection-form'});
});
app.post('/create-collection',function(req,res){
	console.log(req.body);
var collection_name=req.body.collection_name;

console.log();
var params = {
  CollectionId: collection_name
 };
 rekognition.createCollection(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
   /*
   data = {
    CollectionArn: "aws:rekognition:us-west-2:123456789012:collection/myphotos", 
    StatusCode: 200
   }
   */
 });

res.redirect('/addFaces');;
});
app.get('/addFaces',function(req,res){
res.render('faceUpload-form',{title:'index-form'});
});
app.post('/addFaces',function(req,res){
	var ssn=req.session;

	upload(req,res,function(err){
		if(err) res.render('faceUpload-form',{msg: err});
		else{
			console.log(req.file);
			var file=req.file;
			var filepath=path.join(__dirname, 'public/uploads/')+file.filename;
            ssn.filename=file.filename;
            console.log(filepath);
            uploadToS3(filepath,ssn.filename);
            
console.log(ssn.filename);
res.render('display',{msg:'face added to'+'collection-name'+'with id-'+'face-id',path:ssn.filename});

		}


	});

});