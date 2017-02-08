var app = angular.module('app', ['angularLazyImg']);

app.controller('ImgCtrl', function($scope, $http) {
	$scope.folder='';


	$scope.filterChange=function(){
		$scope.fetchImages($scope.folder);
	}

	$scope.fetchImages = function(folder) {
		var folderName = folder ? folder : "";
		$scope.folder=folder;
		$http({
			method: 'GET',
			url: "/users/readFiles/" + folderName,
			params: {filter:$scope.userFilter? $scope.userFilter :''}
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
				$scope.fetchArchiveImages();
			}
		}, function(err) {
			console.log("succ resp", err);
		});
	}

	$scope.verifyImage = function(id,data){
		
		console.log(id)
		$http({
			method: 'POST',
			url: "/users/verify/"+id,
		//	data: {'id': id}
		}).then(function(resp) {
			console.log("succ resp", resp);
			if (resp.status == 200) {
					data.counter = data.counter+1			
			}
		}, function(err) {
			console.log("succ resp", err);
		});


	}

	$scope.fetchArchiveImages = function(){

		$http({
			method: 'GET',
			url: "/users/archivedImages/" ,
			params: {filter:$scope.userFilter? $scope.userFilter :''}
		}).then(function(resp) {
			console.log("succ resp", resp);
			if (resp.status == 200) {

				$scope.archiveData = resp.data.data
			}
		}, function(err) {
			console.log("succ resp", err);
		});


	}
	$scope.fetchArchiveImages();	
	$scope.fetchImages();

});