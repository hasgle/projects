//=================
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
var frndData=require('./models/frndData');
var frndLst=require('./models/frndLst');
//==================================================================requiring and initialising aws-sdk objects=============================
var AWS = require('aws-sdk');
const paths = require('path');
AWS.config.update({region: 'ap-northeast-1'});
var rekognition = new AWS.Rekognition({apiVersion: '2016-06-27'});


var mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/Dristi', { useNewUrlParser: true });
var db=mongoose.connection;

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


function uploadToS3(path,filename,req,res){

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
  searchFaces(filename,req,res)
  }
});

}
function searchFaces(image_id,req,res){
 var params = {
  CollectionId: collection_name, 
  FaceMatchThreshold:96, 
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
  if(data)   {
    if(data.FaceMatches[0])
      {
     res.render('add_form',{msg: 'user already exists',path:'/images/frnd.png'}); //console.log('user cannot be added');
    return false;
  }
    else
     res.render('add_form',{msg: '',path:'/uploads/'+image_id}); 
      return true;//console.log('user can be added');

}
   else {

    //indexFaces(image_id)
    //console.log('user can b added'); 
    res.render('add_form',{msg: '',path:'/uploads/'+image_id}); 
    return true

   }
          // successful response
  
 });

}


function indexFaces(image_id,req,res){
console.log('function called');

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

var obj=new frndData({
    name :req.body.frndName,
    path:"/uploads/"+ssn.filename,
    collection_name:collection_name
  });

  frndLst.getUsersList('master',function(err,user){
if(err) throw err;
var tempFlag=user.list.indexOf(req.body.frndName);
console.log('tempFlag'+tempFlag);
if(tempFlag>=0){
res.render('friend_view',{msg:'friendname is taken try with a different name'});}
else if(tempFlag<0)
{frndLst.storeUser(req.body.frndName);

  frndData.createUserProfile(obj,function(err,user){
if(err) throw err;
if(!user) res.render('friend_view',{msg:'some rror occurdd while adding frnd try again!!!!!!!'});
if(user){
console.log('about to index Image');
  
 rekognition.indexFaces(params, function(err, data) {
   if (err) {console.log(err, err.stack);
res.render('friend_view',{msg:"An Error occurred while adding Member please check your internet connection and try again..!!"});


   } // an error occurred
   else     {console.log(data);

res.redirect('/view');

   }         // successful response
  
 });


}

  });

  
}

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
var isLoggedIn=false;
app.get("/login",function(req,res)
   {
isLoggedIn=false;
//does master data exists
frndLst.getUsersList('master',function(err,user){
if(err) throw err;
if(!user)
{
  //generat frn list
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
  var newUser=new frndLst({
    name:'master',
    list:[]
  });
  frndLst.createUserList(newUser,function(err,user){
if(err) throw err;
if(!user)
res.render('login_form',{msg:'some error occured'});
if(user)
res.render('login_form')



  });
}
if(user)
res.render('login_form');
});

  });
app.post("/login",function(req,res)
 {
    var username=req.body.username;
    var password=req.body.password;
    console.log(username,password);
    var data1
    var data2
    //read json file here
 fs.readFile('auth.json','utf8', (err, data) => {
  if (err) throw err;
  data=JSON.parse(data);
data1=data.username;
data2=data.password;
console.log(data1,username,data2,password)
  if(username==data1 && password==data2){
    console.log('matched');
    isLoggedIn=true;
    res.render('home',{title:'index-form'})
  }
                    
  else{
    isLoggedIn=false;
    res.render('login_form',{msg:'login failed'})
  }
//console.log('cjfxgfchgvhjv',data1,data2);

});

})
app.get('/',function(req,res){
  isLoggedIn=false;
res.render('index');
});
app.get('/logout',authcheck,function(req,res){
  isLoggedIn=false;
  //session.destroy();
res.render('login_form',{msg:'logged out successfully'});
});
app.get('/home',authcheck,function(req,res){
res.render('home',{title:'index-form'});
});
app.get('/view',authcheck,function(req,res){
  console.log('got it');

  frndLst.getUsersList('master',function(err,user){
      if(err)throw err;
      if(!user) res.render('friend_view',{msg:'database error contact administrator'});
      if(user){
      
              var userArray=user.list;
              var pathArray=[];
              var collName=[];
              var j=0;
              for (i=0;i<userArray.length;i++)
              { 
                j++;

                if(userArray.length==0)
                {

                 res.render('friend_view',{msg:userArray.length+'friends fetched',frndPath:pathArray,collName:collName,userArray:userArray}); 
                 break;
                }
                else{
                  
                frndData.getUserProfile(userArray[i],function(err,user){
                   if(err) throw err;
                   if(!user){
                    res.render('friend_view',{msg:'database error contact administrator'});


                   }  
                   if(user){
                    pathArray.push(user.name); 
                    pathArray.push(user.path); 
                  collName.push(user.collection_name);
                  
                                         }
                   if(collName.length==userArray.length)
                  {
                    console.log(userArray, pathArray ,collName);
                  res.render('friend_view',{msg:userArray.length+'friends fetched',frndPath:pathArray,collName:collName,userArray:userArray}); }

                  });
                
            

                }
                


                

              }
              


      }

  });
});
app.get('/addFrnd',authcheck,function(req,res){
res.render('add_form',{title:'index-form',path:'/images/frnd.png'});
});
app.post('/addFrnd',authcheck,function(req,res){
  //add 
  ssn=req.session;

  var image_id=ssn.filename;
  console.log(image_id);
  if(ssn.filename)
  {
    if(req.body.frndName)
    {
      indexFaces(image_id,req,res);
    }
  }
  else
    res.render('add_form',{msg:'Error:Invalid Field Values',path:'/images/frnd.png'});
  
  
});
app.get('/logs',authcheck,function(req,res){
res.render('logs',{title:'index-form'});
});
app.post('/uploadPhoto',authcheck,function(req,res){
	var ssn=req.session;

	upload(req,res,function(err){
		if(err) res.render('add_form',{msg: err});
		else{
			console.log(req.file);
			var file=req.file;
      if(req.file==undefined)
        res.render('add_form',{msg:'Error:no file selected',path:'/images/frnd.png'});
      else{
        var filepath=path.join(__dirname, 'public/uploads/')+file.filename;
            ssn.filename=file.filename;
            console.log(filepath);
            uploadToS3(filepath,ssn.filename,req,res);
            
console.log(ssn.filename);
      }
			
//res.render('friend_view',{msg:'face added to'+'collection-name'+'with id-'+'face-id',path:ssn.filename});

		}


	});

});
app.get('/user/about',authcheck,function(req,res){
res.render('about_user',{title:'index-form'});
});
app.get('/user/contact',authcheck,function(req,res){
res.render('contact_user',{title:'index-form'});
});
app.get('/remove',authcheck,function(req,res){
res.render('remove_temp',{title:'index-form'});
});
app.get('/about',function(req,res){
  isLoggedIn=false;
res.render('about',{title:'index-form'});
});
app.get('/contact',function(req,res){
  isLoggedIn=false;
res.render('contact',{title:'index-form'});
});
//=================routees protection
 function authcheck(req,res,next){
  if(isLoggedIn)
    return next();
  else
    res.redirect('/login');
}
