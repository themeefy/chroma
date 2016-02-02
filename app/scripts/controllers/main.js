'use strict';

/**
 * @ngdoc function
 * @name chromaApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the chromaApp
 */
angular.module('chromaApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
