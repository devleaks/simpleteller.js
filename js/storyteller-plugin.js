/*!
 * storyteller.js
 * MIT licensed
 *
 * Copyright (C) 2017 Pierre M
 */
var Storyteller = window.Storyteller || (function() {
	var config = Reveal.getConfig().storyteller || {};
	if (!config.url) {
		console.log("storyteller: no url");
		return;
	}
	console.log("storyteller: doing "+config.url);
})();