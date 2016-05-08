var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

//add dependencies comment module, post module and mongoose for access to db
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

/* get route for all posts - view all posts = GET /posts - return a list of posts and associated metadata*/
router.get('/posts', function(req, res, next) {
  //find() return all the data (posts) in db
  Post.find(function(err, posts){
    if(err){
      return next(err);
    }
    //return a JSON list containing all posts - send the retrieved posts back to the client.
    res.json(posts);
  });
});

/* POST request to the server - posting data to the server - Add a new post(posting post) = POST /posts - create a new post*/
router.post('/posts/', function(req, res, next) {
  //create a new post object in memory before saving it to the database
  var post = new Post(req.body);
  //save the post to db
  post.save(function(err, post){
    if(err){
      return next(err);
    }
    //response with single post
    res.json(post);
  });
});

/*Start Pre Loading Objects ( use Express's param() function to automatically load an object) */

/*Pre-load post objects on routes with ':post'*/
//create router.param for post (we can use Express's param() function to automatically load an object)
router.param('post', function(req, res, next, id){
  //query the db for the post with specific id
  var query = Post.findById(id);

  //execute the query - will return error or the actual post
  query.exec(function(err,post){
    if(err){
      return next(err);
    }
    if(!post){
      //if there is no post create new error
      return next(new Error('Cannot find post'));
    }
    //if the post  is there we save the post
    req.post = post;
    return next();
  });
  /*Now when we define a route URL with :post in it,
   this function will be run first.
   Assuming the :post parameter contains an ID,
   our function will retrieve the post object from the database
   and attach it to the req object after which the route handler function will be called.*/
});

/* Pre-load comment objects on routes with ':comment'*/
//create router.param for comment
router.param('comment', function(req, res, next, id){
  //query the db for the comment with specific id
  var query = Comment.findById(id);

  //execute the query - will return error or the actual post
  query.exec(function(err,comment){
    if(err){
      return next(err);
    }
    if(!comment){
      //if there is no post create new error
      return next(new Error('Cannot find comment'));
    }
    //if the comment  is there we save the comment
    req.comment = comment;
    return next();
  });
});

/*End Pre Loading Objects */


/*when we define a route URL with :post in it, this function will be run first.
Assuming the :post parameter contains an ID,
our function will retrieve the post object from the database
 and attach it to the req object after which the route handler function will be called. */

/*Route for returning a single post  - GET /posts/:id - return an individual post with associated comments*/
//return a post
router.get('/posts/:post', function (req, res) {
  //Use the populate() function to retrieve comments along with posts: (automatically load all the comments associated with that particular post.)
  req.post.populate('comments', function(err,post){
    // in tha callback we response post (take the response and spell out to json of the post)
    res.json(post);
  });
});

/*upLikes a post (update the db) = PUT /posts/:id/like - like a post, notice we use the post ID in the URL
* route for upLikes from PostSchema*/
router.put('/posts/:post/upLikes', function(req, res, next){
  //like the request post
  req.post.upLikes(function(err, post){
    if(err){
      return next(err);
    }
    //return as a json back to the client
    res.json(post);
  });
});

/*upLikes a comment =  PUT /posts/:id/comments/:id/like - like a comment
* route for upLikes from CommentsSchema*/
router.put('/posts/:post/comments/:comment/upLikes', function(req, res, next){
  //like the request post
  req.comment.upLikes(function(err, comment){
    if(err){
      return next(err);
    }
    //return as a json back to the client
    res.json(comment);
  });
});


/*create a new comment =  POST /posts/:id/comments - add a new comment to a post by ID
* */
//route for a comments on a given post, the ability to create m comment
router.post('/posts/:post/comments', function(req, res, next){
  //create a comment variable that create new mongoose model from our request
  var comment = new Comment(req.body);
  comment.post = req.post;
  //save the comment
  comment.save(function(err,comment){
    if(err){
      return next(err);
    }
    //add to post
    req.post.comments.push(comment);
    //save to db
    req.post.save(function(err, post){
      if(err){
        return next(err);
      }
      //return the json of the new comment
      res.json(comment);
    });
  });
});



/*Export Router*/
module.exports = router;






