var mongoose=require('mongoose');
var db=mongoose.connection;

var Schema=mongoose.Schema;
var msgSchema=new Schema({
name: String,
message:[String]

});
var msg_data = mongoose.model('msg_data', msgSchema);
module.exports=msg_data;
module.exports.createUserData=function(username,callback){
	



	  var newUser=new msg_data({
        	name:username,
        	message:["Admin:helloAdmin"]

        });
        newUser.save(callback);
   
   

}

module.exports.clearMessages=function(username,callback){
	var queryObject={name:username};
	 msg_data.findOne(queryObject,function(err,user){

if(err) throw err;
else if(!user)
console.log('no user data found for storage');
else{
var msgArray=[];
user.message=msgArray
user.save(callback);
}



 });
   

}

module.exports.storeMessage=function(sender,username,msg,callback){
 var queryObject={name:username};
 msg_data.findOne(queryObject,function(err,user){

if(err) throw err;
else if(!user)
console.log('no user data found for storage');
else{
var msgArray=user.message;
var data=sender+':'+msg;
msgArray.push(data);
user.message=msgArray
user.save(callback);
}



 });

}
module.exports.getUserMessages=function (username,callback){

var queryObject={name:username};
 msg_data.findOne(queryObject,callback);


}