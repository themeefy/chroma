'use strict';

/**
 * @ngdoc function
 * @name chromaApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the chromaApp
 */
angular.module('chromaApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
