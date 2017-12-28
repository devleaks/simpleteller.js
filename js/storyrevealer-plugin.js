/*!
 * storyrevealer.js
 * MIT licensed
 *
 * Copyright (C) 2017 Pierre M
 */
var Simpleteller = window.Simpleteller || (function() {
	var config = Reveal.getConfig().storyrevealer || {};
	if (!config.url) {
		console.log("storyrevealer: no url");
		return;
	}
	console.log("storyrevealer: doing "+config.url);
})();