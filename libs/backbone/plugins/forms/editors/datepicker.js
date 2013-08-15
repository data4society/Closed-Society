/**
 * Select2
 *
 * Renders Select2 - jQuery based replacement for select boxes
 *
 * Simply pass a 'config' object on your schema, with any options to pass into Select2.
 * See http://ivaynberg.github.com/select2/#documentation
 */
 
Backbone.Form.editors.Datepicker = Backbone.Form.editors.Text.extend({
 
  /**
   * @param {Object} options.schema.config    Options to pass to select2. See http://ivaynberg.github.com/select2/#documentation
   */
  initialize: function(options) {
    Backbone.Form.editors.Base.prototype.initialize.call(this, options);
 
    var schema = this.schema;
 
    this.config = schema.config || {};
  },
 
  render: function() {
    var self = this;
		var format = self.schema.time ? 'dd.MM.yyyy hh:mm' : 'dd.MM.yyyy'
		var pickTime = self.schema.time ? true : false
		setTimeout(function() {
      	self.$el.attr('type','text').datetimepicker({format:format,language:'ru',pickTime:pickTime}).on('changeDate', function(ev){
      		if(!self.schema.time) self.$el.datetimepicker('hide')
      	});
			self.setValue(self.value);
    }, 0);
    
    return this;
  },
 
  getValue: function() {
    var date = this.$el.val();
    var format = this.schema.time ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY'
    if (!_.isNull(date) && date != '') {
    	return moment(date,format).format('X');
    }
  },
 
  setValue: function(val) {
  	var format = this.schema.time ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY'
  	if (!_.isNull(moment(val))) {
  		var date = moment(val,'X').format(format);
  	}
    this.$el.val(date);
  }
 
});  
