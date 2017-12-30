/*!
 * storyrevealer.js
 * MIT licensed
 *
 * Copyright (C) 2017 Pierre M
 */
(function( root, factory ) {
	if( typeof define === 'function' && define.amd ) {
		// AMD. Register as an anonymous module.
		define( function() {
			root.Storyrevealer = factory();
			return root.Storyrevealer;
		} );
	} else if( typeof exports === 'object' ) {
		// Node. Does not work with strict CommonJS.
		module.exports = factory();
	} else {
		// Browser globals.
		root.Storyrevealer = factory();
	}
}( this, function() {

	'use strict';

	var Storyrevealer;

	// The reveal.js version
	var VERSION = '1.0.0';
	
	var CONTENT_TYPE_ELEM = {
		"above-title": "h2",
		"below-title": "h4",
		"byline": "h6",
		"bytitle": "h3",
		"date": "p",
		"editor": "h6",
		"headline": "h1",
		"name": "h1",
		"quote": "q",
		"teaser": "h3",
		"text": "p",
		"title": "h1",
		"under-title": "h4",
		"copyright": "small"
	}
	
	/*
	 *
	 */
	function cleanHTML(str) {
		return sanitizeHtml(str, {
		  allowedTags: [ 'b', 'i', 'em', 'strong', 'a' ],
		  allowedAttributes: {
		    'a': [ 'href' ]
		  }
		})
	}
	
	/*	Generate <table> element and fill it 
	 *
	 */
	function generateTable(table, table_data) {
		var options = table_data.options || {};
		var data = table_data.data;
		
		for(var row = 0; row < data.length; row++) {
			var rowcontainer = table
			if(row == 0 && options.columnheader) { //@todo: make columnheader is the count of column headers?
				rowcontainer = rowcontainer.append("thead")				
			} else if ((row == (data.length - 1)) && options.columnfooter) {
				rowcontainer = rowcontainer.append("tfoot")				
			}
			rowcontainer = rowcontainer.append("tr")
			
			for(var col = 0; col < data[row].length; col++) {
				var colcontainer = rowcontainer.append('td');
				if(col == 0 && options.rowheader) {
					colcontainer.classed("rowheader", true)				
				} else if ((col == (data[row].length - 1)) && options.rowfooter) {
					colcontainer.classed("rowfooter", true)				
				}
				colcontainer.text(data[row][col]);
			}			
		}
	}
	
	/* 	Generate chart object for each chart type
	 *
	 */
	function generateChart(container, chart_data) {
		var data = chart_data.data

		var chart = {}
		chart.type = chart_data.type
		chart.options = chart_data.options
		chart.data = {}

		var columns = []
		var categories = []
		data.forEach(function(line) {
			categories.push(line[0])
			for(var i = 1; i < data[0].length; i++) {
				columns[i-1] = columns[i-1] || []
				columns[i-1].push(line[i])
			}
		})
		//console.log(categories, columns)

		chart.data.labels = categories
		chart.data.datasets = []
		columns.forEach(function(column) {
			chart.data.datasets.push({
				data: column
			})
		})
		//console.log(chart_data, chart)

		container
			.append('canvas')
			.attr('data-chart', chart.type)
			.html('<!-- '+JSON.stringify(chart)+' -->');
	}
	
	/*	Append HTML formatted data content to supplied element
	 *
	 */
	function addContent(elem, data) {
		for (var content in data) {
		    if (data.hasOwnProperty(content)) { // content type is in format title.bold.reverse
				var p = content.split(".");
				var content_type = p[0];
				if(CONTENT_TYPE_ELEM[content_type]) {
					var container = elem.append(CONTENT_TYPE_ELEM[content_type])
						.attr("class", p.join(" "))

					if(p.indexOf("html") > 0) { // easy html injection possible here
						container.html(cleanHTML(data[content]))
					} else {
						container.text(data[content])
					}
				} else {
					switch(content_type) {
						case "notes":
							elem.append("aside")
								.html(cleanHTML(data[content]))
							break;
						case "video":
							elem.attr('data-background-video', data[content])
							break;
						case "transition":
							elem.attr('data-transition', data[content])
							break;
						case "class":
							elem.classed(data[content], true);
							break;
						case "table":
							var container = elem.append("div")
								.attr("class", "table")
								.append("table")
							generateTable(container, data[content]);
							break;
						case "chart":								
							generateChart(elem, data[content])
							break;
						case "mustache":
							elem.attr("class", "mustache").html('<!-- '+JSON.stringify(data[content])+' -->')	
							break;
						/*
						case "progressbar": (text, min, max, value, animated, show_value)
						case "linecounter": (text, start, stop, time)
						*/
						default:
							console.log("Storyrevealer.addContent", "no element for role " + content_type, data)
							break;
					}
				}
		    }
		}
	}
	
	/*	Add <section> to <div class="reveal">.
	 *
	 */
	function addSection(elem, data, add_content) {
		var s = elem.append("section")
		if(data.background) {
			s.attr("data-background", data.background)
		}
		if(data.class) {
			s.classed(data.class, true)
		}
		if(add_content && data.content) {
			addContent(s, data.content)
		}
		return s;
	}
	

	Storyrevealer = {
		VERSION: VERSION,

		generate: function(options) {
			var filename = options.url;

			//console.log("Storyrevealer.show",filename)			
			d3.json(filename, function(error, newspaper) {	// There should only be one newspaper element at the root/top
				var newspaper_elem = d3.select("div.slides")
				
				if(! newspaper_elem) {
					console.log("storyrevealer::load", "div.slides element not found")
					return
				}

				if(error || ! newspaper) {	// Add error page
					var error_elem = newspaper_elem.append("section")
					error_elem.append("h3")
						.text("There was a problem loading "+filename)
					error_elem.append("h1")
						.text("Error")
						.attr("class", "red")
					if(error) {
						error_elem.append("p")
							.append("small")
							.html(cleanHTML(error))
					}
					return
				}				
				
				// Add newspaper cover page
				var newspapercover_elem = addSection(newspaper_elem, newspaper, true)				
				// @todo: Add copyright and publication info
				
				newspaper.stories.forEach(function(story) {	// For each news, news are navigated left to right

					// Add news container section
					var story_elem = addSection(newspaper_elem, story, false)
					
					// Add story cover page
					var storycover_elem = addSection(story_elem, story, true)

					// Add story pages
					story.pages.forEach(function(fact) {	// For each fact in the story
						var fact_elem = addSection(story_elem, fact, false)
						
						if(Array.isArray(fact.content)) {
							var column_elem = fact_elem.append("div")
								.attr("class", "container")
								
							fact.content.forEach(function(column) {
								var container = column_elem.append("div")
												.attr("class", "col")
								addContent(container, column, false)
								//console.log("column", column.title)
							})
						} else {
							addContent(fact_elem, fact.content, false)
							//console.log("fact", fact.content.title)
						}	
					
					})
				})
				
			});			
		}
		
	}


	return Storyrevealer;

}));