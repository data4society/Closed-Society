window.ncos = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
	Helpers: {},
	Grids: {},
	State: { layoutInitialized: false },
  init: function() {
    ncos.rooter = new ncos.Routers.Main();
    Backbone.history.start({ pushState: true, root: ncos.root });
  },
  root: '/Closed-Society/'
};

$(document).ready(function(){
  $.getJSON('http://api.closedsociety.org/api/stats/checks', function(data) {
		ncos.State.Stats = data[0];
	}).done(function() {
		ncos.init();
	});
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

Backgrid.ClickableRow = Backgrid.Row.extend({
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
  ncos.rooter.navigate('/#data/' + model.page + '/' + model.id, {trigger: true});
});


Backgrid.Extension.ServerSideSearch = Backgrid.Extension.ServerSideFilter.extend({
	initialize: function (options) {
  	Backgrid.requireOptions(options, ["collection"]);
    Backbone.View.prototype.initialize.apply(this, arguments);
    this.name = options.name || this.name;
    this.placeholder = options.placeholder || this.placeholder;

    var collection = this.collection, self = this;
    if (Backbone.PageableCollection &&
        collection instanceof Backbone.PageableCollection &&
        collection.mode == "server") {
    	if(_.isUndefined(collection.queryParams.query)) {
    		collection.queryParams.query = {};
    	}
    	if(this.name.length>1) {
    		var self = this;
    		collection.queryParams.query['$or'] = function () {
    			var value = self.$el.find("input[type=text]").val();
    			if(!_.isEmpty(value)){
    			  var values = [];
    			  _.each(self.name, function(f,key){
    			    values[key] = {};
    			  	values[key][f] = {$regex: value, $options: 'i'};
    			  });
      			return JSON.stringify(values);
      		} else {
      			return null;
      		}
    		}
    	} else {
        collection.queryParams.query[this.name[0]] = function () {
      		var value = self.$el.find("input[type=text]").val();
      		if(!_.isEmpty(value)){
      			return JSON.stringify({ $regex: value, $options: 'i' });
      		} else {
      			return null;
      		}
      	};
      }
    }
  }
});

Backgrid.Extension.ServerSelectFilter = Backgrid.Extension.ServerSideFilter.extend({
  className: "backgrid-filter form-select",
	initialize: function (options) {
  	Backgrid.requireOptions(options, ["collection"]);
    Backbone.View.prototype.initialize.apply(this, arguments);
    this.name = options.name || this.name;
    this.placeholder = options.placeholder || this.placeholder;
    var colUrl = this.collection.url.split( '/' ),
   			colName = colUrl[colUrl.length - 1];
		this.ajaxSettings = {
			multiple: false,
			allowClear: true,
			width: 255,
    	placeholder: this.placeholder,
      minimumInputLength: 0,
      initSelection : function (element, callback) {
        var data = {id: element.val(), value: element.val()};
        callback(data);
    	},
      ajax: {
      	url: 'http://api.closedsociety.org/api/distinct/' + colName + '/' + this.name,
        dataType: 'json',
        quietMillis: 100,
        data: function (term, page) { // page is the one-based page number tracked by Select2
        	return {
          	query: term, //search term
            page_limit: 10, // page size
            page: page // page number
          }
        },
        results: function (data, page) {
          return {results: data.results};
        }
      },
      formatResult: function (r) { return r.value; },
      formatSelection: function (r) { return r.value; },
      dropdownCssClass: "bigdrop",
      escapeMarkup: function (r) { return r; }
    }
    var collection = this.collection, self = this;
    if (Backbone.PageableCollection &&
        collection instanceof Backbone.PageableCollection &&
        collection.mode == "server") {
    	if(_.isUndefined(collection.queryParams.query)) {
    		collection.queryParams.query = {};
    	}
      collection.queryParams.query[this.name] = function () {
        var values = self.$el.find('input').select2('data');
        if(!_.isNull(values)){
        	return JSON.stringify({ $all: [values.value] });
        } else {
          return null;
        }
      };
    }
  },
  template: _.template('<input type="hidden" data-placeholder="<%- placeholder %>" name="<%- name %>" />'),
  search: function (values) {
    var data = { query: {} };
    data.query[this.name] = JSON.stringify({ $all: values });
    this.collection.fetch({data: data});
  },
  render: function () {
		var self = this;
    this.$el.empty().append(this.template({
      name: this.name,
      placeholder: this.placeholder
    })).find('input').wait(0).select2(this.ajaxSettings).on('change',function(e){self.search(e.val)});
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

ncos.State.notify = function(state, message, type) {
	if (state=='show') {
  	$('body').prepend('<div id="info" class="animated fadeInLeft ' + type + '"><button type="button" class="close" data-dismiss="alert">×</button><i class="icon-ok"></i> ' + message + '</div>');
  	$('img.logo').repeat(500).toggleClass('loading');
  }
	else if (state=='show-hide') {
		$('body').prepend('<div id="info" class="animated fadeInLeft ' + type + '"><button type="button" class="close" data-dismiss="alert">×</button><i class="icon-ok"></i> ' + message + '</div>');
		$('img.logo').repeat(500).toggleClass('loading').until(6);
		$('div#info').wait(3000).addClass('fadeOutLeft').wait(1000).remove(); 
	}
  else if (state=='hide') {
    $('div#info').addClass('fadeOutLeft').wait(1000).remove();
    $('img.logo').unrepeat();
  }
};

Backbone.MainGrid = Backbone.Layout.extend({
	initialize: function() {
    this.grid = new Backgrid.Grid({
    	row: Backgrid.ClickableRow,
      columns: this.options.columns,
      collection: this.options.collection
    })
    $(this.$el).append(this.grid.render().$el)
    this.paginator = new Backgrid.Extension.Paginator({
  		columns: this.options.columns,
  		collection: this.options.collection
		});
		$(this.$el).append(this.paginator.render().$el);
  },
  afterRender: function() {
    this.$el.addClass(this.options.class);
    this.filters();
  },
  close: function() {
    this.grid.remove()
    this.remove()
    this.unbind()
  }
});

Backbone.NCOModel = Supermodel.Model.extend({
  idAttribute: '_id',
  clear: function() {
  	this.reset();
    this.destroy();
  }
})

Backbone.NCOCollection = Backbone.PageableCollection.extend({
  mode: 'server',
	state: {
    pageSize: 30,
    sortKey: "name",
    order: -1,
  },
	queryParams: {
		currentPage: "page",
		pageSize:	"per_page",
		totalPages:	"total_pages",
		totalRecords: "total_entries",
		sortKey: "sort_by",
	}
})

Backbone.SubGrid = Backbone.Layout.extend({
	initialize: function() {
    this.grid = new Backgrid.Grid({
    	row: Backgrid.ClickableRow,
      columns: this.options.columns,
      collection: this.options.collection,
    })
    $(this.options.class).append(this.grid.render().$el)
  },
  close: function() {
    this.grid.remove()
    this.remove()
    this.unbind()
  }
})

Backbone.Page = Backbone.View.extend({
	manage: true,
  options: {
    class: 'stack-item'
  },
  initialize: function() {
    this.buildSubGrid();
  	this.once('loaded', this.render);
  },
  beforeRender: function() {
  	//this.buildSubGrid();
  },
  afterRender: function() {
  	var self = this;
    this.$el.addClass(this.options.class);
    this.$el.css('background-color', 'rgba(255,255,255,0.8)');
    this.$el.append();
  },
  buildSubGrid: function() {
  	var self = this;
  	var length = Object.size(this.options.relations);
  	_.each(this.options.relations,function(relation){
    	self.model[relation.settings.name]()
			self.model['_' + relation.settings.name].fetch().done(function(){
			  if (relation.settings.grid) {
    		  self.insertView(new Backbone.SubGrid({collection:self.model['_' + relation.settings.name],columns:relation.columns,class:relation.settings.class}));
    		}
    		length -= 1;
    		if (length == 0) self.trigger("loaded");
    	})
    })
  },
  serialize: function() {
  	var self = this,
  			relations = {}
  	_.each(this.options.relations, function(relation) {
  		relations[relation.settings.name] = self.model['_' + relation.settings.name]
  	})
  	return { model: this.model.attributes, relations: relations };
	}
});

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};