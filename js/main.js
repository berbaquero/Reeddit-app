setTimeout(function() {
	var hash = window.location.hash;
	if (!hash) window.scrollTo(0, 1);
}, 100);

ajax({
	url: "version.json",
	dataType: "json",
	success: function(data) {
		var message = document.createElement("span");
		message.innerText = "\"" + data.update.title + "\" • " + data.update.date;
		var btn = document.querySelector(".main-button");
		btn.innerText = btn.innerText + " • " + data.version.label;
		btn.appendChild(message);
	}
});