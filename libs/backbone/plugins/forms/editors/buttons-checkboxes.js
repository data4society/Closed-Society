 /**
   * BOOTSTRAP BUTTON CHECKBOXES
   * Renders a <div> with given options represented as <li> buttons containing checkboxes
   *
   * Requires an 'options' value on the schema.
   *  Can be an array of options, a function that calls back with the array of options, a string of HTML
   *  or a Backbone collection. If a collection, the models must implement a toString() method
   */
  Backbone.Form.editors.ButtonsCheckboxes = Backbone.Form.editors.Select.extend({

    tagName: 'div',
    className: 'bbf-buttons-checkboxes btn-group',
		attributes: {'data-toggle':'buttons-checkbox'},

    events: {
      'click button.active': function() {
        this.trigger('change', this);
      },
    },

    getValue: function() {
      var values = [];
      this.$('button.active').each(function() {
        values.push($(this).val());
      });
      return values;
    },

    setValue: function(values) {
			if(values) {
				for(var i=0; i < values.length; i++) {
      		this.$('button[value="'+values[i]+'"]').addClass('active');
				};
			}
    },

    /**
     * Create group of bootstrap checkbox buttons HTML
     * @param {Array}   Options as a simple array e.g. ['option1', 'option2']
     *                      or as an array of objects e.g. [{val: 'option1', class: 'btn-danger'}]
     * @return {String} HTML
     */
    _arrayToHtml: function (array) {
      var html = [];
      var self = this;

      _.each(array, function(option, index) {
        var itemHtml = '';
        if (_.isObject(option)) {
					var className = (option.class || option.class === 0) ? option.class : 'btn-primary';
          itemHtml += ('<button type="button" name="'+self.id+'" class="btn '+className+'" id="'+self.id+'-'+index+'" value="'+option.val+'">'+option.val+'</button>');
        }
        else {
          itemHtml += ('<button type="button" name="'+self.id+'" class="btn btn-primary" id="'+self.id+'-'+index+'" value="'+option+'">'+option+'</button>');
        }
        itemHtml += '</li>';
        html.push(itemHtml);
      });

      return html.join('');
    }

  });
