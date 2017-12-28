/*!
 * simpleteller.js
 * MIT licensed
 *
 * Copyright (C) 2017 Pierre M
 */
var Simpleteller = window.Simpleteller || (function() {
	var config = Reveal.getConfig().simpleteller || {};
	if (!config.url) {
		console.log("simpleteller: no url");
		return;
	}
	console.log("simpleteller: doing "+config.url);
})();