/**
 * Select2
 *
 * Renders Select2 - jQuery based replacement for select boxes
 *
 * Simply pass a 'config' object on your schema, with any options to pass into Select2.
 * See http://ivaynberg.github.com/select2/#documentation
 */
 
Backbone.Form.editors.Select2RelObject = Backbone.Form.editors.Base.extend({
 
  /**
   * @param {Object} options.schema.config    Options to pass to select2. See http://ivaynberg.github.com/select2/#documentation
   */
  initialize: function(options) {
    Backbone.Form.editors.Base.prototype.initialize.call(this, options);
 
    var schema = this.schema;
    this.config = schema.config || {};
    if (options.model instanceof Supermodel.Model) {
    	if(options.model['_' + options.key]){
    		if (options.schema.config.multiple == true) {
    			var self = this;
    			self.value = [];
    			_.each(options.model['_' + options.key].models, function(m) {
    				self.value.push(m.get('id'));
    			});
    		}
    		else {
      		this.value = options.model.get(options.key + '_id');
      	}
      }
    }
    var ajaxSettings = {
    	placeholder: this.config.placeholder,
      minimumInputLength: schema.config.minimumInputLength ? schema.config.minimumInputLength : 3,
      createSearchChoice: !schema.config.tags ? false : function(term,data){
      	return {
      		id:'new' + moment().format('X'),
      		value:term
      	}
      },
      ajax: {
      	url: '/api/concurrent/select/' + schema.collection,
        dataType: 'json',
        quietMillis: 100,
        data: function (term, page) { // page is the one-based page number tracked by Select2
        	if(_.isUndefined(schema.modeltype)){
        		return {
          		query: term, //search term
            	page_limit: 10, // page size
            	page: page // page number
          	}
          }
          else {
          	return {
          		query: term, //search term
            	page_limit: 10, // page size
            	page: page, // page number
            	type: schema.modeltype
          	}
          }
        },
        results: function (data, page) {
          var more = (page * 10) < data.total; // whether or not there are more results available
        	// notice we return the value of more so Select2 knows if more results can be loaded
          return {results: data.results, more: more};
        }
      },
      initSelection : function (element, callback) {
      	if (options.schema.config.multiple == true || options.schema.config.tags == true) {
      		var values = options.model.get(options.key),
      				data = [];
      		_.each(values, function(obj) {
    				data.push({id: obj.id, value: obj.value});
    			});
    		}
    		else if (options.value) {
    			data = {id: options.value.id, value: options.value.value};
    		}
    		else {
    			//console.log(options)
    			var value = options.model.get(options.key);
    			data = {id: value.id, value: value.value};
    		}
    		callback(data);
    	},
      formatResult: function (r) { return r.value; },
      formatSelection: function (r) { return r.value; },
      dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
      escapeMarkup: function (r) { return r; }
    }
    _.extend(this.config,ajaxSettings)
  },
 
  render: function() {
    var self = this;
		setTimeout(function() {
      self.$el.select2(self.config);
			self.setValue(self.value);
    }, 0);
    
    return this;
  },
 
  getValue: function() {
    return this.$el.select2('data');
  },
 
  setValue: function(val) {
    this.$el.select2('val',val);
  }
 
});