var last = null;

document.addEventListener("contextmenu", function (e) {
    var elem = e.srcElement;
    if (elem instanceof HTMLImageElement) {
		last = elem;
    }
	else {
		last = null;
	}
}, true);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(request);
	console.log(last);
});
