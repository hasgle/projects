var mongoose=require('mongoose');
var db=mongoose.connection;
var bcrypt=require('bcryptjs');
var saltRounds=10;
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  name: {type: String},
  rollno:{type:String},
 mobileNumber:{type:String},
  email: {type: String},
  password:{type: String}
});

var User = mongoose.model('User', userSchema);


module.exports = User;
module.exports.createUser=function(newUser,callback){
	console.log(newUser);
	console.log(newUser.password);
	bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
        // Store hash in your password DB.
        newUser.password= hash;
        newUser.save(callback);
    });
});
}
module.exports.findUserByUsername=function(username,callback){
 var queryObject={name:username};
 User.findOne(queryObject,callback);

}
module.exports.findUserByEmail=function(Email,callback){
 var queryObject={email:Email};
 User.findOne(queryObject,callback);

}
module.exports.getById=function(id,callback){

 User.findById(id,callback);

}
module.exports.checkPassword=function(password1,hash,callback){
 bcrypt.compare(password1, hash,function(err,isMatch){
if(err) throw err;
callback(null,isMatch);
 }
)};