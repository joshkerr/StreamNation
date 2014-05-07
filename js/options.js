var auth;

angular.module("StreamNation", []);

angular.module("StreamNation").controller("OptionsCtrl", function ($scope, $http, $window) {

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
	$scope.history = {};
	$scope.newVideosDefaultFolder = '';
	$scope.newImagesDefaultFolder = '';

	function deleteFromHistory (key) {
		$scope.history.splice(key, 1);
		auth.history = $scope.history;
		chrome.storage.sync.set({ "StreamNationAuth" : auth });
	}

	function setExtraInfos (key, title, pictures, parentId) {
		$scope.history[key].title = title;
		var last;
		angular.forEach(pictures, function (pic) {
			if (pic.type === 'thumb_low') {
				last = pic.uri;
			}
		});
		$scope.history[key].thumb = last;
		if (parentId === 0) {
			$scope.history[key].parent = '/';
		}
		else {
			$.ajax({
				method: 'GET',
				url: 'https://api.streamnation.com/api/v1/content/' + parentId,
				dataType: 'json',
				data: { auth_token: auth.auth_token },
				success: function (res) {
					$scope.history[key].parent = res.content.title;
					$scope.$digest();
				},
				error: function (err) {
					console.log(err);
				}
			});
		}
	}

	function extraInfos() {
		angular.forEach($scope.history, function (item, key) {
			$.ajax({
				method: 'GET',
				url: 'https://api.streamnation.com/api/v1/content/' + item.id,
				data: { auth_token: auth.auth_token },
				dataType: 'json',
				success: function (res) {
					setExtraInfos(key, res.content.title, res.content.thumbnails, res.content.parent_id);
					$scope.$digest();
				},
				error: function (err) {
					if (err.status === 404) {
						deleteFromHistory(key);
					}
				}
			});
		});
	}

	chrome.storage.sync.get('StreamNationAuth', function (result) {
		if (result === null || isEmpty(result) || result.StreamNationAuth === null) {
			auth = null;
		}
		else {
			auth = result.StreamNationAuth;
			$scope.user = auth.user;
			$scope.history = auth.history;
			extraInfos();
			$.extend($scope.oldUser, $scope.user);
			$.ajax({
				method: 'GET',
				url: 'https://api.streamnation.com/api/v1/library',
				data: { auth_token: auth.auth_token },
				success: function (res) {
					var defVidOk = false;
					var defImgOk = false;
					angular.forEach(res.library, function (item, key) {
						if (item.type === 'CollectionContent') {
							if (item.id === $scope.config.videos.defaultFolder.id) {
								defVidOk = true;
							}
							if (item.id === $scope.config.images.defaultFolder.id) {
								defImgOk = true;
							}
							$scope.library.push(item);
						}
					});
					if (!defVidOk) {
						$scope.config.videos.defaultFolder = { name: '/', id: null };
					}
					if (!defImgOk) {
						$scope.config.images.defaultFolder = { name: '/', id: null };
					}
					chrome.storage.sync.set({ "StreamNationConfig" : $scope.config });
					$scope.$digest();
				}
			});
		}
	});

	chrome.storage.sync.get('StreamNationConfig', function (result) {
		if (result === null || isEmpty(result) || result.StreamNationConfig === null) {
		}
		else {
			$scope.config = result.StreamNationConfig;
		}
	});

	$scope.viewSource = function (url) {
		$window.open(url);
	};

	$scope.deleteHistory = function () {
		$scope.history = null;
		auth.history = null;
		chrome.storage.sync.set({ "StreamNationAuth" : auth });
	};

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
					$scope.config.videos.defaultFolder.name = res.content.title;
					$scope.config.videos.defaultFolder.id = res.content.id;
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
					$scope.config.images.defaultFolder.name = res.content.title;
					$scope.config.images.defaultFolder.id = res.content.id;
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
