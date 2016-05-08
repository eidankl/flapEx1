/**
 * Created by eidan on 02/05/2016.
 */

/*don't forget to declare external modules as dependencies at the []*/
var app = angular.module('flapperNews', ['ui.router']);

/*Start configuration*/
app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        //Init State's
        $stateProvider
            //Home State
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl',
                /*we don't want to show anything until we have the posts.
                * use resolve to make sure all posts come up*/
                //By using the resolve property in this way,
                //we are ensuring that anytime our home state is entered,
                //we will automatically query all posts from our backend
                //before the state actually finishes loading.
                resolve:{
                    postPromise: ['posts', function(posts){
                        return posts.getAll();
                    }]
                }
            })
            //Post State
            .state('posts', {
                url: '/posts/{id}',
                templateUrl: '/posts.html',
                controller: 'PostsCtrl',
                /*automatically load the full post object with comments
                 when we enter this state*/
                resolve: {
                    post: ['$stateParams', 'posts', function ($stateParams, posts) {
                        return posts.get($stateParams.id);
                    }]
                }
            });


        //OtherWise
        $urlRouterProvider.otherwise('home');
    }]);
/*End configuration*/

/*Start Factory = Service  = singleton for our posts */
//inject the http service at [] before function AND also as a parameter to the function
app.factory('posts', ['$http', function($http){
    var postsArray = {
        posts: []
    };

    /*methods to postsArray service*/

    //Get All Posts
    postsArray.getAll = function(){
        return $http.get('/posts').success(function(data){
            //make brand new copy of the data at postArray.posts
            //create a deep copy of the returned data.
            // This ensures that the $scope.posts variable in MainCtrl will also be updated,
            // ensuring the new values are reflect in our view.
            angular.copy(data, postsArray.posts);
        });
    };

    //Create New Posts
    postsArray.create = function(post){
        return $http.post('/posts',post).success(function(data){
            postsArray.posts.push(data);
        });
    };

    //UpLikes Posts
    postsArray.upLikes = function(post){
        return $http.put('/posts/' + post._id + '/upLikes').success(function(data) {
            post.likes += 1;
        });
    };

    //Get Single Post
    postsArray.get = function(id){
        return $http.get('/posts/' + id).then(function(res){
            return res.data;
        });
    };

    //Add Comment
    postsArray.addComment = function(id,comment){
        return $http.post('/posts/'+id +'/comments', comment);
    };

    //Up Likes Comment
    postsArray.upLikesComment = function(post, comment){
        /*  /posts/:post/comments/:comment/upLikes  */
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upLikes')
            .success(function(data){
                comment.likes += 1;
            });
    };

    return postsArray;

}]);
/*End Factory*/

/*Start Main Controller*/
app.controller('MainCtrl', [
    '$scope',
    'posts',
    function($scope,posts){

        $scope.posts = posts.posts;

        //Add Post
        $scope.addPost = function(){
            if($scope.title === ''){return;}
            posts.create({
                title: $scope.title,
                link: $scope.link,
            });
            //clean title and link
            $scope.title ='';
            $scope.link ='';
        };

        //Increment Likes
        $scope.incLikes = function(post){
            debugger;
            posts.upLikes(post);
        };

    }]);
/*End  Main Controller*/

/*Start Post Controller*/
app.controller('PostsCtrl', [
    '$scope',
    '$stateParams',
    'posts',
    'post',
    function($scope, $stateParams, posts, post){
        $scope.post = post;

        //Add Comment
        $scope.addComment = function(){
            if($scope.body === '') { return; }
            posts.addComment(post._id,{
                body: $scope.body,
                author: 'user',
            }).success(function(comment){
                $scope.post.comments.push(comment);
            });
            //clean comment body
            $scope.body = '';
        };

        //Increment Comment Likes
        $scope.incLikes = function(comment){
            posts.upLikesComment(post, comment);
        };
    }]);
/*End Post Controller*/