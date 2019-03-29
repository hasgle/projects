var mongoose=require('mongoose');
var db=mongoose.connection;

var Schema=mongoose.Schema;
var proSchema=new Schema({

name:{type:String},
handle_name:{type:String},
 profilePicture:{type:String},
 about:{type:String},
status:{type:String},
hobbies:[String]
});
var userProfile = mongoose.model('userProfile', proSchema);
module.exports=userProfile;

module.exports.createUserProfile=function(newUser,callback){
	
        // Store hash in your password DB.
     
        newUser.save(callback);
   
}





module.exports.editUserProfile=function (proObject,callback){
var username=proObject.name;
var queryObject={name: username};
 userProfile.findOne(queryObject,function(err,user){

if(err) console.log('error in finding profile data');
else if(user)
{
user.handle_name=proObject.handle_name;
user.profilePicture=proObject.profilePicture;
user.about=proObject.about;
user.status=proObject.status;
user.hobbies=proObject.hobbies;
user.save(callback);

}
else
	console.log('no usr found');


 });


}


module.exports.getUserProfile=function (username,callback){

var queryObject={name:username};
 userProfile.findOne(queryObject,callback);


}


module.exports.getUserByHandle=function (handle_name,callback){

var queryObject={name:handle_name};
 userProfile.findOne(queryObject,callback);


}






   



