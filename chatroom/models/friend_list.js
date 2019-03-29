var mongoose=require('mongoose');
var db=mongoose.connection;
var userProfile=require('./profileData.js');
var master_data=require('./master_data.js');
var Schema=mongoose.Schema;
var proSchema=new Schema({

 user_name:{type:String},
 user_friends:[String]
});
var friend_data = mongoose.model('friend_data', proSchema);
module.exports=friend_data;

/*module.exports.createUserFriendlistAlgo=function(username,callback){
	
	master_data.getUsersList(username,function(err,user){
	if(err) console.log('error getting master data');
    else if(!user)
    	console.log('no user found');
    else
    {
var usersArray=user.list;
console.log(usersArray[2]);


    }
     


});


        var newUser=new friend_data({

        });
        newUser.save(callback);
   
}*/


module.exports.createUserFriendlist=function(username,callback){
	



        var newUser=new friend_data({
        	user_name:username,
        	user_friends:["Admin"]

        });
        newUser.save(callback);
   
}
module.exports.getUserFriendlist=function(username,callback){
 var queryObject={user_name:username};
 friend_data.findOne(queryObject,callback);

}

module.exports.editUserFriendlist=function(username,callback){
 var queryObject={user_name:username};
 friend_data.findOne(queryObject,callback);

}

