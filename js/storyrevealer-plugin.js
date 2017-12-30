/*!
 * storyrevealer.js
 * MIT licensed
 *
 * Copyright (C) 2017 Pierre M
 */
Reveal.addEventListener('ready', function(){
	var Storyrevealer = window.Storyrevealer || (function() {
		var config = Reveal.getConfig().storyrevealer || {};
		if (!config.url) {
			console.log("storyrevealer: no url");
			return;
		}
	})();

	console.log("storyrevealer: doing "+config.url);

	Storyrevealer.generate(config)
});
