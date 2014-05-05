document.addEventListener("contextmenu", function (e) {
    var elem = e.srcElement;
    if (elem instanceof HTMLImageElement) {
        var img = {
            src: elem.src,
            alt: elem.alt,
            height: elem.height,
            width: elem.width
        }
		console.log(elem);
    }
}, true);
