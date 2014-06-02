var doc = window.document;

// Selection

function $id(id) { // id: String - element id
	return doc.getElementById(id);
}

function $q(q) { // q: String - selector query
	return doc.querySelector(q);
}

function $qAll(q) { // q: String - selector query
	return doc.querySelectorAll(q);
}

// Manipulation

function $el(el, c, id) { // el: String - html element
	var n = doc.createElement(el);
	if (c) n.className = c;
	if (id) n.id = id;
	return n;
}

function $append(par, chi) { // par: DOM Node - the container/parent, chi: DOM Node or String - the appendee/child
	if (typeof chi === "string") {
		var el = $el("div");
		el.innerHTML = chi;
		while (el.childNodes.length > 0) {
			par.appendChild(el.childNodes[0]);
		}
	} else {
		par.appendChild(chi);
	}
}

function $prepend(par, chi) { // par: DOM Node - the container/parent, chi: DOM Node or String - the prependee/child
	if (typeof chi === "string") {
		var el = $el("div");
		el.innerHTML = chi;
		while (el.childNodes.length > 0) {
			par.insertBefore(el.childNodes[0], par.childNodes[0]);
		}
	} else {
		par.insertBefore(chi, par.childNodes[0]);
	}
}

function $html(el, html) {
	el.innerHTML = html;
}

function $empty(el) {
	$html(el, "");
}

function $text(el, s) {
	el.textContent = s;
}

function $remove(el) {
	if (el) el.parentNode.removeChild(el);
}

// Classes

function $addClass(el, c) {
	if (el) el.classList.add(c);
}

function $removeClass(el, c) {
	if (el) el.classList.remove(c);
}

// Events

function clickable(el, delegatedSelector, callback) {
	el.addEventListener("click", function(e) {
		var del = delegation(e, delegatedSelector);
		if (del.found) {
			e.preventDefault();
			callback(del.target);
		}
	});
}

function delegate(el, delegatedSelector, eventName, callback) {
	el.addEventListener(eventName, function(e) {
		var del = delegation(e, delegatedSelector);
		if (del.found) {
			callback(del.ev, del.target);
		}
	});
}

function delegation(e, selector) {
	var currentTarget = e.target,
		found = false,
		isID = selector.charCodeAt(0) === 35, // #
		keyword = selector.substring(1);
	while (currentTarget) {
		var discriminator = false;
		if (isID) {
			discriminator = currentTarget.id === keyword;
		} else {
			if (currentTarget.className) {
				discriminator = currentTarget.className.split(" ").indexOf(keyword) >= 0;
			}
		}
		if (discriminator) {
			found = true;
			break;
		} else {
			currentTarget = currentTarget.parentNode;
		}
	}
	return {
		"found": found,
		"target": currentTarget,
		"ev": e
	};
}
