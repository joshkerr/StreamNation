var auth;

angular.module("StreamNation", []);

angular.module("StreamNation").controller("OptionsCtrl", function ($scope, $http) {

	$.ajaxSetup({
		headers: { 'X-API-Version' : '1.1' }
	});

	$scope.library = [];
	$scope.config = {
		videos : {
			defaultFolder : { name : '/', id: null }
		},
		images: {
			defaultFolder : { name : '/', id: null }
		}
	};
	$scope.user = {};
	$scope.oldUser = {};
	$scope.newVideosDefaultFolder = '';
	$scope.newImagesDefaultFolder = '';

	chrome.storage.sync.get('StreamNationAuth', function (result) {
		if (result === null || isEmpty(result) || result.StreamNationAuth === null) {
			auth = null;
		}
		else {
			auth = result.StreamNationAuth;
			$scope.user = auth.user;
			$.extend($scope.oldUser, $scope.user);
			$.ajax({
				method: 'GET',
				url: 'https://api.streamnation.com/api/v1/library',
				data: { auth_token: auth.auth_token },
				success: function (res) {
					angular.forEach(res.library, function (item, key) {
						if (item.type === 'CollectionContent') {
							$scope.library.push(item);
						}
					});
					$scope.$digest();
				}
			});
		}
	});

	//chrome.storage.sync.set({ "StreamNationConfig" : null });
	chrome.storage.sync.get('StreamNationConfig', function (result) {
		if (result === null || isEmpty(result) || result.StreamNationConfig === null) {
		}
		else {
			$scope.config = result.StreamNationConfig;
		}
	});

	$scope.update = function (type) {
		if ($scope.oldUser != $scope.user) {
			var emailsend = ($scope.oldUser.email !== $scope.user.email) ? $scope.user.email : null;
			$.ajax({
				method: 'PUT',
				url: 'https://api.streamnation.com/api/v1/user',
				data: {
					auth_token: auth.auth_token,
					new_email: emailsend,
					first_name: $scope.user.first_name,
					last_name: $scope.user.last_name
				},
				dataType: 'json',
				success: function (res) {
					$.extend($scope.oldUser, $scope.user);
					$scope.$digest();
					chrome.storage.sync.set({ "StreamNationAuth" : auth });
				},
				error: function (err) {
					console.log(err);
				}
			});
		}
	}

	$scope.createVideosFolder = function() {
		if ($scope.newVideosDefaultFolder !== '') {
			$.ajax({
				method: 'POST',
				url: 'https://api.streamnation.com/api/v1/content/collection',
				dataType: 'json',
				data: {
					auth_token: auth.auth_token,
					title: $scope.newVideosDefaultFolder
				},
				success: function (res) {
					$scope.config.videos.defaultFolder.name = $scope.newVideosDefaultFolder;
					$scope.config.videos.defaultFolder.id = res.id;
					$scope.library.push(res.content);
					$scope.newVideosDefaultFolder = '';
					chrome.storage.sync.set({ "StreamNationConfig" : $scope.config });
					$scope.$digest();
				},
				error: function (err) {
					console.log(err);
				}
			});
		}
	};

	$scope.createImagesFolder = function() {
		if ($scope.newImagesDefaultFolder !== '') {
			$.ajax({
				method: 'POST',
				url: 'https://api.streamnation.com/api/v1/content/collection',
				dataType: 'json',
				data: {
					auth_token: auth.auth_token,
					title: $scope.newImagesDefaultFolder
				},
				success: function (res) {
					$scope.config.images.defaultFolder.name = $scope.newImagesDefaultFolder;
					$scope.config.images.defaultFolder.id = res.id;
					$scope.library.push(res.content);
					$scope.newImagesDefaultFolder = '';
					chrome.storage.sync.set({ "StreamNationConfig" : $scope.config });
					$scope.$digest();
				},
				error: function (err) {
					console.log(err);
				}
			});
		}
	};

	$scope.changeDefaultVideos = function (item) {
		if (!item) {
			$scope.config.videos.defaultFolder.name = '/';
			$scope.config.videos.defaultFolder.id = null;
		}
		else {
			$scope.config.videos.defaultFolder.name = item.title;
			$scope.config.videos.defaultFolder.id = item.id;
		}
		chrome.storage.sync.set({ "StreamNationConfig" : $scope.config });
	};

	$scope.changeDefaultImages = function (item) {
		if (!item) {
			$scope.config.images.defaultFolder.name = '/';
			$scope.config.images.defaultFolder.id = null;
		}
		else {
			$scope.config.images.defaultFolder.name = item.title;
			$scope.config.images.defaultFolder.id = item.id;
		}
		chrome.storage.sync.set({ "StreamNationConfig" : $scope.config });
	};

	function isEmpty (obj) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				return false;
			}
		}
		return true;
	}
});
