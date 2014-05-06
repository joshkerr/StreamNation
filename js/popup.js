window.onload = function () {

	var auth;
	var	config;
	var current = {};

	$.ajaxSetup({
		headers: { 'X-API-Version' : '1.1' }
	});

	function reloadUI (instant, delog) {
		if (auth) {
			if (!instant) {
				$('.connected').slideUp().fadeIn();
				$('.delogged').slideUp().fadeOut();
			}
			else {
				$('.delogged').hide();
				$('.connected').show();
			}
			$('.connected .username').text(auth.user.first_name);
		}
		else if (delog) {
			$('.delogged').slideDown().fadeIn();
			$('.connected').slideDown().fadeOut();
		}
	}

	chrome.storage.sync.get('StreamNationAuth', function (result) {
		if (result === null || isEmpty(result) || result.StreamNationAuth === null) {
			auth = null;
		}
		else {
			auth = result.StreamNationAuth;
		}
		reloadUI(true);
	});

	chrome.storage.sync.get('StreamNationConfig', function (result) {
		if (result === null || isEmpty(result) || result.StreamNationConfig === null) {
			config.defaultFolder = '/';
		}
		else {
			config = result.StreamNationConfig;
		}
	});

	chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
		current.url = tabs[0].url;
		current.domain = domainName(current.url);
		if (current.domain === 'www.youtube.com' ||
			current.domain === 'www.dailymotion.com' ||
			current.domain === 'vimeo.com' ||
			current.domain === 'www.funnyordie.com' ||
			current.domain === 'www.metacafe.com' ||
			current.domain === 'www.break.com' ||
			current.domain === 'archive.org' ||
			current.domain === 'blip.tv' ||
			current.domain === 'vzaar.com' ||
			current.domain === 'www.ted.com') {
			$('.supportedUpload').fadeIn();
		}
	});

	$('.delogged form').bind('submit', function (e) {

		var inputs = $('.delogged form :input');
		var values = {};

		inputs.each(function () {
			if (this.name) {
				values[this.name] = $(this).val();
			}
		});

		$('.delogged .loader').show();

		$.ajax({
			method: 'POST',
			url: 'https://api.streamnation.com/api/v1/auth',
			data: { identity: values.login, password: values.password },
			dataType: 'json',
			success: function (res) {
				chrome.storage.sync.set({ "StreamNationAuth" : res });
				auth = res;
				$('.delogged .loader').fadeOut();
				$('.delogged form input[type="password"], .delogged form input[type="text"]').val("");
				reloadUI(false);
			},
			error: function (err) {
				$('.message').fadeIn().text("Invalid email or password.");
				setTimeout(function () {
					$('.message').fadeOut();
				}, 3000);
				$('.delogged form input[type="password"]').val("");
				$('.delogged .loader').fadeOut();
			}
		});

		e.preventDefault();
		return false;
	});

	$('.delogbtn').click(function() {
		if (!auth || !auth.auth_token) {
			return ;
		}
		$.ajax({
			method: 'DELETE',
			url: 'https://api.streamnation.com/api/v1/auth',
			data: { auth_token : auth.auth_token },
			dataType: 'json',
			success: function (res) {
				auth = null;
				chrome.storage.sync.set({ "StreamNationAuth" : null });
				reloadUI(true, true);
				$('.main .delogged form input[type="text"]').focus();
			},
			error: function (err) {
				console.log(err);
			}
		});
	});

	$('.supportedUpload').click(function () {

		$.ajax({
			method: 'POST',
			url: 'https://api.streamnation.com/api/v1/weblink/download',
			data: {
				auth_token: auth.auth_token,
				uri: current.url,
				parent_id: config.videos.defaultFolder.id
			},
			dataType: 'json',
			success: function (res) {
				$('.supportedUpload').addClass('inactive').unbind('click');
				$('.message').text("Download started !").fadeIn();
				setTimeout(function () {
					$('.message').fadeOut();
				}, 3000);
			},
			error: function (err) {
				console.log(err);
			}
		});
	});

	$('.options').click(function() {
		chrome.tabs.create({ url: "../options.html" });
	});

	function domainName (url) {
		var findDomain = document.createElement('a');
		findDomain.href = url;
		return findDomain.hostname;
	}

	function isEmpty (obj) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				return false;
			}
		}
		return true;
	}
};
