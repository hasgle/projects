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
var bucket_name='dristi';
var collection_name='first'
 fs.readFile('auth.json','utf8', (err, data) => {
  if (err) throw err;
  data=JSON.parse(data);
collection_name=data.collection_name;
bucket_name=data.bucket_name;//console.log('cjfxgfchgvhjv',data1,data2);

});
function uploadToS3(path,filename){

var params1 = {
  Bucket: bucket_name,
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
  searchFaces(filename);
  }
});

}
function searchFaces(image_id){
 var params = {
  CollectionId: collection_name, 
  FaceMatchThreshold: 96, 
  Image: {
   S3Object: {
    Bucket: bucket_name, 
    Name: image_id
   }
  }, 
  MaxFaces: 5
 };
 rekognition.searchFacesByImage(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   console.log(data);
 if(data){  if(data.FaceMatches[0])   {
toggle_pin();//on for 40 seconds
Rd_led.digitalWrite(0);
 toggle_grn_led()//on for a second
Buzzer.digitalWrite(0); 

console.log('user verified.............!!!!!!!!!!!!!!!!!!!!!!!!1');


   }
   else {

led.digitalWrite(0);//on for 40 seconds
Grn_led.digitalWrite(0);
toggle_buzzer();
toggle_red_led(); 
    console.log('user not authnticated...............!!!!!!!!!!!!1');    
   }}
else

{led.digitalWrite(0);//on for 40 seconds
Grn_led.digitalWrite(0);
toggle_buzzer();
toggle_red_led();
    console.log('user not authnticated and no face in image protocol...............!!!!!!!!!!!!1');}
       // successful response
  
 });

}











 function indexFaces(image_id){


var params = {
  CollectionId: collection_name, 
  DetectionAttributes: [
  ], 
  ExternalImageId: image_id, 
  Image: {
   S3Object: {
    Bucket: bucket_name, 
    Name: image_id
   }
  }
 };
 rekognition.indexFaces(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
  
 });




 }
 //====================================================GPIO setup===============================================================


const Gpio = require('pigpio').Gpio;
 
const button = new Gpio(23, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_UP,
  alert: true
});
 

 const led=new Gpio(17,{mode:Gpio.OUTPUT});
 const Grn_led=new Gpio(27,{mode:Gpio.OUTPUT});
 const Rd_led=new Gpio(22,{mode:Gpio.OUTPUT});
 const Buzzer=new Gpio(4,{mode:Gpio.OUTPUT});
var count=0; 
// Level must be stable for 10 ms before an alert event is emitted.
button.glitchFilter(10000);
 
Grn_led.digitalWrite(0);
Buzzer.digitalWrite(0);
Rd_led.digitalWrite(0);
led.digitalWrite(0);




 //===================================================camera setup==============================================================
 const PiCamera = require('pi-camera');
const myCamera = new PiCamera({
  mode: 'photo',
  output: `${ __dirname }/public/uploads/capture.jpg`,
  width: 640,
  height: 480,
  nopreview: true,
});

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
server.listen('80',function(err){

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
app.get('/',function(req,res){
res.render('home1',{title:'index-form'});
});


        
            
var canBeCalled=true;

button.on('alert', (level, tick) => {
  console.log("button is pressed");
  if(canBeCalled){

setDelay();
  if (level === 0) {
    //Grn_led.digitalWrite(0);
    
    var filepath=path.join(__dirname, 'public/uploads/')+'capture.jpg';
  myCamera.snap()
  .then((result) => {

      uploadToS3(filepath,'capture.jpg');
   console.log('image captured');
  // toggle_grn_led1();//indication
  })
  .catch((error) => {
    console.log(error);  // Handle your error
  });
  }
  else
  {
console.log("button is not pressed");

//=============set default values for outputs
}}
else
{console.log('no action');
}
});
var count0=0;
function setDelay(){

canBeCalled=false;
console.log('delay press function calleed');
var status=setInterval(() => {
count0=count0+1;
if(count0==10){
count0=0;
clearInterval(status);
canBeCalled=true;}
else
canBeCalled=false;
}, 1000);


}

var count1=0;
var count2=0;
var count3=0;
var count4=0;





function toggle_pin(){
console.log('led function calleed');
var status=setInterval(() => {
count=count+1;
if(count==40){
count=0;
clearInterval(status);
led.digitalWrite(0);}
else
led.digitalWrite(1);
}, 1000);

}

function toggle_grn_led(){
console.log('green function calleed');
var status=setInterval(() => {
count1=count1+1;
if(count1==10){
count1=0;
clearInterval(status);
Grn_led.digitalWrite(0);}
else
Grn_led.digitalWrite(1);
}, 1000);


}

function toggle_grn_led1(){
console.log('image function calleed');
var status=setInterval(() => {
count4=count4+1;
if(count4==2){
count4=0;
clearInterval(status);
Grn_led.digitalWrite(0);}
else
Grn_led.digitalWrite(1);
}, 1000);


}

function toggle_buzzer(){
console.log('buzzer function calleed');
var status=setInterval(() => {
count2=count2+1;
if(count2==5){
count2=0;
clearInterval(status);
Buzzer.digitalWrite(0);}
else
Buzzer.digitalWrite(1);
}, 1000);


}
function toggle_red_led(){
console.log('red function calleed');
var status=setInterval(() => {
count3=count3+1;
if(count3==5){
count3=0;
clearInterval(status);
Rd_led.digitalWrite(0);}
else
Rd_led.digitalWrite(1);
}, 1000);


}


