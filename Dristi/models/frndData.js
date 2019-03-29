var mongoose=require('mongoose');
var mongoose=require('mongoose');
var db=mongoose.connection;

var Schema=mongoose.Schema;
var proSchema=new Schema({

name:String,
 path:String,
collection_name:String


});
var frnd_prof = mongoose.model('frnd_prof', proSchema);
module.exports=frnd_prof;

module.exports.createUserProfile=function(newUser,callback){
	
        // Store hash in your password DB.
     
        newUser.save(callback);
   
}








module.exports.getUserProfile=function (username,callback){

var queryObject={name:username};
 frnd_prof.findOne(queryObject,callback);


}


module.exports.deleteUserProfile=function (username,callback){

var queryObject={name:username};
frnd_prof.removeOne(queryObject,callback);


}






   



