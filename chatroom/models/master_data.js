var mongoose=require('mongoose');
var db=mongoose.connection;

var Schema=mongoose.Schema;
var proSchema=new Schema({
name:String,
 list:[String]

});
var master_data = mongoose.model('master_data', proSchema);
module.exports=master_data;

module.exports.createUser=function(newUser,callback){
	//console.log(newUser);
	newUser.save(callback);
   
}


module.exports.getUsersList=function(username,callback){
	//console.log(newUser);
	var queryObject={name:username};
 master_data.findOne(queryObject,callback);
   
}



module.exports.storeUser=function (usrname){

var queryObject={name:'master'};
 master_data.findOne(queryObject,function(err,user){

if(err) console.log('error in finding master');
else
{var usr_array=user.list;
usr_array.push(usrname);
user.list=usr_array;
user.save(function(err){
	if(err) console.log('error while saving master_data');
 else console.log('user succssfully updated');

});

}



 });


}
