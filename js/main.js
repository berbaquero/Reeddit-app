setTimeout(function() {
	var hash = window.location.hash;
	if (!hash) window.scrollTo(0, 1);
}, 100);

ajax({
	url: "version.json",
	dataType: "json",
	success: function(data) {
		var message = document.createElement("span"),
			messageText = "\"" + data.update.title + "\" • " + data.update.date;
		if (message.innerText) {
			message.innerText = messageText;
		} else {
			message.textContent = messageText;
		}
		var btn = document.querySelector(".main-button");
		if (btn.innerText) {
			btn.innerText = btn.innerText + " • " + data.version.label;
		} else {
			btn.textContent = btn.textContent + " • " + data.version.label;
		}
		btn.appendChild(message);
	}
});


var screenShot = {
	container: document.querySelector("#screens .img"),
	current: 2,
	max: 3,
	switch: function() {
		var next = screenShot.current + 1;
		if (next > screenShot.max || (next >= 3 && !screenShot.isWide())) {
			next = 1;
		}

		screenShot.container.classList.remove("slide-in");
		// Reset Animations
		screenShot.container.offsetWidth = screenShot.container.offsetWidth;
		// Switch Screens
		screenShot.container.classList.remove("screen" + screenShot.current);
		screenShot.container.classList.add("screen" + next);
		screenShot.current = next;
		screenShot.slideIn();
	},
	slideIn: function() {
		screenShot.container.classList.add("slide-in");
	},
	isWide: function() {
		return window.innerWidth >= 960;
	}
};

function preloadScreens() {
	var p1 = document.createElement("span");
	p1.className = "preload";
	p1.classList.add("screen1");
	document.body.appendChild(p1);

	if (screenShot.isWide()) {
		var p3 = document.createElement("span");
		p3.className = "preload";
		p3.classList.add("screen3");
		document.body.appendChild(p3);
	}
}

function loadAnim() {
	screenShot.slideIn();
	screenShot.container.addEventListener("click", function() {
		screenShot.switch();
	});

	preloadScreens();
}
