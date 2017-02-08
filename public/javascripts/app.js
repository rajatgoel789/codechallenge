var app = angular.module('app', ['angularLazyImg']);

app.controller('ImgCtrl', function($scope, $http) {



	$scope.fetchImages = function(folder) {
		var folderName = folder ? folder : "";
		$http({
			method: 'GET',
			url: "/users/readFiles/" + folderName
		}).then(function(resp) {
			console.log("succ resp", resp);
			if (resp.status == 200) {

				$scope.ImageData = resp.data.data
			}
		}, function(err) {
			console.log("succ resp", err);
		});
	}


	$scope.deleteImage = function(id,filename,folder) {
		var folderName = folder ? folder : "";
		console.log(id)
		$http({
			method: 'DELETE',
			url: "/users/delete/"+filename+"/"+folderName,
			params: {'id': id}
		}).then(function(resp) {
			console.log("succ resp", resp);
			if (resp.status == 200) {

				$scope.ImageDataNew =[];
				$scope.ImageData.forEach(function(value){
					if(value.id != id){
						$scope.ImageDataNew.push(value);
					}
				})

				$scope.ImageData = $scope.ImageDataNew;
			}
		}, function(err) {
			console.log("succ resp", err);
		});
	}

	$scope.fetchImages();

});