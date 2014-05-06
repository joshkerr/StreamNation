var streamNationContext = null;

var newContext = {
	"title": chrome.i18n.getMessage('ext_name'),
	"contexts": ["image"],
	"onclick": function (info) {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { 'context': 'clicked' });
		});
	}
}

if (streamNationContext) {
	chrome.contextMenus.update(streamNationContext, newContext);
}
else {
	streamNationContext = chrome.contextMenus.create(newContext);
}

function getFileSize (url) {
    if (/^http:\/\//.test(url)) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.overrideMimeType('text/plain; charset=x-user-defined');
        xhr.send(null);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var fsize = null;
                var type = xhr.getResponseHeader('Content-Type');
                var B = xhr.responseText.length;
            }
        }
    }
};
