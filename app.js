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
        //Init Sstate's
        $stateProvider
            //Home State
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl'
            })
            //Post State
            .state('posts', {
                url: '/posts/{id}',
                templateUrl: '/posts.html',
                controller: 'PostsCtrl'
            });


        //OtherWise
        $urlRouterProvider.otherwise('home');
    }]);
/*End configuration*/

/*Start Factory = service  = singleton for our posts */
app.factory('posts', [function(){
    var postsArray = {
        posts: []
    };
    return postsArray;
}]);
/*End Factory*/

/*Start Main Controller*/
app.controller('MainCtrl', [
    '$scope',
    'posts',
    function($scope,posts){
        $scope.test = 'Hello world!';
        $scope.posts = posts.posts;

        //Add Post
        $scope.addPost = function(){
            if($scope.title === ''){return;}
            $scope.posts.push({
                title: $scope.title,
                link: $scope.link,
                likes: 0,
                comments:[
                    {author: 'Joe', body: 'Cool post!', likes: 0},
                    {author: 'Bob', body: 'Great idea but everything is wrong!', likes: 0}
                ]
            });
            //clean title and link
            $scope.title ='';
            $scope.link ='';
        };

        //Increment Likes
        $scope.incLikes = function(post){
            post.likes += 1;
        }
    }]);
/*End  Main Controller*/

/*Start Post Controller*/
app.controller('PostsCtrl', [
    '$scope',
    '$stateParams',
    'posts',
    function($scope, $stateParams, posts){
        $scope.post = posts.posts[$stateParams.id];

        //Increment Likes
        $scope.incLikes = function(comment){
            comment.likes += 1;
        };

        //Add Comment
        $scope.addComment = function(){
            if($scope.body === '') { return; }
            $scope.post.comments.push({
                body: $scope.body,
                author: 'user',
                likes: 0
            });
            //clean comment body
            $scope.body = '';
        };
    }]);
/*End Post Controller*/