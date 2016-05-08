
var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
    title: String,
    link: String,
    likes: {type: Number, default: 0},
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    author: String
});

/*Extend The PostSchema With Methods */

//add like (need a route for this at Router-->index.js
PostSchema.methods.upLikes = function(cb) {
    this.likes += 1;
    //save to db
    this.save(cb);
};

mongoose.model('Post', PostSchema);
