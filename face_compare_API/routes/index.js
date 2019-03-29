var express = require('express');
var router = express.Router();
var multer  = require('multer');
var session = require('express-session');
var base64Img = require('base64-img');
var AWS = require('aws-sdk');
var uuid = require('uuid');
AWS.config.update({region: 'ap-northeast-1'});
var rekognition = new AWS.Rekognition({apiVersion: '2016-06-27'});
var params={};

const fs = require('fs');
const paths = require('path');
var count=0;

//configuring the AWS environment


var s3 = new AWS.S3();
var filePath = "image1.jpg";
var val=0;
var dataAvailable=null;

function uploadToS3(path){

var params1 = {
  Bucket: 'facecompapi',
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
  	count++;
    console.log("Uploaded in:", data.Location);
    if(count==2){
    	console.log('retrieving data please wali.....!!!!');

    	 rekognition.compareFaces(params, function(err, data) {
   if (err) {console.log(err, err.stack); 
   count=0;}// an error occurred
   else   {
dataAvailable=true;
    console.log(data); 


val=data.FaceMatches[0].Similarity;
console.log(val);


   count=0;}            // successful response
   /*
   data = {
    FaceMatches: [
       {
      Face: {
       BoundingBox: {
        Height: 0.33481481671333313, 
        Left: 0.31888890266418457, 
        Top: 0.4933333396911621, 
        Width: 0.25
       }, 
       Confidence: 99.9991226196289
      }, 
      Similarity: 100
     }
    ], 
    SourceImageFace: {
     BoundingBox: {
      Height: 0.33481481671333313, 
      Left: 0.31888890266418457, 
      Top: 0.4933333396911621, 
      Width: 0.25
     }, 
     Confidence: 99.9991226196289
    }
   }
   */
 });
    }
  }
});

}





 
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/uploads')
    }, 
    filename: function(req, file, next){
        console.log(file);
        const ext = file.mimetype.split('/')[1];
        next(null, file.fieldname + '-' + Date.now() + '.'+ext);
      }
   
});
var path;
var upload = multer({
storage: storage,
limits:{fileSize:1000000},
fileFilter:function(req,file,cb){
checkFileType(file,cb);

}}).single('avatar');

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
/* GET home page. */
router.get('/', function(req, res, next) {
	req.session.destroy();
	path=req.session;
  res.render('index',{filePath1:'/images/uploads/default.jpg' ,filePath2:'/images/uploads/default.jpg'});
});




router.post('/image1',function(req,res){
	path=req.session;
console.log(req);
upload(req,res,function(err){
if(err){
	if(path.file2)
res.render('index',{msg1:err,filePath1:'/images/uploads/default.jpg' ,filePath2:'/images/uploads/'+path.file2});
else
 res.render('index',{msg1:err,filePath1:'/images/uploads/default.jpg' ,filePath2:'/images/uploads/default.jpg'});

}
else {
	if(req.file==undefined){
		if(path.file2)
		res.render('index',{msg1:'error:no file selected',filePath1:'/images/uploads/default.jpg' ,filePath2:'/images/uploads/' +path.file2});
	else 
		 res.render('index',{msg1:'error:no file selected',filePath1:'/images/uploads/default.jpg' ,filePath2:'/images/uploads/default.jpg'});
	}
	else{
		path.file1=req.file.filename;
		if(path.file2)
		res.render('index',{msg1:'file uploaded',filePath1:'/images/uploads/'+path.file1,filePath2:'/images/uploads/'+path.file2});	
	else
		res.render('index',{msg1:'file uploaded',filePath1:'/images/uploads/'+path.file1,filePath2:'/images/uploads/default.jpg'});	
	}

}

});

});
router.post('/image2',function(req,res){
	path=req.session;

upload(req,res,function(err){
if(err){
	if(path.file1)
res.render('index',{msg2: err,filePath1:'/images/uploads/'+path.file1 ,filePath2:'/images/uploads/default.jpg'});
else
 res.render('index',{msg2: err,filePath1:'/images/uploads/default.jpg',filePath2:'/images/uploads/default.jpg'});

}
else {
	if(req.file==undefined){
		if(path.file1)
		res.render('index',{msg2:'error:no file selected',filePath1:'/images/uploads/'+path.file1 ,filePath2:'/images/uploads/default.jpg'});
	else
		res.render('index',{msg2:'error:no file selected',filePath1:'/images/uploads/default.jpg' ,filePath2:'/images/uploads/default.jpg'});
	}
	else{
		path.file2=req.file.filename;
		if(path.file2)
		res.render('index',{msg2:'file uploaded',filePath1:'/images/uploads/'+path.file1 ,filePath2:'/images/uploads/'+path.file2});
		else
		res.render('index',{msg2:'file uploaded',filePath1:'/images/uploads/default.jpg',filePath2:'/images/uploads/'+path.file2});	
	}

}

});

});

router.get('/compare', function(req, res, next) {
	path=req.session;
   val=0;
	var path1='C:/Users/This PC/Desktop/face_compare_API/public/images/uploads/'+path.file1;
	var path2='C:/Users/This PC/Desktop/face_compare_API/public/images/uploads/'+path.file2;
 params = {
  SimilarityThreshold: 0, 
  SourceImage: {
   S3Object: {
    Bucket: "facecompapi", 
    Name: path.file1
   }
  }, 
  TargetImage: {
   S3Object: {
    Bucket: "facecompapi", 
    Name: path.file2
   }
  }
 };
	
uploadToS3(path1);
uploadToS3(path2);

  res.render('comp',{filePath1:'/images/uploads/'+path.file1 ,filePath2:'/images/uploads/'+path.file2,compVal:val});
});


router.get('/data', function(req, res, next) {
  if(dataAvailable)
    {res.send({'similiarity':val});
    
    }
  else
    res.send('Please wait |-|@$g|_e');
});


module.exports = router;