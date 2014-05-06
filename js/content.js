var auth;
var config;
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
chrome.storage.sync.get('StreamNationConfig', function (result) {
	if (result === null || isEmpty(result) || result.StreamNationConfig === null) {
	}
	else {
		config = result.StreamNationConfig;
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	reloadAuth();
	if (auth && auth.auth_token && (last.src.indexOf("http://") === 0 || last.src.indexOf("https://") === 0)) {

		$.ajax({
			method: 'POST',
			url: 'https://api.streamnation.com/api/v1/weblink/download',
			data: {
				auth_token: auth.auth_token,
				uri: last.src,
				parent_id: config.images.defaultFolder.id
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
	$('#watch7-subscription-container .yt-uix-button-subscription-container').after('<span class="yt-uix-button-subscription-container youtube-stream-btn active"><button type="button" class="yt-uix-button yt-uix-button-subscribe-branded yt-uix-button-size-default "><img class="yt-uix-button-icon yt-valign-content youtube-success-icon hidden" src="https://s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif"><span class="yt-uix-button-content">StreamNation</span></button></span>');
	$('.youtube-stream-btn.active').click(function() {

		$('.youtube-stream-btn').after('<img class="stream-nation-icon youtube" src="'+chrome.extension.getURL('img/littleloader_w.gif')+'">');
		$.ajax({
			method: 'POST',
			url: 'https://api.streamnation.com/api/v1/weblink/download',
			data: {
				auth_token: auth.auth_token,
				uri: document.URL,
				parent_id: config.videos.defaultFolder.id
			},
			dataType: 'json',
			success: function (res) {
				$('.youtube-success-icon').removeClass('hidden');
				$('.youtube-stream-btn').removeClass('active').addClass('inactive');
				$('.stream-nation-icon').fadeOut();
			},
			error: function (err) {
				console.log(err);
			}
		});
	});

	/* Vimeo */
	$('#clip #info #tools button:last').after('<button type="button" class="btn iconify_up_b js-clip_action_panel_btn vimeo-stream-btn">StreamNation</button>');
	$('.vimeo-stream-btn.iconify_up_b').click(function () {

		$(this).after('<img class="stream-nation-icon vimeo" src="'+chrome.extension.getURL('img/littleloader_w.gif')+'">');
		$.ajax({
			method: 'POST',
			url: 'https://api.streamnation.com/api/v1/weblink/download',
			data: {
				auth_token: auth.auth_token,
				uri: document.URL,
				parent_id: config.videos.defaultFolder.id
			},
			success: function (res) {
				$('.vimeo-stream-btn.iconify_up_b').addClass('inactive follow').removeClass('iconify_up_b');
				$('.vimeo.stream-nation-icon').fadeOut();
			},
			error: function (err) {
				console.log(err);
			}
		});
	});

	/* Dailymotion */
	$('.media-block .sd_user_subscribe').after('<button class="button btn-sm btn-primary dailymotion-stream-btn active"><i class="icon-arrow_up pull-start"></i>StreamNation</button>');
	$('.dailymotion-stream-btn.active').click(function() {

		$(this).after('<img class="stream-nation-icon dailymotion" src="'+chrome.extension.getURL('img/littleloader_w.gif')+'">');
		$.ajax({
			method: 'POST',
			url: 'https://api.streamnation.com/api/v1/weblink/download',
			data: {
				auth_token: auth.auth_token,
				uri: document.URL,
				parent_id: config.videos.defaultFolder.id
			},
			success: function (res) {
				$('.dailymotion-stream-btn').removeClass('active').addClass('inactive');
				$('.dailymotion-stream-btn .icon-arrow_up').addClass('icon-check').removeClass('icon-arrow_up');
				$('.stream-nation-icon.dailymotion').fadeOut();
			},
			error: function (err) {
				console.log(err);
			}
		});
	});

});
