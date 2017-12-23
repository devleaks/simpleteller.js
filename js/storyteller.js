/*!
 * storyteller.js
 * MIT licensed
 *
 * Copyright (C) 2017 Pierre M
 */
(function( root, factory ) {
	if( typeof define === 'function' && define.amd ) {
		// AMD. Register as an anonymous module.
		define( function() {
			root.Storyteller = factory();
			return root.Storyteller;
		} );
	} else if( typeof exports === 'object' ) {
		// Node. Does not work with strict CommonJS.
		module.exports = factory();
	} else {
		// Browser globals.
		root.Storyteller = factory();
	}
}( this, function() {

	'use strict';

	var Storyteller;

	// The reveal.js version
	var VERSION = '1.0.0';
	
	var ROLE_ELEMENT = {
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
	
	/*	Generate <table> element and fill it with 
	 *
	 */
	function generateTable(table, table_data) {
		var options = table_data.options || {};
		var data = table_data.data;
		
		for(var row = 0; row < data.length; row++) {
			var rowcontainer = table
			if(row == 0 && options.columnheader) {
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
	
	/* 
	 *
	 */
	function generateChart(container, chart_data) {
		var options = chart_data.options || {}
		var data = chart_data.data

		var chart;
		switch(options.type) {
			case "bar":
				var columns = []
				var categories = []
				data.forEach(function(line) {
					categories.push(line[0])
					for(var i = 1; i < data[0].length; i++) {
						columns[i-1] = columns[i-1] || []
						var n = columns[i-1]
						if(n.length == 0) n.push("value "+i)
						n.push(line[i])
					}
				})
				//console.log("columns",columns)
				chart = {
				        data: {
				          columns: columns,
				          type: options.type
				        },
						axis: {
						  x: {
						   type: 'category',
						   categories: categories
						  }
						},
				        bar: {
				          width: {
				            ratio: 0.2,
				          },
				        }
				      }
				break;
			case "pie":
			case "line":
			case "step":
				chart = {
				        data: {
				          columns: data,
				          type: options.type
				        }
				      }
				break;
		}
		console.log(options.type, chart)
		container.html('<!-- '+JSON.stringify(chart)+' -->');
	}
	
	/*	Append HTML formatted data content to supplied element
	 *
	 */
	function addContent(elem, data) {
		for (var property in data) {
		    if (data.hasOwnProperty(property)) {
				var p = property.split(".");
				var propname = p[0];
				if(ROLE_ELEMENT[propname]) {
					var container = elem.append(ROLE_ELEMENT[propname])
						.attr("class", p.join(" "))

					if(p.indexOf("html") > 0) {
						container.html(data[property])
					} else {
						container.text(data[property]) // container.html?
					}
				} else {
					switch(propname) {
						case "video":
							elem.attr('data-background-video', data[property])
							console.log("video", data[property])
							break;
						case "transition":
							elem.attr('data-transition', data[property])
							console.log("transition", data[property])
							break;
						case "class":
							elem.classed(data[property], true);
							break;
						case "table":
							var container = elem.append("div")
								.attr("class", "table")
								.append("table")
							generateTable(container, data[property]);
							break;
						case "chart":
							var container = elem.append("div")
								.attr("class", "chart")
								
							generateChart(container, data[property])
							break;
						/*
						case "progressbar": (text, min, max, value, animated, show_value)
						case "linecounter": (text, start, stop, time)
						*/
						default:
							console.log("Storyteller.addContent", "no element for role " + propname)
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
	

	Storyteller = {
		VERSION: VERSION,

		load: function(options) {
			var filename = options.url;

			//console.log("Storyteller.show",filename)			
			d3.json(filename, function(error, newspaper) {	// There should only be one newspaper element at the root/top
				var newspaper_elem = d3.select("div.slides")
				
				if(! newspaper_elem) {
					console.log("storyteller::load", "div.slides element not found")
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
							.html(error)
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

					// Add story facts
					story.facts.forEach(function(fact) {	// For each fact in the story
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


	return Storyteller;

}));