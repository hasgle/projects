/*var express=require('express');
var app=express();
var http=require('http');
var hbs=require('express-handlebars');
var multer  = require('multer');
var validator=require('express-validator');
var session=require('express-session');
//var nodemailer = require('nodemailer');


const path = require('path');
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

var server=http.createServer(app);
server.listen('80',function(err){

if(err) throw err;
else console.log('server started on port 80');

});
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper

  let transporter = nodemailer.createTransport({
    service:'gmail',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'iste.drishti@gmail.com', // generated ethereal user
      pass: 'DRISTI@1234' // generated ethereal password
    },tls:{
 rejectUnauthorized: false
}
  });

  



  let mailOptions = {
    from: 'iste.drishti@gmail.com', // sender address
    to: "shivam.gupta.111164@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    attachments: [  
       {   // file on disk as an attachment
            filename: 'capture.jpg',
            path: 'capture.jpg' // stream this file
        }   
        ] // html body
  };



app.get('/',function(req,res){
res.render('test');
});
app.get('/mailer',function(req,res){
	 transporter.sendMail(mailOptions,   
      function(err) 
      {   
        if (!err)
         { 
            console.log('Email send ...');
        } 
        else console.log("error occured");       
    });
	 
res.redirect('/');
});*/
   
   