var express=require('express');
var app=express();
var https=require('https');
var fs=require('fs');
var path = require('path');
var hbs=require('express-handlebars');
var cookieParser = require('cookie-parser');
//============================================================database file inclusion=====================================================
var User=require('../models/userdata.js');
var userProfile=require('../models/profileData.js');
var master_data=require('../models/master_data.js');
var addFriend=require('../models/friend_list.js');
var msgData=require('../models/userMessages.js');
//=============================================================end=================================================================
var flash=require('connect-flash');
//===============================================input validators and session inclusion======================
var validator=require('express-validator');
var session=require('express-session');

//===============================================end
const SendOtp = require('sendotp');
const sendOtp = new SendOtp('233184AEVUX39raFpY5b7de800', ' your OTP is {{otp}}, please do not share it with anybody ~from:Ktinder ');

//==================================multer for form upload management========
var multer  = require('multer');
//==================================end===============

//=========================dtatbase
var mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/chatroom', { useNewUrlParser: true });
var db=mongoose.connection;
//==================================end

//============================passport for sighnup and login===========
var passport=require('passport');
var LocalStrategy=require('passport-local').Strategy;
//==========================================end






var router=express.Router();

//=======================================view engine=================
app.engine('hbs',hbs({extname:'hbs' ,defaultLayout :'layout' , layoutsDir :__dirname+'/views'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};

//============================================end









//=======================================express parameters initialisation and certain modules initialisation as well
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret:'hasgle',
  resave: false,
  saveUninitialized: false
})); 

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(function(req,res,next){
	res.locals.success_msg=req.flash('success_msg');
	res.locals.error_msg=req.flash('error_msg');
	
	next();
})


app.use(validator());
app.use(express.static(path.join(__dirname, 'public')));


//===========================end=====================



//=============================================server initiators===================
                 //===========socket.io and https server================//



var connectedUsers = {};
var onlineUsers=[];         // crating array to store online usrs



var server=https.createServer(options,app);
var io=require('socket.io')(server);
server.listen('443',function(err){

if(err) console.log('error ocurred!!');
else console.log('server started at https://localhost:443');


});
io.on('connection',function(socket){
	var usid='default';
	  //contains the name of connected user
    
	
	connectedUsers[ssn.userid] = socket;

	socket.val=ssn.userid;	
	onlineUsers.push(socket.val); //addding user to online user list
	console.log(socket.val +'socket started');
console.log(ssn.userid+' is connected ');
console.log(onlineUsers);
//==================================eevents to recieve msg eevetns and storing aan passing it to gatabase====================
socket.on('msg',function(data){
	var uid=data.username;
    var msg=data.message;
console.log('msg from'+uid+':'+msg);
if(uid=="chatroom"){
socket.broadcast.emit('general_msg',{
     message:msg ,
	from:socket.val

});
console.log('mssage from chatroom');
}
else{

	if(connectedUsers[uid])

{
var isFrnd=false;
     //get uid friend list
addFriend.getUserFriendlist(uid,function(err,user){
if(err) console.log('error finding user frind list');
	var friendslst;
friendslst=user.user_friends;
console.log(friendslst);
console.log(user.user_friends);
console.log(friendslst.indexOf(socket.val));
 if(friendslst.indexOf(socket.val)>=0)
 	{


 	connectedUsers[uid].emit('out_msg',{ 
	message:msg ,
	from:socket.val//ssn.userid
});

console.log('condition satisfied');

 	}
 else 
 	{
connectedUsers[uid].emit('bin_msg',{ 
	message:msg ,
	from:socket.val//ssn.userid
});


 	}


});


     //if socket.vaal exist in friend list mit out msg else emit bin_msg event     

    


	console.log(uid+'is online');

socket.emit('success_callback','user online');

}
else {

	msgData.storeMessage(socket.val,uid,msg,function(err,user){

if(err) throw err;
else if(!user) console.log('no user data found for storage');
else console.log(user);
});
	console.log(uid+'is offline');
socket.emit('callback','user offline');

}

}


});

socket.on('getOnlineUsers',function(data){
var onlineFrnds=[];
onlineFrnds.push(onlineUsers.indexOf(data.friend1));
onlineFrnds.push(onlineUsers.indexOf(data.friend2));
onlineFrnds.push(onlineUsers.indexOf(data.friend3));
onlineFrnds.push(onlineUsers.indexOf(data.friend4));
onlineFrnds.push(onlineUsers.indexOf(data.friend5));
if(onlineFrnds.length=='5')
{
	socket.emit('onlineFrnds',onlineFrnds);
	
}
else
console.log('error occured in getting onlin frnds of  :'+socket.val);

io.emit('onlineUsers',onlineUsers.length);


})


//=================================================search evnt
socket.on('getcontact',function(data){
 console.log(data);

    userProfile.getUserByHandle(data,function(err,user){

if(err) console.log('error in gtting userprofile');
else if(!user || data==socket.val)
{
socket.emit('return_user',{
	username:null,
name:null,
about:null

});

}
else
{ 
console.log(user);	
socket.emit('return_user',{
 username:user.name,
 name:user.handle_name,
 about:user.about

});

}



    });

}); 


//=====================================update friend list event===================

socket.on('updateFriendList',function(data){

var friendArray=[data.friend1,data.friend2,data.friend3,data.friend4,data.friend5];

console.log(friendArray);
console.log(socket.val);
addFriend.editUserFriendlist(socket.val,function(err,user){
if(err) console.log('error finding user frind list');
	
user.user_friends=friendArray;
user.save(function(err,user){
if(err) console.log('error in saving data');
else
	console.log('user frindlist saved successfully');

});



});

});

//======================================================delete friend event=======================================================

socket.on('deleteFriend',function(data){

addFriend.editUserFriendlist(socket.val,function(err,user){
if(err) console.log('error finding user frind list');
var friendArray=user.user_friends;
console.log(friendArray);
friendArray.splice(friendArray.indexOf(data),1);
console.log(friendArray);	
user.user_friends=friendArray;
user.save(function(err,user){
if(err) console.log('error in saving data');
else
	socket.emit('delResponse','friend removed ');

});



});

});

socket.on('getMessages',function(data){
	console.log('stored messags requsted');

msgData.getUserMessages(socket.val,function(err,user){
     if(err) throw err;
     else if(!user)
     	console.log('connot find useer');
     else
     	{socket.emit('return_messages',user.message);
console.log('message sent'+user.message);
}

       });

});
socket.on('clearMessages',function(data){
msgData.clearMessages(socket.val,function(err,user){
     if(err) throw err;
     else if(!user)
     	console.log('connot find useer');
     else
     	console.log('message data cleared'+socket.val);


       });

});


//==================================================================end=============
socket.on('disconnect',function(err){
 connectedUsers[socket.val] ="";
	 onlineUsers.splice(onlineUsers.indexOf(socket.val), 1);
	 console.log(onlineUsers);
 console.log(socket.val+'is disconected')


});





});


















//===============================================end ===============================================\\

var ispassCorrect=true;
//var newUser;
//var visited=false;
var ssn={userid:'admin'}; //flag to set otp routes access!!!!!!!!!!

//========================================variables====================================
app.get('/',function(req,res){
	ssn=req.session;
	ssn.visited=false; 
	req.session.destroy();



	res.send('welcome to ktinder');
});


app.get('/chat',authcheck,function(req,res){
ssn=req.session;
  	ssn.userid=req.user.name;
//var hasFriends=false;

addFriend.getUserFriendlist(ssn.userid,function(err,user){
if(err) console.log('error finding user frind list');
	
else if(!user)
	res.redirect('/uploadProfile');
else
{


	var friendArray;
friendArray=user.user_friends;
console.log('frind list from database'+user.user_friends);
var noOfOnlineusers=onlineUsers.length;
 console.log('frind list of'+ssn.userid+'for this session is'+friendArray);


	res.render('home_temp',{username: ssn.userid ,friendList:friendArray, friend1:"/images/img1.jpg",friend2:"/images/img2.png" ,friend3:"/images/img3.png",friend4:"/images/img4.jpg" ,friend5:"/images/img5.jpg",chatroom_img:"https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto/gigs/2748338/original/bollywood_chatroom_logo/install-a-professional-chatroom-on-your-website-using-html.jpg",profile_img:"/images/shriKrishna.jpg"});
;


}


});








//===========getting total no of online users

});




//--------------------------------------------------------

app.get('/login', function(req, res, next) {
	
	ssn=req.session;
	ssn.visited=false; // setting flag to avoid access to otp routes
	
  if(!ispassCorrect)
{
	req.flash('error_msg','Please enter a correct password');
	res.render('login',{Token:req.flash('error_msg')});
}
else
  res.render('login' );
});


passport.use(new LocalStrategy(
  function(username, password, done) {
   User.findUserByUsername(username,function(err,user){
if(err) {
	console.log('no userfound');
	throw err;
}
if(!user){
console.log('user empty');
	return done(null,false);
} 
User.checkPassword(password,user.password,function(err,isMatch){
	if(err) throw err;
	if(isMatch){
		return done(null,user);
	}else{
		
       ispassCorrect=null;
		return done(null,false,{message:'invalid password'})
	}
});
   });
  }
));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getById(id, function(err, user) {
    done(err, user);
  });
});
app.post('/login', passport.authenticate('local',{successRedirect:'/entry' ,failureRedirect:'/login'}),function(req, res, next) {
	  
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
//get user mobile number
//send otp to number

    res.redirect('/entry');
});

app.get('/signup', function(req, res, next) {
	req.session.destroy();
  res.render('register');
});
app.post('/signup', function(req, res, next) {

	//curent form validation works on nesting in stages first email is validated then comes captcha and then password.!!!!!!!!!!!!!!
	
ssn=req.session;

var username=req.body.username ;
var rollno=req.body.rollno;
var mobno=req.body.mobno;
var email=req.body.email;
var password=req.body.password;
var password2 =req.body.password2;
console.log(username);
console.log(rollno);
console.log(mobno);
console.log(email);
console.log(password);



var bool=false;//custom validators needs to be implemented here.........!!!!!!!!!!!!!!!!!!!!!!

//console.log(req.session.captcha);
/*var bool=false;
if(capData==req.session.captcha)
	{bool=true;

	}
else
	{bool=false;
	req.flash('error_msg','invalid Captcha code') ;
res.redirect('/register');}
console.log(bool);*/

req.check('username' ,'username must be  0-20 characters long').isLength({min:0 ,max:20});
req.check('rollno','invalid rollno').isLength({min:0,max:10});
req.check('rollno','invalid rollno').isInt();
req.check('email','enter a valid email').isEmail();
req.check('mobno','enter a valid mobile no').isInt();
req.check('password','password must b 0-20 characters long').isLength({min:0,max:20});
req.check('password2' ,'password do not match').equals(req.body.password);

User.findUserByUsername(username,function(err,user){
if(err) throw err;
if(user){
    
    console.log('user is already created');
	req.flash('error_msg','username already taken');
	res.redirect('/signup');
}

else if(!user){
 console.log('user is now created')
	User.findUserByEmail(email,function(err,user){
if(err) throw err;
if(user) {
	console.log('email already exists');
	req.flash('error_msg','Email already exists') ;

res.redirect('/signup');
}
else if(!user){
errors=req.validationErrors();
console.log(errors);
if(!errors ){
	ssn.username=username;
ssn.rollno=rollno;
 ssn.mobno=mobno;
ssn.email=email;
ssn.password=password;
	  
	
	
	//req.flash('success_msg','Your are registered Ktinder..!!!') ;
	console.log(mobno);

		

	sendOTP(ssn.mobno);
	ssn.visited=true; // flags to allow access to otp routes
	res.redirect('/otp_verification');

}
else

{console.log(req.flash('error_msg'));
	res.render('register',{errors:errors ,flashErrors:req.flash('error_message')});
	
}
	}




});

}


});


});
//var tmpuserename='hasgle';
 app.get('/Profile',authcheck,function(req,res){

//==================fetching profil of user from database
ssn=req.session;
 
userProfile.getUserProfile(ssn.userid,function(err,user){

if(err) console.log('error in finding user profile');
else if(user){

	var obj={};
	obj["name"]=user.name;
	obj["handle_name"]=user.handle_name;
	obj["profilePicture"]=user.profilePicture;
	obj["about"]=user.about;
	obj["status"]=user.status;
	obj["hobbies"]=user.hobbies;

	
res.render('profile',{username:ssn.userid,profile:obj});


}
else
res.redirect('/login');


});


 	
 });
 app.get('/uploadProfile',authcheck,function(req,res,next){



 	res.render('upprofile',{username:req.user.name,msg:'upload your profile to connect to Ktinder network'});
 })

//route for rcieving dit profile rqusts and updating user profile
app.post('/uploadProfile',authcheck,function(req,res,next){
console.log(req.body);




var name=req.user.name;
var handle_name=req.body.handle_name;
 var profilePicture='/images/uploads'+req.body.profilePicture;
 var about=req.body.about;
var status=req.body.status;
var hobbies=req.body.hobby; 

var newUser={

	name: name,
handle_name:handle_name,
 profilePicture:profilePicture,
 about:about,
status:status,
hobbies:hobbies


};
userProfile.editUserProfile(newUser,function(err){
	if(err) {console.log('error while saving profile_data');
res.redirect('/uploadProfile');

}
 else {console.log('user profile succssfully updated');

//chck if friendlist exist
//if not then create frind list and messge data
//else just rdirect to /profile
addFriend.getUserFriendlist(name,function(err,user){

if(err) console.log('error in getting frind list');
else if(!user)
{

 addFriend.createUserFriendlist(name,function(err,user){

if(err) console.log('error creating user friend_list');
else if(! user){
console.log('no user crated');
res.redirect('/uploadProfile');

}
else 
	{console.log('user friend_list created');
console.log(user);
  msgData.createUserData(name,function(err,user){

if(err) console.log('error creating user msg data');

else if(!user){
console.log('no user  msg created');
res.redirect('/uploadProfile');

}

else 
	{console.log('user msg data created');
console.log(user);
res.redirect('/profile');}


     });}

     });
}

else
res.redirect('/profile');


  });    

   

	

}

});



});


  app.get('/entry',authcheck,function(req,res,next){
  	ssn=req.session;

  	ssn.userid=req.user.name
  	 if(connectedUsers[ssn.userid])
  	res.redirect('/login');
  else
 	res.render('firstpage',{username: ssn.userid});
 })


  //=============================================otp route==========================

 app.get('/otp_verification',signupcheck,function(req,res){



res.render('otp');


});
app.get('/resendOtp',signupcheck,function(req,res){
	ssn=req.session;
var userno=ssn.mobno;
sendOTP(userno);
res.render('otp',{msg:'otp has been sent'});


});
app.post('/otp_verification',signupcheck,function(req,res){
ssn=req.session;
//prse otp from request 
var otp=req.body.otp;

//parse user from request

//verify otp
sendOtp.verify(ssn.mobno,otp, function (error, data) {
	ssn=req.session;
  console.log(data); // data object with keys 'message' and 'type'
  if(data.type == 'success') {
  	console.log('OTP verified successfully');
var newUser= new User({name:ssn.username,
		             rollno:ssn.rollno,
		              mobileNumber: ssn.mobno,
		              email:ssn.email,
	                  password:ssn.password});
console.log(newUser);

//tmporary variable fro holding neew useer
  	User.createUser(newUser,function(err,user){
		if(err) throw err;
		console.log(user);
		

	});
	console.log('============================user created=====================!!!!!!!!!!!!!!!!!');




//==============making dfault profil of user=============
var name=ssn.username;
var handle_name=ssn.username;
 var profilePicture="/images/default.jpg";
 var about="Anonymous";
var status="Anonymous";
var hobbies=['anonymous']; 

var newUser=new userProfile({

	name: name,
handle_name:handle_name,
 profilePicture:profilePicture,
 about:about,
status:status,
hobbies:hobbies


});
userProfile.createUserProfile(newUser,function(err,user){


if(err) console.log('error occurd while creating usr profile');
else 
{
	master_data.storeUser(ssn.username);



  	res.redirect('/login');
}



});






//=============================saving usr to master_data

  }
  if(data.type == 'error'){
  	console.log('OTP verification failed');
  	res.render('otp',{msg:'incorrect otp'});

} 

});

});

//======================================end====================================

//=====================================routes protection==============================
  function authcheck(req,res,next){
	if(req.isAuthenticated())
		return next();
	else
		res.redirect('/login');
}

function signupcheck(req,res,next){  
ssn=req.session;      //function to check access to otp routes
	if(ssn.visited)
		return next();
	else
		res.redirect('/signup');
}


   //=================================snd and verify otp functions=====================
function sendOTP(userNO){
	console.log('function waas called');
console.log(userNO);
sendOtp.send(userNO, "hasgle", function (error, data) {
  console.log(data);
});

}
app.get('/update1234',function(req,res){

var newUser={

	name: "test",
handle_name:"handle_name",
 profilePicture:"profilePicture",
 about:"about",
status:"status",
hobbies:["hobbies"]


};
userProfile.editUserProfile(newUser,function(err){
	if(err) {console.log('error while saving profile_data');
res.send('test useer profil not added...!!!!!!!!');

}
 else {console.log('user profile succssfully updated');
res.send('test useer profile added...!!!!!!!!');

}

});






});


app.get('/initiate1234',function(req,res){

console.log('rques recieved');


var data=new master_data({

name:"master",
list:["test"]

});
master_data.createUser(data,function(err,user)
	{
if(err) console.log('error occured while creating mastr database');
else
 console.log('master data created');

	});
	
var newUser=new userProfile({

	name: "test",
handle_name:"testhandle_name",
 profilePicture:"testprofilePicture",
 about:"tstabout",
status:"teststatus",
hobbies:["tsthobbies"]


});
userProfile.createUserProfile(newUser,function(err,user){


if(err) console.log('error occurd while creating usr profile');
else 
{
	master_data.storeUser(ssn.username);



 
}



});
 	res.send('/login');

});


app.get('/logout',function(req,res){

req.session.destroy();
res.redirect('/login');


});
/*function verifyOtp(userNo,otp)
{console.log(userNo);
console.log(otp);

	sendOtp.verify(userNo,otp, function (error, data,req,res) {
  console.log(data); // data object with keys 'message' and 'type'
  if(data.type == 'success') {
  	console.log('OTP verified successfully');
  	res.redirect('/login');


}
  if(data.type == 'error'){
  	console.log('OTP verification failed');
  	res.render('otp_conf',{msg:'renter otp'});
otpStatus=false;
} 
});
	return otpStatus;
}*/