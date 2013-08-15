  var Form = Backbone.Form,
      editors = Form.editors;
      
  // we don't want our nested form to have a (nested) <form> tag
  // (currently bbf includes form tags: https://github.com/powmedia/backbone-forms/issues/8)
  // aside from being strange html to have nested form tags, it causes submission-upon-enter
  Form.setTemplates({
    nestedForm: '<div class="bbf-nested-form">{{fieldsets}}</div>'
  });

  editors.List.InlineNestedModel = editors.List.NestedModel.extend({
  
    events: {},

    /**
     * @param {Object} options
     */
    initialize: function(options) {
      editors.Base.prototype.initialize.call(this, options);

      // Reverse the effect of the "feature" of pressing enter adding new item
      // https://github.com/powmedia/backbone-forms/commit/6201a6f44984087b71c216dd637b280dab9b757d
      delete this.options.item.events['keydown input[type=text]'];

      var schema = this.schema;

      //Get nested schema if Object
      if (schema.itemType === 'Object') {
        if (!schema.subSchema) throw 'Missing required option "schema.subSchema"';

        this.nestedSchema = schema.subSchema;
      }
      var list = options.list;
      list.on('add', this.onUserAdd, this);
    },
    
    /**
     * Render the list item representation
     */
    render: function() {
      var self = this;

      this.$el.html(this.getFormEl());

      setTimeout(function() {
        self.trigger('readyToAdd');
      }, 0);

      return this;
    },

    getFormEl: function() {
      var schema = this.schema,
          value = this.getValue();

      this.form = new Form({
        
        schema: this.schema.subSchema,
        data: this.value,
        
        template: 'nestedForm'
        //model: value
      });
      
      return this.form.render().el;
    },

    getValue: function() {
      if (this.form) {
        this.value = this.form.getValue();
        //console.log('nested form value', this.value);
        // see https://github.com/powmedia/backbone-forms/issues/81
      }
      return this.value;
    },

    onUserAdd: function() {
      this.form.$('input, textarea, select').first().focus();
    }

  });
