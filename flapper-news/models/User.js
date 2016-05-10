/**
 * Created by eidan on 08/05/2016.
 */
var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
    username: {type: String, lowercase: true, unique: true},
    //Hash The Password + Salt
    hash: String,
    //Add Some Extra Characters To The Password That User Give (every user has its own salt)
    salt: String
});

/*Extend The UserSchema With Methods */

//Set Password - accepts a password then generates a salt and associated password hash
UserSchema.method.setPassword = function(password){
    //generate the salt for the hash (random string)
    this.salt = crypto.randomBytes(16).toString('hex');
    //debugger;
    //calc the hash  ( pbkdf2Sync(password, salt, number of iterators, key length)  )
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

//Check If The Password Is Valid - accepts a password and compares it to the hash stored, returning a boolean
UserSchema.method.validPassword = function(password){
    //create an hash on the flight
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash === hash;
};

//Generate JWT - instance method for generating a JWT token for the user
UserSchema.method.genrateJWT = function(){
    //set expiration to 60 days
    var today = new Date();
    var expiration = new Date(today);
    expiration.setDate(today.getDate() + 60);

    return jwt.sign({
        _id: this._id,
        username: this.username,
        expiration: parseInt(expiration.getTime() / 1000),
    },'SECRET');
};





mongoose.model('User', UserSchema);
