'use strict';

/**
 * @ngdoc overview
 * @name chromaApp
 * @description
 * # chromaApp
 *
 * Main module of the application.
 */
angular
  .module('chromaApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngTable',
    'ngMaterial',
    'angularFilepicker',
    'angularModalService'
  ])
  .directive('ngInitial', function() {
  return {
    restrict: 'A',
    controller: [
      '$scope', '$element', '$attrs', '$parse', function($scope, $element, $attrs, $parse) {
        var getter, setter, val;
        val = $attrs.ngInitial || $attrs.value;
        getter = $parse($attrs.ngModel);
        setter = getter.assign;
        setter($scope, val);
      }
    ]
  };
})
  .filter("trustUrl", ['$sce', function ($sce) {
        return function (recordingUrl) {
            return $sce.trustAsResourceUrl(recordingUrl);
        };
    }])
  .constant('aws_bucket', 'https://s3.amazonaws.com/durgatneogi/')
  // .filter('')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/home', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
      })

      .when('/auth', {
        templateUrl: 'views/signuplogin.html',
        controller: 'SignupLoginCtrl'
      })

      .when('/signup', {
        templateUrl: 'views/signup.html',
        controller: 'SignupCtrl'
      })
      .when('/logout', {
        templateUrl : 'views/main.html',
        controller : 'LogoutCtrl'
      })

      .when('/login', {
        templateUrl : 'views/login.html',
        controller : 'LoginCtrl'
      })

      .when('/timeline', {
        templateUrl : 'views/resume.html',
        controller : 'ResumeCtrl'
      })

      .when('/settings', {
        templateUrl : 'views/settings.html',
        controller : 'SettingsCtrl'
      })


      .when('/onboarding', {
        templateUrl : 'views/onboarding.html',
        controller : 'OnboardingCtrl'
      })

      .when('/admin', {
        templateUrl : 'views/admin/officer.html',
        controller : 'AdminOfficerCtrl'
      })

      .when('/profile/:id', {
        templateUrl : 'views/admin/profile.html',
        controller : 'AdminProfileCtrl'
      })

      .otherwise({
        redirectTo: '/'
      });
  });
