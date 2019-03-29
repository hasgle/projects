var mongoose=require('mongoose');
var db=mongoose.connection;

var Schema=mongoose.Schema;
var proSchema=new Schema({
	name:String,
 list:[String]

});
var frndLst = mongoose.model('frndLst', proSchema);
module.exports=frndLst;

module.exports.createUserList=function(newUser,callback){


	//console.log(newUser);
	
	newUser.save(callback);
   
}


module.exports.getUsersList=function(username,callback){
	//console.log(newUser);
	var queryObject={name:username};
 frndLst.findOne(queryObject,callback);
   
}



module.exports.storeUser=function (username){

var queryObject={name:'master'};
 frndLst.findOne(queryObject,function(err,user){

if(err) console.log('error in finding master');
else
{var usr_array=user.list;
usr_array.push(username);
user.list=usr_array;
user.save(function(err){
	if(err) console.log('error while saving master_data');
 else console.log('user succssfully updated');

});

}



 });


}
module.exports.deleteUser=function (username,callback){

var queryObject={name:'master'};
frnd_prof.findOne(queryObject,function(err,user){

if(err)throw err;
if(user)
{
	if(user.list.indexOf(username)){
    
    user.list.splice(indexOf(username),1);
    user.save(callback);



	}
}


});


}
