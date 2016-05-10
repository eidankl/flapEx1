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
            })
            //Login State
            .state('login',{
                url: '/login',
                templateUrl: '/login.html',
                controller: 'AuthCtrl',
                //make sure when this state is entered  to check out if the user is logged in or not by using the auth factory
                onEnter: ['$state', 'auth', function($state, auth){
                    if(auth.isLoggedIn()){
                        //user is logged in so go to home state
                        $state.go('home');
                    }
                }]
            })
            //Register State
            .state('register',{
                url: '/register',
                templateUrl: '/register.html',
                controller: 'AuthCtrl',
                //make sure when this state is entered  to check out if the user is logged in or not by using the auth factory
                onEnter: ['$state', 'auth', function($state, auth){
                    if(auth.isLoggedIn()){
                        //user is logged in so go to home state
                        $state.go('home');
                    }
                }]
            });


        //OtherWise
        $urlRouterProvider.otherwise('home');
    }]);
/*End configuration*/

/*Start Factory's = Service  = singleton for our posts */

//initial auth factory. We'll need to inject $http for interfacing with our server,
// and $window for interfacing with localStorage.
app.factory('auth', ['$http', '$window', function($http, $window){
    //create an empty object
    var auth = {};

    /*Start Wrapper Methods*/

    //Save Token to Local Storage
    auth.saveToken = function(token){
        //access to localStorage [key: 'value'] and create unique key = flapper-news-token
        $window.localStorage['flapper-news-token'] = token;
    };

    //Get Token from Local Storage
    auth.getToken = function(){
        //access to localStorage [key: 'value'] and get unique key = flapper-news-token
        return $window.localStorage['flapper-news-token'];
    };

    //Check If User Logged In - return a boolean value for if the user is logged i
    auth.isLoggedIn = function(){
        var token = auth.getToken();

        if(token){
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            //check the payload to see if the token has expired
            return payload.expiration > Date.now() / 1000;
        }
        else{
            //can not find the token
            return false;
        }
    };

    //Get The Current User Name returns the username of the user that's logged in
    auth.currentUser = function(){
        if(auth.isLoggedIn()){
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    };

    //Register = Create a register function that posts a user to our /register route and saves the token returned
    auth.register = function(user){
        debugger;
        return $http.post('/register', user).success(function(data){
            //save the token
            debugger;
            auth.saveToken(data.token);
        });
    };

    //Login - Create a login function that posts a user to our /login route and saves the token returned.
    auth.logIn = function(user){
        return $http.post('/login', user).success(function(data){
            auth.saveToken(data.token);
        });
    };

    //Log Out - Create a logout function that removes the user's token from localStorage, logging the user out.
    auth.logOut = function(){
        $window.localStorage.removeItem('flapper-news-token');
    };
    /*End Wrapper Methods*/
    return auth;
}]);


//inject the http service at [] before function AND also as a parameter to the function
app.factory('posts', ['$http', 'auth', function($http, auth){
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
        return $http.post('/posts',post, {
            headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).success(function(data){
            postsArray.posts.push(data);
        });
    };

    //UpLikes Posts
    postsArray.upLikes = function(post){
        return $http.put('/posts/' + post._id + '/upLikes', {
            headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).success(function(data) {
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
        return $http.post('/posts/'+id +'/comments', comment, {
            headers: {Authorization: 'Bearer ' + auth.getToken()}
        });
    };

    //Up Likes Comment
    postsArray.upLikesComment = function(post, comment){
        /*  /posts/:post/comments/:comment/upLikes  */
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upLikes', {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).success(function(data){
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
    'auth',
    function($scope,posts, auth){

        $scope.posts = posts.posts;
        $scope.isLoggedIn = auth.isLoggedIn

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
    'posts',
    'post',
    'auth',
    function($scope, posts, post, auth){
        $scope.post = post;
        $scope.isLoggedIn = auth.isLoggedIn;

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

/*Start Authentication Controller*/
app.controller('AuthCtrl', [
    '$scope',
    '$state',
    'auth',
    function($scope, $state, auth){
        //empty user scope
        $scope.user = {};

        $scope.register = function(){
            auth.register($scope.user).error(function(error){
                $scope.error = error;
            }).then(function(){
                $state.go('home');
            });
        };

        $scope.logIn = function(){
            auth.logIn($scope.user).error(function(error){
                $scope.error = error;
            }).then(function(){
                $state.go('home');
            });
        };
    }]);
/*End Authentication Controller*/

/*Start Navbar Controller - exposes the isLoggedIn, currentUser, and logOut methods from our auth factory*/
app.controller('NavCtrl', [
    '$scope',
    'auth',
    function($scope, auth){
        //login
        $scope.isLoggedIn = auth.isLoggedIn();
        //current user
        $scope.currentUser = auth.currentUser();
        //logout
        $scope.logOut = auth.logOut();
    }]);
/*End Navbar Controller*/