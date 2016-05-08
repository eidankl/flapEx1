/**
 * Created by eidan on 02/05/2016.
 */

var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
    body: String,
    author: String,
    likes: {type: Number, default: 0},
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
});


/*Extend The PostSchema With Methods */

//add like (need a route for this at Router-->index.js
CommentSchema.methods.upLikes = function(cb) {
    this.likes += 1;
    //save to db
    this.save(cb);
};

mongoose.model('Comment', CommentSchema);