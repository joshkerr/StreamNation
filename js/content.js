var auth;
var last = null;

$.ajaxSetup({
	headers: { 'X-API-Version' : '1.1' }
});

document.addEventListener("contextmenu", function (e) {
	var elem = e.srcElement;
	if (elem instanceof HTMLImageElement) {
		last = elem;
	}
	else {
		last = null;
	}
}, true);


function reloadAuth() {
	chrome.storage.sync.get('StreamNationAuth', function (result) {
		if (result === null || isEmpty(result) || result.StreamNationAuth === null) {
			auth = null;
		}
		else {
			auth = result.StreamNationAuth;
		}
	});
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	reloadAuth();
	if (auth && auth.auth_token && (last.src.indexOf("http://") === 0 || last.src.indexOf("https://") === 0)) {

		$.ajax({
			method: 'POST',
			url: 'https://api.streamnation.com/api/v1/weblink/download',
			data: {
				auth_token: auth.auth_token,
				uri: last.src
			},
			dataType: 'json',
			success: function (res) {
				console.log(res);
			},
			error: function (err) {
				console.log(err);
			}
		});
	}
});

function isEmpty (obj) {
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			return false;
		}
	}
	return true;
};

$(document).ready(function() {

	var url;
	reloadAuth();

	/* YT */
	$('.html5-video-player .ytp-button-watch-later').after('<div class="ytp-button yt-stream-nation-button" role="button" aria-label="StreamNation"><img class="stream-nation-icon" src="'+chrome.extension.getURL('img/icon25.png')+'"></div>');

	$('.yt-stream-nation-button').click(function() {

		$('.yt-stream-nation-button').html('<img class="stream-nation-icon" src="'+chrome.extension.getURL('img/littleloader.gif')+'">');
		$.ajax({
			method: 'POST',
			url: 'https://api.streamnation.com/api/v1/weblink/download',
			data: {
				auth_token: auth.auth_token,
				uri: document.URL
			},
			dataType: 'json',
			success: function (res) {
				$('.yt-stream-nation-button').html("");
				$('.yt-stream-nation-button').addClass('ytp-button-watch-later html5-async-success yt-stream-next').removeClass('yt-stream-nation-button');
			},
			error: function (err) {
				$('.yt-stream-nation-button').html("");
				$('.yt-stream-nation-button').addClass('ytp-button-watch-later html5-async-error yt-stream-next').removeClass('yt-stream-nation-button');
			}
		});
	});

});
