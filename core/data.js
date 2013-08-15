window.ncos = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
	Helpers: {},
	Data: {},
  init: function() {
  	startSpinner();
    ncos.Data.ncos = new ncos.Collections.NCOs();
    ncos.Data.checks = new ncos.Collections.Checks();
    ncos.Data.cases = new ncos.Collections.Cases();
    ncos.Data.sanctions = new ncos.Collections.Sanctions();
    ncos.Data.media = new ncos.Collections.Media();
    ncos.Data.authorities = new ncos.Collections.Authorities();
    ncos.Data.ncos.fetch({async:false});
    ncos.Data.checks.fetch({async:false});
    ncos.Data.cases.fetch({async:false});
    ncos.Data.sanctions.fetch({async:false});
    ncos.Data.media.fetch({async:false});
    ncos.Data.authorities.fetch({async:false});
    ncos.Data.checksShadow = ncos.Data.checks.clone();
    ncos.Data.Stats = {};
    var submissions = _.filter(ncos.Data.checks.fullCollection.models, function(m){ return _.contains(_.pluck(m.attributes.chronology, "state"),"представление"); });
    var warnings = _.filter(ncos.Data.checks.fullCollection.models, function(m){ return _.contains(_.pluck(m.attributes.chronology, "state"),"предостережение"); });
    var cases = _.filter(ncos.Data.checks.fullCollection.models, function(m){ return _.contains(_.pluck(m.attributes.chronology, "state"),"административное дело"); });
    var suspended = _.filter(ncos.Data.checks.fullCollection.models, function(m){ return _.contains(_.pluck(m.attributes.chronology, "state"),"приостановление деятельности"); });
    var other = _.filter(ncos.Data.checks.fullCollection.models, function(m){ 
    	var values = _.pluck(m.attributes.chronology, "state");
    	var result = true;
    	for (var i=0;i<values.length;i++) {
    		result = result && _.contains(['предостережение','представление','административное дело','приостановление деятельности','',null],values[i]);
    	}
			return !result; 
		});
    ncos.Data.Stats.submissions = new ncos.Collections.NCOs(submissions);
    ncos.Data.Stats.warnings = new ncos.Collections.NCOs(warnings);
    ncos.Data.Stats.cases = new ncos.Collections.NCOs(cases);
    ncos.Data.Stats.suspended = new ncos.Collections.NCOs(suspended);
    ncos.Data.Stats.other = new ncos.Collections.NCOs(other);
    ncos.Data.Stats.cities = _.uniq(ncos.Data.ncos.fullCollection.pluck('locality'));
    stopSpinner();
    ncos.root = '/Closed-Society/'
    ncos.rooter = new ncos.Routers.Main();
    Backbone.history.start({ pushState: true, root: ncos.root });
  },
  root: '/'
};

$(document).ready(function(){
  ncos.init();
  if ($(window).height() < 500) {
  	$(".branding").hide();
  }
  $(window).resize(function() {
  	if ($(window).height() < 500) {
  		$(".branding").hide();
  	} else {
  		$(".branding").show();
  	}
  });
	$("li.menu").on('touchstart', function(){ 
    	$(this).addClass("touch");
  });
  $("li.menu").on('touchend', function(){
       $(this).removeClass("touch");
  });
  $('ul.sidebar-menu .comingsoon').hover(
  	function () {
    	$(this).css('opacity','0.7');
    	$(this).children('label').css('opacity','0.2');
    	$(this).children('small').css('opacity','0.2');
    	$(this).children('span').css('opacity','1');
  	}, 
  	function () {
    	$(this).css('opacity','0.3');
    	$(this).children('label').css('opacity','1');
    	$(this).children('small').css('opacity','1');
    	$(this).children('span').css('opacity','0');
  	}
	);
});

setTab = function(s) {
	$('li.active').removeClass('active');
  $('#' + s).addClass('active');
};

setButton = function(s) {
	$('.btn.active').removeClass('active');
  $('button[data-section="' + s + '"]').addClass('active');
};

startSpinner = function() {
	var opts = {
  	lines: 15, // The number of lines to draw
  	length: 29, // The length of each line
  	width: 5, // The line thickness
  	radius: 40, // The radius of the inner circle
  	corners: 1, // Corner roundness (0..1)
  	rotate: 18, // The rotation offset
  	direction: 1, // 1: clockwise, -1: counterclockwise
  	color: '#fff', // #rgb or #rrggbb
  	speed: 1, // Rounds per second
  	trail: 60, // Afterglow percentage
  	shadow: true, // Whether to render a shadow
  	hwaccel: false, // Whether to use hardware acceleration
  	className: 'spinner', // The CSS class to assign to the spinner
  	zIndex: 2e9, // The z-index (defaults to 2000000000)
  	top: 'auto', // Top position relative to parent in px
  	left: 'auto' // Left position relative to parent in px
	};
	var target = document.getElementById('loader');
	$(target).fadeIn('slow');
	var spinner = new Spinner(opts).spin(target);
}

stopSpinner = function() {
	var target = document.getElementById('loader');
	$(target).fadeOut('slow');
}

var ClickableRow = Backgrid.Row.extend({
  events: {
    "click": "onClick"
  },
  onClick: function (e) {
  	if(e.target.className == 'string-cell' || e.target.className == 'moment-cell') {
    	Backbone.trigger("rowclicked", this.model);
    }
  }
});

Backbone.on("rowclicked", function (model) {
  ncos.rooter.navigate('/data/' + model.page + '/' + model.id, {trigger: true});
});


var ncoFilter = Backgrid.Extension.ClientSideFilter.extend({
	makeMatcher: function (query) {
  	var regexp = new RegExp(query.trim().split(/^((http|https):\/\/)?[a-zа-я0-9]+([\-\.]{1}[a-zа-я0-9]+)*\.[a-zа-я]{2,5}(:[0-9]{1,5})?(\/.*)?$/).join("|"), "i");
    return function (model) {
    	var keys = this.fields || model.keys();
    	for (var i = 0, l = keys.length; i < l; i++) {
    		if (regexp.test(model.get(keys[i]) + "")) return true;
    	}
    	return false;
   	};
  }
});

  /**
  	 ClientSideSelectFilter
  **/

var ClientSideSelectFilter = Backgrid.Extension.ClientSideSelectFilter = Backgrid.Extension.ClientSideFilter.extend({
	
	className: "backgrid-filter form-select",
	
	template: _.template('<div class="input-prepend input-append"><select title="<%- placeholder %>" class="selectpicker <%- field %>" style="width:300px"><% _.each(values, function(opt) { %><option value="<%= opt %>"><%= opt %></option><% }); %></select><span class="add-on"><a class="close" href="#">&times;</a></span></div>'),
		
	events: {
		"click .close": function (e) {
      e.preventDefault();
      this.clear();
    },
		"change .selectpicker": "search",
		"click li[rel=0]": function (e) {
      this.clear();
    },
	},
		
	fields: null,
		
	initialize: function(options) {
		Backgrid.Extension.ClientSideFilter.prototype.initialize.apply(this, arguments);
		this.selectValues = _.chain(options.collection.pluck(options.fields)).flatten().uniq().value();
		this.selectValues.sort();
		if (_.contains(this.selectValues,'город Москва')) {
			arrayMoveToFirst(this.selectValues,'город Санкт-Петербург');
			arrayMoveToFirst(this.selectValues,'город Москва');
			arrayMoveToFirst(this.selectValues,'');
		}
		if (!_.contains(this.selectValues,'')) {
			this.selectValues.unshift('');
		}
		if (_.contains(this.selectValues,undefined)) {
			delete this.selectValues[this.selectValues.indexOf(undefined)];
		}
	},
		
	makeMatcher: function (query) {
    return function (model) {
      var keys = this.fields;
      if(_.isArray(model.get(keys))) {
      	for (var i = 0, l = query.length; i < l; i++) {
        	if (_.contains(model.get(keys), query)) return true;
      	}
      } else {
      	if (query == model.get(keys)) return true;
      }
      return false;
    };
  },

    /**
       Takes the query from the search box, constructs a matcher with it and
       loops through collection looking for matches. Reset the given collection
       when all the matches have been found.
    */
  search: function () {
    var matcher = _.bind(this.makeMatcher($(this.$el[0][0]).val()), this);
    this.collection.reset(this.shadowCollection.filter(matcher), {reindex: false});
  },

    /**
       Clears the search box and reset the collection to its original.
    */
  clear: function () {
    $(this.$el[0][0]).selectpicker('deselectAll');
    this.collection.reset(this.shadowCollection.models, {reindex: false});
  },
    
        /**
       Renders a search form with a text box, optionally with a placeholder and
       a preset value if supplied during initialization.
    */
  render: function () {
    this.$el.empty().append(this.template({
      name: this.name,
      placeholder: this.placeholder,
      values: this.selectValues,
      field: this.fields
    }));
    $(this.$el[0][0]).selectpicker({
      width: '220px'
    });
    this.delegateEvents();
    return this;
  }
});

arrayMoveToFirst = function(array, name) {
	array.unshift(array.splice(array.indexOf(name),1)[0]);
};

changePropName = function(obj,prop1,prop2) {
	obj[prop2] = obj[prop1];
	if (_.isNull(obj[prop1])) {obj[prop2] = ''}
	delete obj[prop1];
}

/**
* Converts a value to a string appropriate for entry into a CSV table.  E.g., a string value will be surrounded by quotes.
* @param {string|number|object} theValue
* @param {string} sDelimiter The string delimiter.  Defaults to a double quote (") if omitted.
*/
function toCsvValue(theValue, sDelimiter) {
	var t = typeof (theValue), output;
 
	if (typeof (sDelimiter) === "undefined" || sDelimiter === null) {
		sDelimiter = '"';
	}
 
	if (t === "undefined" || t === null) {
		output = "";
	} else if (t === "string") {
		output = sDelimiter + theValue + sDelimiter;
	} else {
		output = String(theValue);
	}
 
	return output;
}
 
/**
* Converts an array of objects (with identical schemas) into a CSV table.
* @param {Array} objArray An array of objects.  Each object in the array must have the same property list.
* @param {string} sDelimiter The string delimiter.  Defaults to a double quote (") if omitted.
* @param {string} cDelimiter The column delimiter.  Defaults to a comma (,) if omitted.
* @return {string} The CSV equivalent of objArray.
*/
function toCsv(objArray, sDelimiter, cDelimiter) {
	var i, l, names = [], name, value, obj, row, output = "", n, nl;
 
	// Initialize default parameters.
	if (typeof (sDelimiter) === "undefined" || sDelimiter === null) {
		sDelimiter = '"';
	}
	if (typeof (cDelimiter) === "undefined" || cDelimiter === null) {
		cDelimiter = ",";
	}
 
	for (i = 0, l = objArray.length; i < l; i += 1) {
		// Get the names of the properties.
		obj = objArray[i];
		row = "";
		if (i === 0) {
			// Loop through the names
			for (name in obj) {
				if (obj.hasOwnProperty(name)) {
					names.push(name);
					row += [sDelimiter, name, sDelimiter, cDelimiter].join("");
				}
			}
			row = row.substring(0, row.length - 1);
			output += row;
		}
 
		output += "\n";
		row = "";
		for (n = 0, nl = names.length; n < nl; n += 1) {
			name = names[n];
			value = obj[name];
			if (n > 0) {
				row += ";"
			}
			row += toCsvValue(value, '"');
		}
		output += row;
	}
 
	return output;
}