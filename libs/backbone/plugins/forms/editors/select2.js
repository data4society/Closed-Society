/**
 * Select2
 *
 * Renders Select2 - jQuery based replacement for select boxes
 *
 * Simply pass a 'config' object on your schema, with any options to pass into Select2.
 * See http://ivaynberg.github.com/select2/#documentation
 */
 
Backbone.Form.editors.Select2 = Backbone.Form.editors.Base.extend({
 
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

		setTimeout(function() {
      self.$el.select2(self.config);
			self.setValue(self.value);
    }, 0);
    
    return this;
  },
 
  getValue: function() {
    return this.$el.select2('val');
  },
 
  setValue: function(val) {
    this.$el.select2('val',val);
  }
 
});