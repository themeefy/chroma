angular.module('chromaApp')
	.factory('User', function ($q) {


		return {


			isLoggedin : function() {
				var currentUser = Parse.User.current();
				if (currentUser) {
				    return true
				} else {
				    return false;
				}
			},


			getCurrentUserDetails : function() {
				var parsedObject;
				var deffered = $q.defer();
				var loggedinuser = Parse.User.current();

				var query = new Parse.Query(Parse.User);

				console.log(loggedinuser);
				query.get(loggedinuser.id, {
					success : function(details) {
						var temp = JSON.stringify(details);
						parsedObject = JSON.parse(temp);
						console.log(parsedObject);
						deffered.resolve(parsedObject);

					},
					error : function (error) {
						console.log(error);
						deffered.reject(parsedObject);
					}
				});

				return deffered.promise;

			},

			// Get user detail based on profile ID
			getUserDetail : function(data) {
				var parsedObject;
				var deffered = $q.defer();
				// var loggedinuser = Parse.User.current();

				var query = new Parse.Query(Parse.User);

				// console.log(loggedinuser);
				query.get(data.id, {
					success : function(details) {
						var temp = JSON.stringify(details);
						parsedObject = JSON.parse(temp);
						deffered.resolve(parsedObject);

					},
					error : function (error) {
						console.log(error);
						deffered.reject(parsedObject);
					}
				});

				return deffered.promise;

			}




		}



	})
