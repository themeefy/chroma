'use strict';

angular.module('chromaApp')

.directive('autoComplete', function($timeout) {
		return function(scope, iElement, iAttrs) {
						iElement.autocomplete({
								source: scope[iAttrs.uiItems],
								select: function() {
										$timeout(function() {
											iElement.trigger('input');
										}, 0);
								}
						});
		};
})

// .directive('ngTrim', function() {
// 	return {
// 			require: 'ngModel',
// 			priority: 300,
// 			link: function(scope, iElem, iAttrs, ngModel) {
// 					if (iAttrs.ngTrim === 'true') {
// 							// Be careful here. We override any value comming from the previous
// 							// parsers to return the real value in iElem
// 							ngModel.$parsers.unshift(function() {
// 									return iElem.val().trim();
// 							});
// 					}
// 			}
// 	}
// })




	.controller('MainCtrl', function ($scope) {

	})


	.controller('SignupCtrl', function ($scope, $location, User, $timeout) {

		$scope.grades = ['8', '9', '10', '11', '12'];

		console.log('singup controller');

		// $location.path('/home');

		$scope.user = {};

		$scope.error = {};

		$scope.loggedinheader = User.isLoggedin();


		$scope.register = function (form) {

			$scope.submitted = true;

			var found = false;

				var user = new Parse.User();

				if($scope.user.name !== undefined)
					user.set('username', $scope.user.name.trim());
				if($scope.user.fullname !== undefined)
					user.set('full_name', $scope.user.fullname.trim());
				if($scope.user.email !== undefined)
					user.set('email', $scope.user.email.trim());
				if($scope.user.password !== undefined)
					user.set('password', $scope.user.password.trim());

					var userTable = Parse.Object.extend('User');

					var userQuery = new Parse.Query(userTable);

					userQuery.find({
							success : function(users) {
								users.forEach(function (response) {
									var t = JSON.stringify(response);
									var p = JSON.parse(t);
									// $scope.allUsers.push(p);
									// tempUsers.push(p);
									if(p.username === $scope.user.name.trim()) {
										found = true;
										$scope.error.umessage = 'Username already exists ...';
										$timeout(function () {
											$scope.error.umessage = '';
										}, 1000);

									}
									else if($scope.user.password !== $scope.user.cpassword) {
										$scope.error.message = 'Passwords should match';
										$timeout(function () {
											$scope.error.message = '';
										}, 1000);
									}

								});

								if(found == false) {
									user.signUp(null, {
									success : function(user) {

										$location.path('/onboarding');
										if(!$scope.$$phase) $scope.$apply();
									},

									error : function(user, error) {
										console.log(error);
									}
									});
								}

								if(!$scope.$$phase) $scope.$apply();


							},
							error : function(error) {
								console.log(error);
							}
						});


				// user.signUp(null, {
				// 	success : function(user) {
				//
				// 		$location.path('/onboarding');
				// 		if(!$scope.$$phase) $scope.$apply();
				// 	},
				//
				// 	error : function(user, error) {
				// 		// alert(error);
				// 		$location.path('/signup');
				// 	}
				// });


		}

		/*** Flip signup login code *****/

		$('.form-control').on('focus blur', function (e) {
		    $(this).parents('.form-group').toggleClass('focused', (e.type === 'focus' || this.value.length > 0));
		}).trigger('blur');

		$('#moveleft').click(function() {
		  $('#textbox').animate({
		    'marginLeft': "0" //moves left
		  });

		  $('.toplam').animate({
		    'marginLeft': "100%" //moves right
		  });
		});

		$('#moveright').click(function() {
		  $('#textbox').animate({
		    'marginLeft': "50%" //moves right
		  });

		  $('.toplam').animate({
		    'marginLeft': "0" //moves right
		  });
		});

		/*** End  ****/



		/* For login from signup and login form */
		// $scope.user = {};

		// $scope.loggedinheader = User.isLoggedin();


		$scope.login = function (form) {

			$scope.submitted = true;
			console.log($scope.user.name + ' ' + $scope.user.password);
				Parse.User.logIn($scope.user.name, $scope.user.password, {
					success : function(user) {
						console.log(user);
						$location.path('/home');
						if(!$scope.$$phase) $scope.$apply();
					},

					error : function(user, error) {
						console.log(error);
						$location.path('/login');
					}
				});

		}
		/* End of login code */


	})

	.controller('LoginCtrl', function ($scope, $location, User, $timeout) {

		$scope.user = {};

		$scope.loggedinheader = User.isLoggedin();

		$scope.error = {};

		$scope.login = function (form) {

			$scope.submitted = true;

			if(form.$valid) {


				Parse.User.logIn($scope.user.name, $scope.user.password, {
					success : function(user) {
						console.log(user);
						var type = user.get('type');
						console.log(type);
						if(type == 2) {
								$location.path('/admin');
						}
						else {
								$location.path('/home');
						}

						if(!$scope.$$phase) $scope.$apply();
					},

					error : function(error) {
						// $location.path('/login');
						console.log(error);
						$scope.error.message = error.message;
						$timeout(function () {
							$scope.error.message = '';
						}, 2000);
						$scope.$apply();
					}
				});
			}
			else {
				$('.signup-form').effect("shake");
				return;
			}

		}



	})



	// 	This controllers handles all home related activies. Inclues display of
	//	all kos under each grade

	.controller('HomeCtrl', function ($scope, $sce, angularFilepicker, User, ModalService, $timeout, aws_bucket) {


		$scope.user = {};

		$scope.ko = {};


		$scope.kos = [];

		// $scope.errors = false;
		$scope.grades = ['8', '9', '10', '11', '12'];

		$scope.gradeValues = ['8', '9', '10', '11', '12'];
		$scope.gpaValues = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
		$scope.actValues = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
		$scope.satValues = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
		$scope.fieldValues = ['Art', 'Business', 'Engineering', 'Law', 'Medical', 'Science'];
		// $scope.collegeValues = ['A', 'B', 'C', 'D', 'E'];
		$scope.collegeValues = [];
		$scope.schoolValues = [];
		// $scope.schoolValues = ['A', 'B', 'C', 'D', 'E'];
		// $scope.$apply();

		$scope.loggedinheader = User.isLoggedin();

		angularFilepicker.setKey('AAOAqsj9SZCOdgsFogWc2z');


		loadCollegeSchoolValues();

		$scope.autocompleteHideState = false;
		$scope.autocompleteHideSchool = false;
		$scope.autocompleteHideCollege = false;


		$( "#inputState" ).keydown(function() {
			var value = $(this).val();
			var length = value.length + 1;
			console.log(value.length);
			var key = event.keyCode || event.charCode;
			console.log(key);
			if( key == 8 || key == 46 )
				$scope.autocompleteHideState = false;
			else if (length > 1) {
							if (length > 2) {
									$scope.autocompleteHideState = true;
							} else {
									$scope.autocompleteHideState = false;
							}
			} else {
					$scope.autocompleteHideCollege = false;
			}
		});



		$( "#inputSchool" ).keydown(function() {
			var value = $(this).val();
			var length = value.length + 1;
			console.log(value.length);
			var key = event.keyCode || event.charCode;
			console.log(key);
			if( key == 8 || key == 46 )
				$scope.autocompleteHideSchool = false;
			else if (length > 1) {
							if (length > 2) {
									$scope.autocompleteHideSchool = true;
							} else {
									$scope.autocompleteHideSchool = false;
							}
			} else {
					$scope.autocompleteHideSchool = false;
			}
		});



		$( "#inputCollege" ).keydown(function() {
		  var value = $(this).val();
			var length = value.length + 1;
			console.log(value.length);
			var key = event.keyCode || event.charCode;
			console.log(key);
			if( key == 8 || key == 46 )
    		$scope.autocompleteHideCollege = false;
			else if (length > 1) {
              if (length > 2) {
                  $scope.autocompleteHideCollege = true;
              } else {
                  $scope.autocompleteHideCollege = false;
              }
      } else {
          $scope.autocompleteHideCollege = false;
      }
		});

		$scope.setSchool = function (text) {
			$scope.userDetails.school = text;
			$scope.autocompleteHideSchool = false;
		}

		$scope.setCollege = function (text) {
			$scope.userDetails.interested_colleges = text;
			$scope.autocompleteHideCollege = false;
		}

		$scope.setState = function (text) {
			$scope.userDetails.state = text;
			$scope.autocompleteHideState = false;
		}


		function loadCollegeSchoolValues() {
			var temp = [];
			var colleges = Parse.Object.extend('Colleges');
			var collegeQuery = new Parse.Query(colleges);
			var schools = Parse.Object.extend('Schools');
			var schoolQuery = new Parse.Query(schools);

			collegeQuery.find({
				success : function (success) {
					var object = JSON.stringify(success);
					var parsedObject = JSON.parse(object);
					temp = [];
					console.log(parsedObject);
					parsedObject.forEach(function (data) {
						temp.push(data.colleges);
					});
					console.log(removeDuplicate(temp));
					$scope.collegeValues = removeDuplicate(temp);
				},
				error : function (error) {
				}
			});

			schoolQuery.find({
				success : function (success) {
					var object = JSON.stringify(success);
					var parsedObject = JSON.parse(object);
					temp = [];
					console.log(parsedObject);
					parsedObject.forEach(function (data) {
						temp.push(data.schools);
					});
					$scope.schoolValues = removeDuplicate(temp);
				},
				error : function (error) {

				}
			})
		}

		function removeDuplicate(arr) {
			arr = arr.filter (function (v, i, a) { return a.indexOf (v) == i });
			return arr;
		}

		// function unique(list) {
		// 	list = list.filter(function(n){ return n != null });
		// 	return list;
		// }


		function saveLoggedInDate() {
			var query = new Parse.Query(Parse.User);
			var currentDate = new Date();
			var loggedin = Parse.User.current();
			query.get(loggedin.id,  {
				success : function (response) {
					response.set('lastactivity', currentDate);
					response.save(null, {
						success : function (success) {
							console.log(success);
						},
						error : function (failure) {

						}
					})
				},
				error : function (error) {

				}
			});
		}


		saveLoggedInDate();



		// Get the current logged in user. To get the details

		var loggedinuser = Parse.User.current();

		var query = new Parse.Query(Parse.User);

		// query.get(loggedinuser.id, {
		// 	success : function ()
		// })

		// This will hold the current logged in user details. For the use of saving kos in the 'Kos' table
		$scope.userDetails = {};

		var kotable = Parse.Object.extend('Kos');

		var koquery = new Parse.Query(kotable);


		$scope.states = [];

		$('#country').change(function () {
			console.log($(this).val());
			var country = $(this).val().trim();
			if(country[0] !== '?') {
				if(country === 'USA') {
					$scope.$apply(function () {
							$('.state_filter').show();
							$scope.states = ['California', 'Mexico', 'Canada', 'Virginia', 'Oregon'];
					})

				}
				else {
					$scope.$apply(function () {
						$('.state_filter').hide();
					})

				}
			}
		});


		function setCurrentDate() {
			var date = new Date();
			$scope.ko.date = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
		}

		setCurrentDate();


		function currentUserDetails() {
			User.getCurrentUserDetails()
			.then(function (response) {
				// console.log(response);
				$scope.userDetails = response;
				$scope.userDetails.cs = response.country +','+response.state;

				koquery.equalTo('user', loggedinuser);
				console.log($scope.userDetails);
				koquery.find({
					success : function (response) {
						// console.log(response);
						var t = JSON.stringify(response);
						var u = JSON.parse(t);

						$scope.$apply(function () {
							$scope.kos = u;
							// $scope.kosInGradeLayout();
						})
						console.log($scope.kos);
					},
					error : function (error) {
						console.log(error);
					}
				});
			})
			.catch(function (error) {

			});
		}

		$scope.currentUserDetails = currentUserDetails;

		$scope.currentUserDetails();

		// Query the user and store the details
		query.get(loggedinuser.id,{

			success: function(details) {
				console.log(JSON.stringify(details));

				var object = JSON.stringify(details);

				var parsedobject = JSON.parse(object);

				console.log(parsedobject);
				$scope.$apply(function () {
					$scope.user = parsedobject;
					$scope.user.username = details.get('username');
					$scope.user.country = details.get('country');
					$scope.user.state = details.get('state');
					$scope.user.photo = (details.get('photo') ? details.get('photo') : "../images/default_avatar.png" );
				})
			},

			error : function(error) {
				console.log(error);
			}

		});



		$scope.activateModal = function() {
			$('#portfolioModal').modal('show');
		}



		// Upload image ko
		$scope.uploadImage = function () {
			angularFilepicker.pickAndStore(
		        {
		        	mimetype : 'image/*'
		        },
		        {
				  	location:"S3",
				  	access: 'public'
				},
		        function(Blob) {

		        	console.log(aws_bucket + Blob[0].key);
		        	$scope.ko.image = "";
		        	$scope.$apply(function () {
		        		$scope.ko.image = aws_bucket + Blob[0].key;
		        	})


		        }
		    );
		}



		// Upload video ko
		$scope.uploadVideo = function () {
			angularFilepicker.pickAndStore(
		        {
		        	mimetype : 'video/*'
		        },
		        {
				  	location:"S3",
				  	access: 'public'
				},
		        function(Blob) {
							console.log(Blob);
		        	console.log(aws_bucket + Blob[0].key);
		        	$scope.ko.video = aws_bucket + Blob[0].key;

		        }
		    );
		}








		// For changing profile picture
		$scope.pickProfilePic = function () {
			angularFilepicker.pickAndStore(
		        {
		        	mimetype : 'image/*'
		        },
		        {
				  	location:"S3",
				  	access: 'public'
				},
		        function(Blob) {


		        	var user = new Parse.User();

		        	var current = Parse.User.current();

		        	current.set('photo', aws_bucket + Blob[0].key);

		        	current.save(null, {
		        		success : function(user) {

		        			$scope.$apply(function () {
		        				$scope.user.photo = aws_bucket + Blob[0].key;
		        			})

		        		},

		        		error : function(user, error) {
		        			console.log(JSON.stringify(error));
		        		}
		        	});


		        }
		    );

		}

		// console.log($scope.userDetails.username);


		$scope.saveImageKo = function() {
			var koClass = Parse.Object.extend('Kos');
			var ko = new koClass();

			// var date = new Date();

			var date = $scope.ko.date;
			var dateString = Date.parse(date.replace(/-/g,"/"));
			var actualDate = new Date(dateString);

			var currentuser = Parse.User.current();




				ko.set('image', $scope.ko.image);
				// ko.set('title', $scope.ko.imagetitle.trim());
				ko.set('description', $scope.ko.imagedescription.trim());
				ko.set('grade', $('#grade-select').val().trim());
				ko.set('primarytag', $scope.ko.imagetag.trim());
				ko.set('date', actualDate);
				ko.set('type', 'image');
				ko.set('user', currentuser);


				ko.save(null, {
					success : function (response) {
						$scope.currentUserDetails();
						// $scope.kosInGradeLayout();
						$('#portfolioModal').modal('hide');

					},
					error : function (error) {
						console.log(JSON.stringify(error));
					}
				})

		}


		$scope.saveVideoKo = function () {



			var koClass = Parse.Object.extend('Kos');
			var ko = new koClass();

			var date = $scope.ko.date;
			var dateString = Date.parse(date.replace(/-/g,"/"));
			var actualDate = new Date(dateString);

			var currentuser = Parse.User.current();



			var t = JSON.stringify(currentuser);
			var u  = JSON.parse(t);


			ko.set('image', $scope.ko.video);
			// ko.set('title', $scope.ko.videotitle.trim());
			ko.set('description', $scope.ko.videodescription.trim());
			ko.set('grade', $('#video-grade-select').val().trim());
			ko.set('primarytag', $scope.ko.videotag.trim());
			ko.set('type', 'video')
			ko.set('date', actualDate);
			ko.set('user', currentuser);


			ko.save(null, {
				success : function (response) {
					$scope.currentUserDetails();
					$('#portfolioModal').modal('hide');

				},
				error : function (error) {
					console.log(JSON.stringify(error));
				}
			})



		}

		// Filter cards by grade
		$scope.cardsByGrade = function(grade) {

			var loggedinuser = Parse.User.current();
			var kotable = Parse.Object.extend('Kos');

			var koquery = new Parse.Query(kotable);

			koquery.equalTo('user', loggedinuser);
			koquery.equalTo('grade', grade);
			// console.log($scope.userDetails);
			koquery.find({
				success : function (response) {
					console.log(response);
					var t = JSON.stringify(response);
					var u = JSON.parse(t);

					$scope.$apply(function () {
						$scope.kos = u;
						// $scope.kosInGradeLayout();
					})
					console.log($scope.kos);
				},
				error : function (error) {
					console.log(error);
				}
			});

		}

		// Filter cards by Primary tag
		$('#tag-dropdown').change(function () {
			var tag = $(this).val();
			var loggedinuser = Parse.User.current();
			var kotable = Parse.Object.extend('Kos');

			var koquery = new Parse.Query(kotable);

			koquery.equalTo('user', loggedinuser);
			if(tag.trim() !== 'All Tags')
				koquery.equalTo('primarytag', tag);
			// koquery.equalTo('primarytag', tag);
			// console.log($scope.userDetails);
			koquery.find({
				success : function (response) {
					console.log(response);
					var t = JSON.stringify(response);
					var u = JSON.parse(t);

					$scope.$apply(function () {
						$scope.kos = u;
						// $scope.kosInGradeLayout();
					})
					console.log($scope.kos);
				},
				error : function (error) {
					console.log(error);
				}
			});
		})


		// Function to format the kos in grade -> kos
		function kosInGradeLayout() {
			var allKos = $scope.kos;
			var tempKos = $scope.kos;

			// This will have the formatted data. List of kos under each grade
			$scope.sortedKo = [];

			$scope.finalFormattedKos = [];

			// var data_format = {
			// 	grade : '',
			// 	kos : []
			// }

			var grade = '';
			var object = {};




			var array = [];


			function compare(a,b) {
			  if (a.grade > b.grade)
			    return -1;
			  if (a.grade < b.grade)
			    return 1;
			  return 0;
			}

			allKos = allKos.sort(compare);



			console.log(allKos);

			var temp = {

					grade : '',
					kos : []

				};

			//var allKosObject;

			var i;

			for(i=0; i < allKos.length; i++) {

				var allKosObject = allKos[i];

				if(i != 0) {
					if(temp.grade == allKosObject.grade){
						temp.kos.push(allKosObject);
						if(i==(allKos.length-1)){
							array.push(temp);
							// array[i] = temp;
						}
					}
					else{
						array.push(temp);
						temp = {

							grade : '',
							kos : []

						};
						temp.grade = allKosObject.grade;
						temp.kos.push(allKosObject);
						if(i==(allKos.length-1)){
							array.push(temp);
						}
					}
				}
				else {

					temp.grade = allKosObject.grade;
					temp.kos.push(allKosObject);
					if(i==(allKos.length-1)){
							array.push(temp);
							// array[i] = temp;
						}
				}
			}


			$scope.sortedKo = array;
			console.log(array);




		}

		$scope.kosInGradeLayout = kosInGradeLayout;



				// Save on outside click on textboxes
				$(".editable").bind("focusout", function(){

				  	var element = $(this);

				  	var usertable = Parse.Object.extend('User');

						var user = new usertable();

						var uQuery = new Parse.Query(Parse.User);
			        uQuery.get(loggedinuser.id, {
			            success: function(user) {

														// console.log($scope.userDetails.country);
														if($scope.userDetails.grade !== undefined) {
															user.set('grade', $scope.userDetails.grade.trim());
															$scope.user.grade = $scope.userDetails.grade.trim();
														}

														if($('#country').val() !== null)
															user.set('country', $('#country').val().trim());
														if($scope.userDetails.state.trim() !== null)
															user.set('state', $scope.userDetails.state.trim());
														if($('#state').val() === null)
															user.set('state', '');
														if($scope.userDetails.school !== undefined)
															user.set('school', $scope.userDetails.school.trim());
														// user.set('full_name', $scope.profile.full_name);
														if($scope.userDetails.gpa !== undefined)
															user.set('gpa', $scope.userDetails.gpa.trim());
														if($scope.userDetails.act !== undefined)
															user.set('act', $scope.userDetails.act.trim());
														if($scope.userDetails.sat !== undefined)
															user.set('sat', $scope.userDetails.sat.trim());
														if($scope.userDetails.interested_field !== undefined)
															user.set('primarytag', $scope.userDetails.interested_field.trim());
														if($scope.userDetails.interested_colleges !== undefined)
															user.set('interested_colleges', $scope.userDetails.interested_colleges.trim());
														console.log(user);
														user.save(null, {
															success : function (response) {
																uQuery.get(loggedinuser.id, {
																	success : function (response) {
																		// console.log(response);
																		var t = JSON.stringify(response);
																		var u = JSON.parse(t);
																		$scope.$apply(function () {
																			$scope.profile = u;
																			$scope.userDetails = u;
																			console.log(u);
																			// $scope.profile.photo = (response.get('photo') ? response.get('photo') : "../images/default_avatar.png" );
																		})

																		console.log($scope.profile.username);
																	},
																	error : function (error) {

																	}
																});
															},
															error : function (error) {

															}
														});

			            }
			        });


				});



				// $scope.videoUrl = '';

				$scope.playVideo = function (url) {

					document.getElementById('videoTag').innerHTML =  '<video style="width: 100%; height: 455px !important; margin: auto;" id="popupMedia"   class="video-js vjs-default-skin vjs-big-play-centered" controls><source src="'+decodeURIComponent(url)+'" type="video/mp4"></video>';


					$('#koVideo').show();
				}





	})

	// This controller will handle all visual resume page related tasks
	.controller('ResumeCtrl', function ($scope, User, angularFilepicker, aws_bucket) {

		$scope.loggedinheader = User.isLoggedin();
		$scope.ko = {};
		$scope.kos = [];
		$scope.profile = {};
		$scope.user = {};

		$scope.grades = ['8', '9', '10', '11', '12'];
		$scope.gradeValues = ['8', '9', '10', '11', '12'];
		$scope.gpaValues = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
		$scope.actValues = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
		$scope.satValues = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
		$scope.fieldValues = ['Art', 'Business', 'Engineering', 'Law', 'Medical', 'Science'];
		$scope.collegeValues = [];

		$scope.interests = ['Art', 'Business', 'Engineering', 'Law', 'Medical', 'Science'];
		$scope.schoolValues = [];

		var loggedinuser = Parse.User.current();

		var kostable = Parse.Object.extend('Kos');

		var query = new Parse.Query(kostable);


		angularFilepicker.setKey('AAOAqsj9SZCOdgsFogWc2z');


		query.equalTo('user', loggedinuser);

		// var loggedinuser = Parse.User.current();

		var userquery = new Parse.Query(Parse.User);

		var usertable = Parse.Object.extend('User');

		// var userquery = new Parse.Query(usertable);

		$scope.user = {};


		$scope.states = [];

		loadCollegeSchoolValues();

		$scope.autocompleteHideState = false;
		$scope.autocompleteHideSchool = false;
		$scope.autocompleteHideCollege = false;


		$( "#inputState" ).keydown(function() {
			var value = $(this).val();
			var length = value.length + 1;
			console.log(value.length);
			var key = event.keyCode || event.charCode;
			console.log(key);
			if( key == 8 || key == 46 )
				$scope.autocompleteHideState = false;
			else if (length > 1) {
							if (length > 2) {
									$scope.autocompleteHideState = true;
							} else {
									$scope.autocompleteHideState = false;
							}
			} else {
					$scope.autocompleteHideCollege = false;
			}
		});



		$( "#inputSchool" ).keydown(function() {
			var value = $(this).val();
			var length = value.length + 1;
			console.log(value.length);
			var key = event.keyCode || event.charCode;
			console.log(key);
			if( key == 8 || key == 46 )
				$scope.autocompleteHideSchool = false;
			else if (length > 1) {
							if (length > 2) {
									$scope.autocompleteHideSchool = true;
							} else {
									$scope.autocompleteHideSchool = false;
							}
			} else {
					$scope.autocompleteHideSchool = false;
			}
		});



		$( "#inputCollege" ).keydown(function() {
		  var value = $(this).val();
			var length = value.length + 1;
			console.log(value.length);
			var key = event.keyCode || event.charCode;
			console.log(key);
			if( key == 8 || key == 46 )
    		$scope.autocompleteHideCollege = false;
			else if (length > 1) {
              if (length > 2) {
                  $scope.autocompleteHideCollege = true;
              } else {
                  $scope.autocompleteHideCollege = false;
              }
      } else {
          $scope.autocompleteHideCollege = false;
      }
		});

		$scope.setSchool = function (text) {
			$scope.userDetails.school = text;
			$scope.autocompleteHideSchool = false;
		}

		$scope.setCollege = function (text) {
			$scope.userDetails.interested_colleges = text;
			$scope.autocompleteHideCollege = false;
		}

		$scope.setState = function (text) {
			$scope.userDetails.state = text;
			$scope.autocompleteHideState = false;
		}



		function loadCollegeSchoolValues() {
			var temp = [];
			var colleges = Parse.Object.extend('Colleges');
			var collegeQuery = new Parse.Query(colleges);
			var schools = Parse.Object.extend('Schools');
			var schoolQuery = new Parse.Query(schools);

			collegeQuery.find({
				success : function (success) {
					var object = JSON.stringify(success);
					var parsedObject = JSON.parse(object);
					temp = [];
					console.log(parsedObject);
					parsedObject.forEach(function (data) {
						temp.push(data.colleges);
					});
					console.log(removeDuplicate(temp));
					$scope.collegeValues = removeDuplicate(temp);
				},
				error : function (error) {
				}
			});

			schoolQuery.find({
				success : function (success) {
					var object = JSON.stringify(success);
					var parsedObject = JSON.parse(object);
					temp = [];
					console.log(parsedObject);
					parsedObject.forEach(function (data) {
						temp.push(data.schools);
					});
					$scope.schoolValues = removeDuplicate(temp);
				},
				error : function (error) {

				}
			})
		}

		function removeDuplicate(arr) {
			arr = arr.filter (function (v, i, a) { return a.indexOf (v) == i });
			return arr;
		}


		function setCurrentDate() {
			var date = new Date();
			$scope.ko.date = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
		}

		setCurrentDate();

		$('#country').change(function () {
			console.log($(this).val());
			var country = $(this).val().trim();
			if(country[0] !== '?') {
				if(country === 'USA') {
					$scope.$apply(function () {
							$('#state').show();
							$scope.states = ['California', 'Mexico', 'Canada', 'Virginia', 'Oregon'];
					})

				}
				else {
					$scope.$apply(function () {
						$('#state').hide();
					})

				}
			}
		});

		$scope.activateModal = function () {
			$('#portfolioModal').modal('show');
		}


		function currentUserDetails() {
			User.getCurrentUserDetails()
			.then(function (response) {
				// console.log(response);
				$scope.user = response;
				$scope.userDetails = response;
				$scope.userDetails.cs = response.country +','+response.state;
				$scope.user.photo = response.photo;

				// koquery.equalTo('user', loggedinuser);
			})
			.catch(function (error) {

			});
		};

		currentUserDetails();


		function fetchUserKos () {
			query.find({
				success : function (response) {

					var t = JSON.stringify(response);
					var u = JSON.parse(t);

					$scope.$apply(function () {
						$scope.kos = u;
						kosByTagLayout();
						// $scope.kosByTagLayout();
					});
					console.log($scope.kos);

				},
				error : function (error) {

				}
			});
		}



		fetchUserKos();

		$scope.saveImageKo = function() {
			var koClass = Parse.Object.extend('Kos');
			var ko = new koClass();

			var date = $scope.ko.date;
			console.log(date);
			var dateString = Date.parse(date.replace(/-/g,"/"));
			console.log(dateString);
			var actualDate = new Date(dateString);

			console.log(actualDate);

			var currentuser = Parse.User.current();

				ko.set('image', $scope.ko.image);
				// ko.set('title', $scope.ko.imagetitle.trim());
				ko.set('description', $scope.ko.imagedescription.trim());
				ko.set('grade', $('#grade-select').val().trim());
				ko.set('primarytag', $scope.ko.imagetag.trim());
				ko.set('type', 'image');
				ko.set('date', actualDate);
				ko.set('user', currentuser);


				ko.save(null, {
					success : function (response) {

						fetchUserKos();
						$('#portfolioModal').modal('hide');

					},
					error : function (error) {
						console.log(JSON.stringify(error));
					}
				})
			// }




		}


		$scope.saveVideoKo = function () {



			var koClass = Parse.Object.extend('Kos');
			var ko = new koClass();

			var date = $scope.ko.date;
			var dateString = Date.parse(date.replace(/-/g,"/"));
			var actualDate = new Date(dateString);


			var currentuser = Parse.User.current();



			var t = JSON.stringify(currentuser);
			var u  = JSON.parse(t);


			ko.set('image', $scope.ko.video);
			// ko.set('title', $scope.ko.videotitle.trim());
			ko.set('description', $scope.ko.videodescription.trim());
			ko.set('grade', $('#video-grade-select').val().trim());
			ko.set('primarytag', $scope.ko.videotag.trim());
			ko.set('type', 'video');
			ko.set('date', actualDate);
			ko.set('user', currentuser);


			ko.save(null, {
				success : function (response) {

					fetchUserKos();
					$('#portfolioModal').modal('hide');

				},
				error : function (error) {
					console.log(JSON.stringify(error));
				}
			})



		}

		// Upload image ko
		$scope.uploadImage = function () {
			angularFilepicker.pickAndStore(
		        {
		        	mimetype : 'image/*'
		        },
		        {
				  	location:"S3",
				  	access: 'public'
				},
		        function(Blob) {

		        	console.log(aws_bucket + Blob[0].key);
		        	$scope.ko.image = "";
		        	$scope.$apply(function () {
		        		$scope.ko.image = aws_bucket + Blob[0].key;
		        	})


		        }
		    );
		}



		// Upload video ko
		$scope.uploadVideo = function () {
			angularFilepicker.pickAndStore(
		        {
		        	mimetype : 'video/*'
		        },
		        {
				  	location:"S3",
				  	access: 'public'
				},
		        function(Blob) {
		        	console.log(aws_bucket + Blob[0].key);
		        	$scope.ko.video = aws_bucket + Blob[0].key;

		        }
		    );
		}





		// Function to format the kos in grade -> kos
		function kosByTagLayout() {

			// fetchUserKos();
			var allKos = $scope.kos;
			var tempKos = $scope.kos;

			// This will have the formatted data. List of kos under each grade
			$scope.sortedKo = [];

			$scope.finalFormattedKos = [];

			// var data_format = {
			// 	tag : '',
			// 	kos : []
			// }

			var tag = '';
			var object = {};


			$scope.$on("MyEvent", function (evt, args) {
			//arg is your payload

				// alert('ok');
			});


			// alert('ok');

			console.log(allKos);

			function compare(a,b) {
			  if ( String(a.primarytag) > String(b.primarytag) )
			    return -1;
			  if ( String(a.primarytag) < String(b.primarytag) )
			    return 1;
			  return 0;
			}

			allKos = allKos.sort(compare);



			console.log(allKos);

			var temp = {

					primarytag : '',
					kos : []

				};

			//var allKosObject;

			var i;


			var array = [];

			for(i=0; i < allKos.length; i++) {

				var allKosObject = allKos[i];

				if(i != 0) {
					if(temp.primarytag == allKosObject.primarytag){
						temp.kos.push(allKosObject);
						if(i==(allKos.length-1)){
							array.push(temp);
							// array[i] = temp;
						}
					}
					else{
						array.push(temp);
						// array[i] = temp;
						temp = {

							primarytag : '',
							kos : []

						};
						temp.primarytag = allKosObject.primarytag;
						temp.kos.push(allKosObject);
						if(i==(allKos.length-1)){
							array.push(temp);
							// array[i] = temp;
						}
					}
				}
				else {

					temp.primarytag = allKosObject.primarytag;
					temp.kos.push(allKosObject);
					if(i==(allKos.length-1)){
							array.push(temp);
							// array[i] = temp;
						}
				}
				// $scope.sortedKo.push(temp);
			}


			$scope.sortedKo = array;
			console.log($scope.sortedKo);




		}

		$scope.kosByTagLayout = kosByTagLayout;

		// kosByTagLayout();

		$scope.saveUser = function () {
			var usertable = Parse.Object.extend('User');

			var query = new Parse.Query(usertable);





			// query.equalTo('user', loggedinuser);

			query.set('full_name', $scope.profile.full_name);
			query.set('grade', $scope.profile.grade);
			query.set('country', $scope.profile.cstate.split(' ')[0]);
			query.set('state', $scope.profile.cstate.split(' ')[1]);

			query.save(loggedinuser.id, {
				// query.set('username')

				success : function () {
					userquery.get(loggedinuser.id, {
						success : function (response) {
							// console.log(response);
							var t = JSON.stringify(response);
							var u = JSON.parse(t);
							$scope.$apply(function () {
								$scope.profile = u;
								$scope.profile.photo = (response.get('photo') ? response.get('photo') : "../images/default_avatar.png" );
							})

							console.log($scope.profile.username);
						},
						error : function (error) {

						}
					});
				},
				error : function () {

				}




			});
		}

		// $scope.saveUser = saveUser;



		$(".editable").bind("focusout", function(){

		  	var element = $(this);

		  	var usertable = Parse.Object.extend('User');

				var user = new usertable();


				var uQuery = new Parse.Query(Parse.User);
	        uQuery.get(loggedinuser.id, {
	            success: function(user) {

									if($scope.userDetails.grade !== undefined) {
										user.set('grade', $scope.userDetails.grade.trim());
										$scope.user.grade = $scope.userDetails.grade.trim();
									}

									if($('#country').val() !== null)
										user.set('country', $('#country').val().trim());
									if($scope.userDetails.state.trim() !== null)
										user.set('state', $scope.userDetails.state.trim());
									if($scope.userDetails.state.trim() === null)
										user.set('state', '');
									if($scope.userDetails.school !== undefined)
										user.set('school', $scope.userDetails.school.trim());
									user.set('full_name', $scope.userDetails.full_name.trim());
									if($scope.userDetails.gpa !== undefined)
										user.set('gpa', $scope.userDetails.gpa.trim());
									if($scope.userDetails.act !== undefined)
										user.set('act', $scope.userDetails.act.trim());
									if($scope.userDetails.sat !== undefined)
										user.set('sat', $scope.userDetails.sat.trim());
									if($scope.userDetails.interested_field !== undefined)
										user.set('primarytag', $scope.userDetails.interested_field.trim());
									if($scope.userDetails.interested_colleges !== undefined)
										user.set('interested_colleges', $scope.userDetails.interested_colleges.trim());

									user.save(null, {
										success : function (response) {
											uQuery.get(loggedinuser.id, {
												success : function (response) {
													// console.log(response);
													var t = JSON.stringify(response);
													var u = JSON.parse(t);
													$scope.$apply(function () {
														$scope.profile = u;
														$scope.userDetails = u;
														console.log(u);
													})

													// console.log($scope.profile.username);
												},
												error : function (error) {

												}
											});
										},
										error : function (error) {

										}
									})

	            }
	        });

		});


		// For changing profile picture
		$scope.pickProfilePic = function () {
			angularFilepicker.pickAndStore(
		        {
		        	mimetype : 'image/*'
		        },
		        {
				  	location:"S3",
				  	access: 'public'
				},
		        function(Blob) {
		        	console.log(aws_bucket + Blob[0].key);
		        	// $scope.$apply(function () {
		        	// 	$scope.user.avatar = aws_bucket + Blob[0].key;
		        	// });

		        	var user = new Parse.User();

		        	var current = Parse.User.current();

		        	current.set('photo', aws_bucket + Blob[0].key);

		        	current.save(null, {
		        		success : function(user) {

		        			$scope.$apply(function () {
										$scope.user.photo = aws_bucket + Blob[0].key;
		        				$scope.userDetails.photo = aws_bucket + Blob[0].key;
		        			})

		        		},

		        		error : function(user, error) {
		        			console.log(JSON.stringify(error));
		        		}
		        	});


		        }
		    );

		}

		// $scope.pickProfilePic = pickProfilePic;

		// Filter cards by Primary tag
		$('#tag-dropdown').change(function () {
			var tag = $(this).val().trim();
			console.log(tag);
			var loggedinuser = Parse.User.current();
			var kotable = Parse.Object.extend('Kos');

			var koquery = new Parse.Query(kotable);

			koquery.equalTo('user', loggedinuser);
			if(tag.trim() !== 'All Tags')
				koquery.equalTo('primarytag', tag);
			// console.log($scope.userDetails);
			koquery.find({
				success : function (response) {
					console.log(response);
					var t = JSON.stringify(response);
					var u = JSON.parse(t);

					$scope.$apply(function () {
						$scope.kos = u;
						// $scope.kosInGradeLayout();
					})
					console.log($scope.kos);
				},
				error : function (error) {
					console.log(error);
				}
			});
		})



		$scope.snapShot = function () {
			$('#snapshot').show();
		}

		$scope.playVideo = function (url) {

			document.getElementById('videoTag').innerHTML =  '<video style="width: 100%; height: 455px !important; margin: auto;" id="popupMedia"   class="video-js vjs-default-skin vjs-big-play-centered" controls><source src="'+decodeURIComponent(url)+'" type="video/mp4"></video>';


			$('#koVideo').show();
		}



	})


	.controller('SettingsCtrl', function ($scope, User, $location) {

		$scope.user = {};

		$scope.loggedinheader = User.isLoggedin();


		var loggedinuser = Parse.User.current();
		var userquery = new Parse.Query(Parse.User);
		userquery.get(loggedinuser.id, {
					success : function (response) {
						// console.log(response);
						var t = JSON.stringify(response);
						var u = JSON.parse(t);
						$scope.$apply(function () {
							$scope.user.username = u.full_name;
							// $scope.profile = u;
							// $scope.profile.photo = (response.get('photo') ? response.get('photo') : "../images/default_avatar.png" );
						});

						console.log($scope.profile.username);
					},
					error : function (error) {

					}
				});




	})


	// This controller will handle login and signup tasks from the LP
	.controller('SignupLoginCtrl', function ($scope, User, $location, $timeout) {
		$scope.grades = ['8', '9', '10', '11', '12'];

		console.log('singup controller');


		$scope.user = {};

		$scope.error = {};

		$scope.loggedinheader = User.isLoggedin();


		$scope.register = function (form) {

			$scope.submitted = true;


				var user = new Parse.User();

				if($scope.user.name !== undefined)
					user.set('username', $scope.user.name.trim());
				if($scope.user.fullname !== undefined)
					user.set('full_name', $scope.user.fullname.trim());
				if($scope.user.email !== undefined)
					user.set('email', $scope.user.email.trim());
				if($scope.user.password !== undefined)
					user.set('password', $scope.user.password.trim());

				console.log($scope.user.password);
				var userTable = Parse.Object.extend('User');

				var userQuery = new Parse.Query(userTable);

				userQuery.find({
						success : function(users) {
							users.forEach(function (response) {
								var t = JSON.stringify(response);
								var p = JSON.parse(t);
								// $scope.allUsers.push(p);
								// tempUsers.push(p);
								if(p.username === $scope.user.name) {
									$scope.error.umessage = 'Username already exists ...';
									$timeout(function () {
										$scope.error.umessage = '';
									}, 1000);
								}
								else if($scope.user.password !== $scope.user.cpassword) {
									$scope.error.message = 'Passwords should match';
									$timeout(function () {
										$scope.error.message = '';
									}, 1000);
								}
								else {
									user.signUp(null, {
									success : function(user) {

										$location.path('/onboarding');
										if(!$scope.$$phase) $scope.$apply();
									},

									error : function(user, error) {
										console.log(error);
									}
									});

								}
							});

							if(!$scope.$$phase) $scope.$apply();


						},
						error : function(error) {
							console.log(error);
						}
					});






		}

		/*** Flip signup login code *****/

		$('.form-control').on('focus blur', function (e) {
		    $(this).parents('.form-group').toggleClass('focused', (e.type === 'focus' || this.value.length > 0));
		}).trigger('blur');

		$('#moveleft').click(function() {
		  $('#textbox').animate({
		    'marginLeft': "0" //moves left
		  });

		  $('.toplam').animate({
		    'marginLeft': "100%" //moves right
		  });
		});

		$('#moveright').click(function() {
		  $('#textbox').animate({
		    'marginLeft': "50%" //moves right
		  });

		  $('.toplam').animate({
		    'marginLeft': "0" //moves right
		  });
		});

		/*** End  ****/


		$scope.login = function (form) {

			$scope.submitted = true;
			console.log('here');
			console.log($scope.user.name + ' ' + $scope.user.password);
				Parse.User.logIn($scope.user.name, $scope.user.password, {
					success : function(user) {
						console.log(JSON.stringify(user));
						var type = user.get('type');
						console.log(type);
						if(type == 2) {
								$location.path('/admin');
						}
						else {
								$location.path('/home');
						}

						$scope.$apply();
					},

					error : function(user, error) {
						console.log(error);
						$scope.error.message = error.message;
						$timeout(function () {
							$scope.error.message = '';
						}, 1000);
						$scope.$apply();
					}
				});



		}

		// if($scope.$$phase) $scope.$apply();
		/* End of login code */

	})



	// This controller will handle all onboarding page tasks
	.controller('OnboardingCtrl', function ($scope, User, $location) {
		$scope.loggedinheader = User.isLoggedin();


		$scope.setUpProfile = function () {
			$location.path('/timeline');
			// $scope.$apply();
		}


		$scope.gotoHome = function () {
			$location.path('/home');
			// $scope.$apply();
		}



	})



	.controller('LogoutCtrl', function ($scope, User, $location) {
		Parse.User.logOut();
		$location.path('/');
	})

	// Admission Officer related tasks handling goes here.
	.controller('AdminOfficerCtrl', function ($scope, User, $location, NgTableParams, $cookies) {

		var self = this;

		$scope.loggedinheader = User.isLoggedin();



		$scope.grades = ['8', '9', '10', '11', '12'];
		$scope.gpa = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
		$scope.actvalues = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
		$scope.satvalues = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
		$scope.interests = ['Art', 'Business', 'Engineering', 'Law', 'Medical', 'Science'];
		$scope.colleges = [];
		$scope.customFilters = [];

		$scope.query = {};

		$scope.gpaAbove = true;
		$scope.actAbove = true;
		$scope.satAbove = true;
		$scope.gpa_status = '';

		var loggedinuser = '';

		function getAdminId() {
			var admin = Parse.Object.extend('User');
			var adminQuery = new Parse.Query(admin);
			adminQuery.equalTo('username', 'admin');
			adminQuery.find({
				success : function (response) {
					console.log(response);
					var obj = JSON.stringify(response);
					var pobj = JSON.parse(obj);
					loggedinuser = pobj[0].objectId;
				},
				error : function (error) {
					console.log(error);
				}
			})
		}

		getAdminId();

		// console.log(loggedinuser.id);
		// var admin = '';

		// Store the admin id
		// var t = $cookies.get('admin');
		// if($cookies.get('admin') === undefined) {
		// 	$cookies.put('admin', loggedinuser.id);
		// }
		// else {
		// 	admin = $cookies.get('admin');
		// }
		// console.log(admin);
		var parsedLoggedIn = JSON.stringify(loggedinuser);



		var userTable = Parse.Object.extend('User');
		var userQuery = new Parse.Query(userTable);

		$scope.allUsers = [];
		var tempUsers = [];

		loadAllData();
		var query = new Parse.Query(Parse.User);

		loadCollegeSchoolValues();
		loadCustomFilters();

		$scope.autocompleteHideState = false;
		$scope.autocompleteHideCollege = false;
		$( "#inputState" ).keydown(function() {
			var value = $(this).val();
			var length = value.length + 1;
			console.log(value.length);
			var key = event.keyCode || event.charCode;
			console.log(key);
			if( key == 8 || key == 46 )
				$scope.autocompleteHideState = false;
			else if (length > 1) {
							if (length > 2) {
									$scope.autocompleteHideState = true;
							} else {
									$scope.autocompleteHideState = false;
							}
			} else {
					$scope.autocompleteHideCollege = false;
			}
		});
		$( "#inputCollege" ).keydown(function() {
				  var value = $(this).val();
					var length = value.length + 1;
					console.log(value.length);
					var key = event.keyCode || event.charCode;
					console.log(key);
					if( key == 8 || key == 46 )
		    		$scope.autocompleteHideCollege = false;
					else if (length > 1) {
		              if (length > 2) {
		                  $scope.autocompleteHideCollege = true;
		              } else {
		                  $scope.autocompleteHideCollege = false;
		              }
		      } else {
		          $scope.autocompleteHideCollege = false;
		      }
				});
		$scope.setCollege = function (text) {
			$scope.query.interested_colleges = text;
			$scope.autocompleteHideCollege = false;
		}
		$scope.setState = function (text) {
			$scope.query.state = text;
			$scope.autocompleteHideState = false;
		}


		function loadCollegeSchoolValues() {
			var temp = [];
			var colleges = Parse.Object.extend('Colleges');
			var collegeQuery = new Parse.Query(colleges);


			collegeQuery.find({
				success : function (success) {
					var object = JSON.stringify(success);
					var parsedObject = JSON.parse(object);
					temp = [];
					console.log(parsedObject);
					parsedObject.forEach(function (data) {
						temp.push(data.colleges);
					});
					// console.log(removeDuplicate(temp));
					$scope.colleges = removeDuplicate(temp);
				},
				error : function (error) {
				}
			});

		}

		function removeDuplicate(arr) {
			arr = arr.filter (function (v, i, a) { return a.indexOf (v) == i });
			return arr;
		}

		function loadCustomFilters() {
			var filters = Parse.Object.extend('Filters');
			var filterQuery = new Parse.Query(filters);
			var temp = [];

			filterQuery.find({
				success : function (success) {
					var object = JSON.stringify(success);
					var parsedObject = JSON.parse(object);
					parsedObject.forEach(function (data) {
						temp.push(data.name);
					});
					$scope.$apply(function () {
						$scope.customFilters = temp;
					})

				},
				error : function (error) {

				}
			})
		}


		$scope.unFollow = function (userId) {
			var userTable = Parse.Object.extend('User');
			var userQuery = new Parse.Query(userTable);
			var favoriteList = [];

			// userQuery.equalTo('username', 'admin');
			userQuery.get(loggedinuser, {
				success	:	function (response) {
					var obj = JSON.stringify(response);
					var pobj = JSON.parse(obj);
					console.log(pobj);
					// Get the favorite list of admin
					favoriteList = pobj.favorites;
					console.log(userId);
					console.log(favoriteList);
					var index = favoriteList.indexOf(userId);
					if (index > -1) {
						favoriteList.splice(index, 1);
					}
					console.log(favoriteList);
					response.set('favorites', favoriteList);
					response.save(null, {
						success	:	function (success) {
							console.log(success);

							console.log($scope.allUsers);
							loadWithFavorites($scope.allUsers);
						},
						error : function (error) {
							console.log(error);
						}
					})
				},
				error : function (error) {

				}
			});


			if(!$scope.$$phase) $scope.$apply();

		}

		// First get the favorites list and append to the existing list of favorites
		$scope.follow = function(userId) {
			var userTable = Parse.Object.extend('User');
			var userQuery = new Parse.Query(userTable);

			var saveData = new userTable();


			var favoriteList = [];

			// userQuery.equalTo('username', 'admin');
			userQuery.get(loggedinuser, {
				success	:	function (response) {
					var obj = JSON.stringify(response);
					var pobj = JSON.parse(obj);
					console.log(pobj);
					// Get the favorite list of admin
					favoriteList = pobj.favorites || [];
					favoriteList.push(userId);

					response.set('favorites', favoriteList);
					response.save(null, {
						success	:	function (success) {
							console.log(success);

							console.log($scope.allUsers);
							loadWithFavorites($scope.allUsers);
						},
						error : function (error) {
							console.log(error);
						}
					})
				},
				error : function (error) {

				}
			});


			if(!$scope.$$phase) $scope.$apply();


		}



		$scope.states = [];
		$('#country').change(function () {

			console.log($(this).val());
			var country = $(this).val().trim();
			if(country[0] !== '?') {
				if(country === 'USA') {
					$('#states').show();
					$scope.states = ['California', 'Mexico', 'Canada', 'Virginia', 'Oregon']
				}
				else {
					$('#states').hide();
				}
			}
		});

		$('select').change(function () {
			var select = $(this).val().trim();
			var selectId = $(this).attr('id');
			if(selectId == 'gpa') {
				if(select == 'Above')
					$scope.gpaAbove = true;
				else {
					$scope.gpaAbove = false;
				}
			}
			if(selectId == 'act') {
				if(select == 'Above') {
					$scope.actAbove = true;
				}
				else {
					$scope.actAbove = false;
				}
			}
			if(selectId == 'sat') {
				if(select == 'Above') {
					$scope.satAbove = true;
				}
				else {
					$scope.satAbove = false;
				}
			}
			console.log($(this).attr('id'));
			console.log($scope.query.interested_colleges);

		});






		var country, state, gpa, act, sat, interests, colleges, condition = '';
		var sgpa, egpa, sact, eact, ssat, esat;


		function unique(list) {
			list = list.filter(function(n){ return n != null });
			return list;
		}

		$scope.reset = function () {
			// $scope.allUsers = [];
			$scope.query = {};
			loadAllData();
			// loadWithFavorites($scope.allUsers);
		}

		$scope.filtername = '';
		$scope.warning = '';
		$scope.saveFilter = function () {
			var filterName = $scope.filtername;
			var country = '';
			var state = '';
			var gpa = '';
			var sgpa = '';
			var egpa = '';
			var interested_field = '';
			var interested_colleges = '';
			var sact = '';
			var eact = '';
			var act = '';
			var ssat = '';
			var esat = '';
			var filter = {};

			var filterObject = Parse.Object.extend('Filters');
			var	filterClass = new filterObject();
			// var userQuery = new Parse.Query(userTable);


			if($scope.query.country !== undefined) {
				country = $scope.query.country.trim();
				filter.country = country;
			}

			if($scope.query.state !== undefined) {
				state = $scope.query.state.trim();
				filter.state = state;
			}

			if($scope.query.gpa !== undefined) {
				gpa = $scope.query.gpa.trim();
				filter.gpa = gpa;
			}
			else if($scope.query.start_gpa !== undefined && $scope.query.end_gpa !== undefined){
				sgpa = $scope.query.start_gpa;
				egpa = $scope.query.end_gpa;
				filter.start_gpa = sgpa;
				filter.end_gpa = egpa;
			}

			if($scope.query.act !== undefined) {
				act = $scope.query.act.trim();
				filter.act = act;
			}
			else if($scope.query.start_act !== undefined && $scope.query.end_act !== undefined){
				sact = $scope.query.start_act;
				eact = $scope.query.end_act;
				filter.start_act = sact;
				filter.end_act = eact;
			}
			if($scope.query.sat !== undefined) {
				sat = $scope.query.sat.trim();
				filter.sat = sat;
			}
			else if($scope.query.start_sat !== undefined && $scope.query.end_sat !== undefined) {
				ssat = $scope.query.start_sat;
				esat = $scope.query.end_sat;
				filter.start_sat = ssat;
				filter.end_sat = esat;
			}
			if($scope.query.interested_field !== undefined) {
				interested_field = $scope.query.interested_field;
				filter.interested_field = interested_field;
			}
			// console.log($scope.query.interested_colleges);
			if($scope.query.interested_colleges !== undefined) {
				interested_colleges = $scope.query.interested_colleges.trim();
				filter.interested_colleges = interested_colleges;
			}

			if(filterName.trim() !== '') {
				var userTable = Parse.Object.extend('Filters');
				var userQuery = new Parse.Query(userTable);
				var filterExists = false;
				userQuery.find({
					success : function (response) {
						console.log(response);
						var obj = JSON.stringify(response);
						var pobj = JSON.parse(obj);
						console.log(pobj);
						pobj.forEach(function (filter) {
							if(filter.name === filterName.trim()) {
								filterExists = true;
							}
						});
						if(filterExists == true) {
							$scope.$apply(function () {
								$scope.warning = "Filter already exists";
							});
							$('#alertModal').show();
						}
						else {
							filterClass.set('name', filterName);
							filterClass.set('filter', filter);
							filterClass.save(null, {
								success : function (response) {
									console.log(response);
								},
								error : function (error) {
									console.log(error);
								}
							});

							$scope.filtername = '';
							$scope.$apply(function () {
								loadCustomFilters();
							})

						}

					},
					error : function (error) {

					}
				})
			}
			else {
				$scope.warning = "Filter can't be blank";
				$('#alertModal').show();
			}



		}

		$scope.sortByFilter = function () {
			var custom_filter = $scope.custom_filter.trim();
			console.log(custom_filter);
			var filterObject = Parse.Object.extend('Filters');
			var filterQuery = new Parse.Query(filterObject);
			var filters = {};

			filterQuery.equalTo('name', custom_filter);

			filterQuery.find({
				success : function (response) {
					var object = JSON.stringify(response);
					var pObject = JSON.parse(object);
					console.log(pObject);
					filters = pObject[0].filter;
					console.log(filters);
					sortCustomFilter();
				},
				error : function (error) {
				}
			});

			function sortCustomFilter() {
				$scope.allUsers = [];
				$scope.allUsers = tempUsers;

				$scope.allUsers = unique($scope.allUsers);

				$scope.allUsers.forEach(function (data, index) {


					if(filters.country !== undefined) {
						console.log('here');
						country = filters.country.trim();
						console.log(country);
						if(country != '') {
							$scope.allUsers.forEach(function (data, index) {
								if(country !== data.country) {
									$scope.allUsers[index] = null;
								}

							});
							$scope.allUsers = unique($scope.allUsers);
						}
					}

					if(filters.state !== undefined) {
						state = filters.state.trim();
						if(state != '') {
							$scope.allUsers.forEach(function (data, index) {
								if(state !== data.state)
									$scope.allUsers[index] = null;
							});
							$scope.allUsers = unique($scope.allUsers);
						}
					}

					if(filters.gpa !== undefined) {
						gpa = filters.gpa.trim();
						console.log(gpa);

							$scope.allUsers.forEach(function (data, index) {
								if(data !== undefined && data !== null) {
									if(data.gpa === undefined || data.gpa === '' || data.gpa < gpa) {
										console.log(data.gpa);
										$scope.allUsers[index] = null;
									}
								}
							});
							$scope.allUsers = unique($scope.allUsers);
							console.log($scope.allUsers);

					}
					else if(filters.start_gpa !== undefined && filters.end_gpa !== undefined){
						sgpa = filters.start_gpa;
						egpa = filters.end_gpa;
						$scope.allUsers.forEach(function (data, index) {
							if(data !== undefined && data != null) {
								if(data.gpa === undefined) {
									$scope.allUsers[index] = null;
								}
								else if(!(parseInt(data.gpa.trim()) > parseInt(sgpa.trim()) && parseInt(data.gpa.trim()) < parseInt(egpa.trim()))) {
									// console.log(data.gpa > sgpa && data.gpa < egpa);
									$scope.allUsers[index] = null;
								}

							}
						});
						$scope.allUsers = unique($scope.allUsers);
					}



					if(filters.act !== undefined) {
						act = filters.act.trim();
						$scope.allUsers.forEach(function (data, index) {
							if(data !== undefined && data !== null) {
								if(data.act === undefined || data.act === '') {
									$scope.allUsers[index] = null;
								}
								else if(data.act.trim() < act) {
									$scope.allUsers[index] = null;
								}
							}
						});
						$scope.allUsers = unique($scope.allUsers);
					}
					else if(filters.start_act !== undefined && filters.end_act !== undefined){
						sact = filters.start_act;
						eact = filters.end_act;
						$scope.allUsers.forEach(function (data, index) {
							if(data !== undefined && data !== null) {
								if(data.act === undefined) {
									$scope.allUsers[index] = null;
								}
								else if(!(parseInt(data.act.trim()) > parseInt(sact.trim()) && parseInt(data.act.trim()) < parseInt(eact.trim()))) {
									$scope.allUsers[index] = null;
								}
							}
						});
						$scope.allUsers = unique($scope.allUsers);
					}



					if(filters.sat !== undefined) {
						sat = filters.sat.trim();

							$scope.allUsers.forEach(function (data, index) {
								if(data !== undefined) {
									if(data.sat === undefined || data.sat === '') {
										$scope.allUsers[index] = null;
									}
									else if(data.sat < sat) {
										$scope.allUsers[index] = null;
									}
								}
							});
							$scope.allUsers = unique($scope.allUsers);
							console.log($scope.allUsers);

					}
					else if(filters.start_sat !== undefined && filters.end_sat !== undefined) {
						ssat = filters.start_sat;
						esat = filters.end_sat;
						$scope.allUsers.forEach(function (data, index) {
							if(data !== undefined && data !== null) {
								if(data.sat === undefined) {
									$scope.allUsers[index] = null;
								}
								else if( !(parseInt(data.sat) > parseInt(ssat.trim()) && parseInt(data.sat) < parseInt(esat.trim())) ) {
									$scope.allUsers[index] = null;
								}
							}
						});
						$scope.allUsers = unique($scope.allUsers);
					}




					if(filters.interested_field !== undefined) {
						$scope.allUsers.forEach(function (data, index) {
							if(data !== undefined && data !== null) {
								if(data.primarytag === undefined || data.primarytag === '') {
									$scope.allUsers[index] = null;
								}
								else if(data.primarytag.trim() !== filters.interested_field.trim()) {
									$scope.allUsers[index] = null;
								}
							}
						});
						$scope.allUsers = unique($scope.allUsers);
					}

					if(filters.interested_colleges !== undefined) {
						$scope.allUsers.forEach(function (data, index) {
							if(data !== undefined && data !== null) {
								if(data.interested_colleges === undefined || data.interested_colleges === '') {
									$scope.allUsers[index] = null;
								}
								else if(data.interested_colleges.trim() !== filters.interested_colleges.trim()) {
									$scope.allUsers[index] = null;
								}
							}
						});
						$scope.allUsers = unique($scope.allUsers);
					}
				});
				if(!$scope.$$phase) $scope.$apply();
				console.log($scope.allUsers);
			}

		}

		$scope.sort = function () {
					$scope.allUsers = [];
					$scope.allUsers = tempUsers;

					$scope.allUsers = unique($scope.allUsers);
					$scope.allUsers.forEach(function (data, index) {


						if($scope.query.country !== undefined) {
							console.log('here');
							country = $scope.query.country.trim();
							console.log(country);
							if(country != '') {
								$scope.allUsers.forEach(function (data, index) {
									if(country !== data.country) {
										$scope.allUsers[index] = null;
									}

								});
								$scope.allUsers = unique($scope.allUsers);
							}
						}

						if($scope.query.state !== undefined) {
							state = $scope.query.state.trim();
							if(state != '') {
								$scope.allUsers.forEach(function (data, index) {
									if(state !== data.state)
										$scope.allUsers[index] = null;
								});
								$scope.allUsers = unique($scope.allUsers);
							}
						}

						if($scope.query.gpa !== undefined) {
							gpa = $scope.query.gpa.trim();
							console.log(gpa);

								$scope.allUsers.forEach(function (data, index) {
									if(data !== undefined && data !== null) {
										if(data.gpa === undefined || data.gpa === '' || data.gpa < gpa) {
											console.log(data.gpa);
											$scope.allUsers[index] = null;
										}
									}
								});
								$scope.allUsers = unique($scope.allUsers);
								console.log($scope.allUsers);

						}
						else if($scope.query.start_gpa !== undefined && $scope.query.end_gpa !== undefined){
							sgpa = $scope.query.start_gpa;
							egpa = $scope.query.end_gpa;
							$scope.allUsers.forEach(function (data, index) {
								if(data !== undefined && data != null) {
									if(data.gpa === undefined) {
										$scope.allUsers[index] = null;
									}
									else if(!(parseInt(data.gpa.trim()) > parseInt(sgpa.trim()) && parseInt(data.gpa.trim()) < parseInt(egpa.trim()))) {
										// console.log(data.gpa > sgpa && data.gpa < egpa);
										$scope.allUsers[index] = null;
									}

								}
							});
							$scope.allUsers = unique($scope.allUsers);
						}



						if($scope.query.act !== undefined) {
							act = $scope.query.act.trim();

							$scope.allUsers.forEach(function (data, index) {
								if(data !== undefined && data !== null) {
									if(data.act === undefined || data.act === '') {
										$scope.allUsers[index] = null;
									}
									else if(data.act.trim() < act) {
										$scope.allUsers[index] = null;
									}
								}
							});
							$scope.allUsers = unique($scope.allUsers);
						}
						else if($scope.query.start_act !== undefined && $scope.query.end_act !== undefined){
							sact = $scope.query.start_act;
							eact = $scope.query.end_act;
							$scope.allUsers.forEach(function (data, index) {
								if(data !== undefined && data !== null) {
									if(data.act === undefined) {
										$scope.allUsers[index] = null;
									}
									else if(!(parseInt(data.act.trim()) > parseInt(sact.trim()) && parseInt(data.act.trim()) < parseInt(eact.trim()))) {
										$scope.allUsers[index] = null;
									}
								}
							});
							$scope.allUsers = unique($scope.allUsers);
						}



						if($scope.query.sat !== undefined) {
							sat = $scope.query.sat.trim();

								$scope.allUsers.forEach(function (data, index) {
									if(data !== undefined) {
										if(data.sat === undefined || data.sat === '') {
											$scope.allUsers[index] = null;
										}
										else if(data.sat < sat) {
											$scope.allUsers[index] = null;
										}
									}
								});
								$scope.allUsers = unique($scope.allUsers);
								console.log($scope.allUsers);

						}
						else if($scope.query.start_sat !== undefined && $scope.query.end_sat !== undefined) {
							ssat = $scope.query.start_sat;
							esat = $scope.query.end_sat;
							$scope.allUsers.forEach(function (data, index) {
								if(data !== undefined && data !== null) {
									if(data.sat === undefined) {
										$scope.allUsers[index] = null;
									}
									else if( !(parseInt(data.sat) > parseInt(ssat.trim()) && parseInt(data.sat) < parseInt(esat.trim())) ) {
										$scope.allUsers[index] = null;
									}
								}
							});
							$scope.allUsers = unique($scope.allUsers);
						}




						if($scope.query.interested_field !== undefined) {
							$scope.allUsers.forEach(function (data, index) {
								if(data !== undefined && data !== null) {
									if(data.primarytag === undefined || data.primarytag === '') {
										$scope.allUsers[index] = null;
									}
									else if(data.primarytag.trim() !== $scope.query.interested_field.trim()) {
										$scope.allUsers[index] = null;
									}
								}
							});
							$scope.allUsers = unique($scope.allUsers);
						}

						if($scope.query.interested_colleges !== undefined) {
							$scope.allUsers.forEach(function (data, index) {
								if(data !== undefined && data !== null) {
									if(data.interested_colleges === undefined || data.interested_colleges === '') {
										$scope.allUsers[index] = null;
									}
									else if(data.interested_colleges.trim() !== $scope.query.interested_colleges.trim()) {
										$scope.allUsers[index] = null;
									}
								}
							});
							$scope.allUsers = unique($scope.allUsers);
						}



					});

					// console.log($scope.allUsers);
					if(!$scope.$$phase) $scope.$apply();


		}



		$scope.totalFavorites = '';
		$scope.totalList = '';
		function loadWithFavorites(data) {
			var favoriteList = [];
			var array = [];
			console.log(data);
			$scope.totalList = data.length;
			// Clear the 'following' property if present for dashboard refresh
			data.forEach(function (object) {
				if(object.following !== undefined) {
					delete object.following;
				}
			})
			userQuery.equalTo('username', 'admin');
			userQuery.find({
				success	:	function (response) {
					var obj = JSON.stringify(response);
					var pobj = JSON.parse(obj);
					favoriteList = pobj[0].favorites || [];
					$scope.totalFavorites = favoriteList.length || 0;
					console.log(favoriteList);
					if(favoriteList.length > 0) {
						favoriteList.forEach(function (id) {

								data.forEach(function (user) {
									if(user.objectId === id) {
										if(user.following !== undefined) {
											for(var x=0; x<array.length; x++) {
												if(array[x].objectId === id) {
													array[x].following = true;
												}
											}
										}
										else {
											user.following = true;
											array.push(user);
										}

									}

									else {
										if(user.following === undefined) {
											user.following = false;
											array.push(user);
										}

									}

								});

						});
					}
					else {
						data.forEach(function (user) {
							console.log(user);
							user.following = false;
							array.push(user);
						});
					}

					console.log(array);
					array.forEach(function (ele, index) {
						// console.log(ele);
					})

					$scope.$apply(function () {
						$scope.allUsers = array;
					})


				},
				error : function (error) {
					console.log(response);
				}
			})

		}


		function loadAllData() {
			tempUsers = [];
			$scope.users = [];
			var userTable = Parse.Object.extend('User');
			var userQuery = new Parse.Query(userTable);
			userQuery.find({
				success : function(users) {
					users.forEach(function (user) {
						var t = JSON.stringify(user);
						var p = JSON.parse(t);
						if(p.username !== 'admin') {
							if(p.lastactivity !== undefined) {
								console.log(new Date().getTime());
								console.log(new Date(p.lastactivity.iso).getTime());
								console.log(p.lastactivity.iso);
								var timeDiff = Math.abs(new Date().getTime() - new Date(p.lastactivity.iso).getTime());
								var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
								var duration = diffDays + ' Day(s) Ago';
								p.activity = duration;
							}
							$scope.users.push(p);
							tempUsers.push(p);
						}




					});

					loadWithFavorites($scope.users);

					if(!$scope.$$phase) $scope.$apply();


				},
				error : function(error) {
					console.log(error);
				}
			});
		}

		// loadAllData();
		// $scope.loadAllData = loadAllData;

		$scope.multipleFilter = function () {
				return;
		};

	})


	// This controller will handle all 'profile page for admin' related logic.
	.controller('AdminProfileCtrl', function ($scope, $routeParams, User) {

		var kotable = Parse.Object.extend('Kos');

		var koquery = new Parse.Query(kotable);



		var loggedinuser = Parse.User.current();
		var adminId = Parse.User.current();
		var admin_id = adminId.id;

		var adminTable = Parse.Object.extend('User');
		var adminQuery = new Parse.Query(adminTable);

		var favorites = [];

		$scope.userDetails = {};
		$scope.user = {};
		$scope.profile_user = {};
		$scope.userId = $routeParams.id;


		var data = {
			id : $routeParams.id
		}

		var profileUserObject = {};

		function getProfileUser() {
			var adminTable = Parse.Object.extend('User');
			var adminQuery = new Parse.Query(adminTable);


			adminQuery.equalTo('objectId', $routeParams.id);
			adminQuery.find({
				success : function (response) {
					console.log(response[0]);
					profileUserObject = response[0];
				},
				error : function (error) {
					console.log(error);
				}
			})
		}

		getProfileUser();

		function getUserInfo() {
			// For setting up the header details
			User.getCurrentUserDetails()
			.then(function (response) {
				$scope.user = response;
				adminQuery.equalTo('username', 'admin');
				adminQuery.find({
					success	: function (response) {
						console.log(response);
						var obj = JSON.stringify(response);
						var pobj = JSON.parse(obj);
						console.log(pobj);
						favorites = pobj[0].favorites;
						favorites.forEach(function (fav) {
							// console.log(fav + ',' + $scope.user.objectId);
							if(fav === $routeParams.id) {
								$scope.$apply(function () {
										$scope.profile_user.following = true;
								})
							}
							else {
								$scope.$apply(function () {
										$scope.profile_user.following = false;
								})
							}
						})
					},
					error : function (error) {

					}
				});

			})
			.catch(function (error) {

			});
		}






		User.getUserDetail(data)
			.then(function (response) {
				console.log(response);
				$scope.userDetails = response;
				// $scope.user = response;
				$scope.userDetails.cs = response.country + ',' + response.state;
				console.log($scope.userDetails);
				// loggedinuser.id = $routeParams.id;
				koquery.equalTo('user', profileUserObject);
				koquery.find({
					success : function (response) {
						console.log(response);
						var t = JSON.stringify(response);
						var u = JSON.parse(t);
						getUserInfo();
						$scope.$apply(function () {
							$scope.kos = u;
						})
						console.log($scope.kos);
					},
					error : function (error) {
						console.log(error);
					}
				});
			})
			.catch(function (error) {

			});

			// Filter cards by Primary tag
			$('#tag-dropdown').change(function () {
				var tag = $(this).val();
				var loggedinuser = Parse.User.current();
				var kotable = Parse.Object.extend('Kos');

				var koquery = new Parse.Query(kotable);

				koquery.equalTo('user', loggedinuser);
				if(tag.trim() !== 'All Tags')
					koquery.equalTo('primarytag', tag);
				// console.log($scope.userDetails);
				koquery.find({
					success : function (response) {
						console.log(response);
						var t = JSON.stringify(response);
						var u = JSON.parse(t);

						$scope.$apply(function () {
							$scope.kos = u;
							// $scope.kosInGradeLayout();
						})
						console.log($scope.kos);
					},
					error : function (error) {
						console.log(error);
					}
				});
			});




			// Function to format the kos in grade -> kos
			function kosByTagLayout() {

				// fetchUserKos();
				var allKos = $scope.kos;
				var tempKos = $scope.kos;

				// This will have the formatted data. List of kos under each grade
				$scope.sortedKo = [];

				$scope.finalFormattedKos = [];


				var tag = '';
				var object = {};



				console.log(allKos);

				function compare(a,b) {
					if ( String(a.primarytag) > String(b.primarytag) )
						return -1;
					if ( String(a.primarytag) < String(b.primarytag) )
						return 1;
					return 0;
				}

				allKos = allKos.sort(compare);



				console.log(allKos);

				var temp = {

						primarytag : '',
						kos : []

					};

				//var allKosObject;

				var i;


				var array = [];

				for(i=0; i < allKos.length; i++) {

					var allKosObject = allKos[i];

					if(i != 0) {
						if(temp.primarytag == allKosObject.primarytag){
							temp.kos.push(allKosObject);
							if(i==(allKos.length-1)){
								array.push(temp);
								// array[i] = temp;
							}
						}
						else{
							array.push(temp);
							// array[i] = temp;
							temp = {

								primarytag : '',
								kos : []

							};
							temp.primarytag = allKosObject.primarytag;
							temp.kos.push(allKosObject);
							if(i==(allKos.length-1)){
								array.push(temp);
								// array[i] = temp;
							}
						}
					}
					else {

						temp.primarytag = allKosObject.primarytag;
						temp.kos.push(allKosObject);
						if(i==(allKos.length-1)){
								array.push(temp);
								// array[i] = temp;
							}
					}
					// $scope.sortedKo.push(temp);
				}


				$scope.sortedKo = array;
				console.log($scope.sortedKo);




			}

			$scope.kosByTagLayout = kosByTagLayout;


			$scope.snapShot = function () {
				kosByTagLayout();
				$('#snapshot').show();
			}


			$scope.follow = function(userId) {
				var userTable = Parse.Object.extend('User');
				var userQuery = new Parse.Query(userTable);



				var loggedin = Parse.User.current();
				console.log(loggedin);

				var saveData = new userTable();


				var favoriteList = [];

				// userQuery.equalTo('username', 'admin');
				userQuery.get(admin_id, {
					success	:	function (response) {
						console.log(response);
						var obj = JSON.stringify(response);
						var pobj = JSON.parse(obj);
						console.log(pobj.favorites);

						// Get the favorite list of admin
						favoriteList = pobj.favorites || [];
						favoriteList.push(userId);


						response.set('favorites', favoriteList);
						response.save(null, {
							success	:	function (success) {
								console.log(success);
								console.log($scope.allUsers);
								getUserInfo();
							},
							error : function (error) {
								console.log(error);
							}
						})
					},
					error : function (error) {

					}
				});


				if(!$scope.$$phase) $scope.$apply();


			}


			$scope.unFollow = function (userId) {
				var userTable = Parse.Object.extend('User');
				var userQuery = new Parse.Query(userTable);
				var favoriteList = [];

				// userQuery.equalTo('username', 'admin');
				userQuery.get(admin_id, {
					success	:	function (response) {
						var obj = JSON.stringify(response);
						var pobj = JSON.parse(obj);
						console.log(pobj);
						// Get the favorite list of admin
						favoriteList = pobj.favorites;
						console.log(userId);
						console.log(favoriteList);
						var index = favoriteList.indexOf(userId);
						if (index > -1) {
							favoriteList.splice(index, 1);
						}
						console.log(favoriteList);
						response.set('favorites', favoriteList);
						response.save(null, {
							success	:	function (success) {
								console.log(success);
								// console.log($scope.allUsers);
								getUserInfo();
								// $scope.$apply(function () {
								// 	$scope.profile_user.following = false;
								// })
							},
							error : function (error) {
								console.log(error);
							}
						})
					},
					error : function (error) {

					}
				});


				if(!$scope.$$phase) $scope.$apply();

			}

	})
