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


var screen = {
	container: document.querySelector("#screens .img"),
	current: 2,
	max: 3,
	switch: function() {
		var next = screen.current + 1;
		if (next > screen.max || (next >= 3 && !screen.isWide())) {
			next = 1;
		}

		screen.container.classList.remove("slide-in");
		// Reset Animations
		screen.container.offsetWidth = screen.container.offsetWidth;
		// Switch Screens
		screen.container.classList.remove("screen" + screen.current);
		screen.container.classList.add("screen" + next);
		screen.current = next;
		screen.slideIn();
	},
	slideIn: function() {
		screen.container.classList.add("slide-in");
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

	if (screen.isWide()) {
		var p3 = document.createElement("span");
		p3.className = "preload";
		p3.classList.add("screen3");
		document.body.appendChild(p3);
	}
}

function loadAnim() {
	screen.slideIn();
	screen.container.addEventListener("click", function() {
		screen.switch();
	});

	preloadScreens();
}