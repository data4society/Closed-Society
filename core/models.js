ncos.Models.NCO = Backbone.NCOModel.extend({
  urlRoot: "http://ngo.ovdinfo.org/api/nco",
  page: "ncos"
});

ncos.Collections.NCOs = Backbone.NCOCollection.extend({
  model: function(attrs, options) {
    return ncos.Models.NCO.create(attrs, options);
  },
  url: "http://ngo.ovdinfo.org/api/nco"
});

ncos.Models.Check = Backbone.NCOModel.extend({
  urlRoot: "http://ngo.ovdinfo.org/api/check",
  page: "checks",
	initialize: function(attributes) {
		Supermodel.Model.prototype.initialize.apply(this, arguments);
		if(!_.isUndefined(this.get('chronology'))&&!_.isUndefined(this.get('chronology')[0])){
  		this.set({currentState:this.get('chronology')[0].state});
  		this.set({currentStateDate:this.get('chronology')[0].stateDate});
  		if(!_.isNull(this.get('chronology')[0].stateSource)){
  			this.set({currentStateSource:this.get('chronology')[0].stateSource});
  		}
  	}
	}
});

ncos.Collections.Checks = Backbone.NCOCollection.extend({
  model: function(attrs, options) {
    return ncos.Models.Check.create(attrs, options);
  },
  url: "http://ngo.ovdinfo.org/api/check",
  state: {
    pageSize: 30,
    sortKey: "ncoName",
    order: -1,
  }
});

ncos.Models.Case = Backbone.NCOModel.extend({
  urlRoot: "http://ngo.ovdinfo.org/api/case",
  page: "cases",
	initialize: function(attributes) {
		Supermodel.Model.prototype.initialize.apply(this, arguments);
		var self = this;
		if(!_.isUndefined(self.get('chronology'))&&!_.isUndefined(self.get('chronology')[0])){
  		self.set({currentState:self.get('chronology')[0].state});
  		self.set({currentStateDate:self.get('chronology')[0].stateDate});
  	}
	}
});

ncos.Collections.Cases = Backbone.NCOCollection.extend({
  model: function(attrs, options) {
    return ncos.Models.Case.create(attrs, options);
  },
  url: "http://ngo.ovdinfo.org/api/case"
});

ncos.Models.Sanction = Backbone.NCOModel.extend({
  urlRoot: "http://ngo.ovdinfo.org/api/sanction",
  page: "sanctions",
	initialize: function(attributes) {
		Supermodel.Model.prototype.initialize.apply(this, arguments);
		var self = this;
		if(!_.isUndefined(self.get('chronology'))&&!_.isUndefined(self.get('chronology')[0])){
  		self.set({currentState:self.get('chronology')[0].state});
  		self.set({currentStateDate:self.get('chronology')[0].stateDate});
  	}
	}
});

ncos.Collections.Sanctions = Backbone.NCOCollection.extend({
  model: function(attrs, options) {
    return ncos.Models.Sanction.create(attrs, options);
  },
  url: "http://ngo.ovdinfo.org/api/sanction"
});

ncos.Models.Media = Backbone.NCOModel.extend({
  urlRoot: "http://ngo.ovdinfo.org/api/media",
  page: "media"
});

ncos.Collections.Media = Backbone.NCOCollection.extend({
  model: function(attrs, options) {
    return ncos.Models.Media.create(attrs, options);
  },
  url: "http://ngo.ovdinfo.org/api/media"
});

ncos.Models.Authority = Backbone.NCOModel.extend({
  urlRoot: "http://ngo.ovdinfo.org/api/authorities",
  page: "authorities"
});

ncos.Collections.Authorities = Backbone.PageableCollection.extend({
  model: function(attrs, options) {
    return ncos.Models.Authority.create(attrs, options);
  },
  url: "http://ngo.ovdinfo.org/api/authorities"
});

/*ncos.Models.Media.has().many('nco', {
  collection: ncos.Collections.NCOs,
  inverse: 'media'
});

ncos.Models.Media.has().many('authority', {
  collection: ncos.Collections.Authorities,
  inverse: 'media'
});

ncos.Models.Media.has().many('check', {
  collection: ncos.Collections.Checks,
  inverse: 'media'
});

ncos.Models.Media.has().many('case', {
  collection: ncos.Collections.Cases,
  inverse: 'media'
});

ncos.Models.Media.has().one('sanction', {
  collection: ncos.Collections.Sanctions,
  inverse: 'media'
});
*/
ncos.Models.Sanction.has().one('nco', {
  model: ncos.Models.NCO,
  inverse: 'sanctions'
});

ncos.Models.Sanction.has().one('authority', {
  model: ncos.Models.Authority,
  inverse: 'sanctions'
});

ncos.Models.Sanction.has().one('check', {
  model: ncos.Models.Check,
  inverse: 'sanctions'
});

ncos.Models.Sanction.has().one('case', {
  model: ncos.Models.Case,
  inverse: 'sanctions'
});

ncos.Models.Case.has().many('sanctions', {
  inverse: 'case',
  collection: ncos.Collections.Sanctions.extend({
  	url: function() {
      return 'http://ngo.ovdinfo.org/api/case/' + this.owner.id + '/sanction';
    }
  })
});

ncos.Models.Case.has().one('nco', {
  model: ncos.Models.NCO,
  inverse: 'cases'
});

ncos.Models.Case.has().one('authority', {
  model: ncos.Models.Authority,
  inverse: 'cases'
});

ncos.Models.Case.has().one('check', {
  model: ncos.Models.Check,
  inverse: 'cases'
});

ncos.Models.Check.has().many('sanctions', {
  inverse: 'check',
  collection: ncos.Collections.Sanctions.extend({
  	url: function() {
      return 'http://ngo.ovdinfo.org/api/check/' + this.owner.id + '/sanction';
    }
  })
});

ncos.Models.Check.has().many('cases', {
  inverse: 'check',
  collection: ncos.Collections.Cases.extend({
  	url: function() {
      return 'http://ngo.ovdinfo.org/api/check/' + this.owner.id + '/case';
    }
  })
});

ncos.Models.Check.has().one('nco', {
  model: ncos.Models.NCO,
  inverse: 'checks'
});

ncos.Models.Check.has().one('authority', {
  model: ncos.Models.Authority,
  inverse: 'checks'
});

ncos.Models.NCO.has().many('checks', {
  inverse: 'nco',
  collection: ncos.Collections.Checks.extend({
  	url: function() {
      return 'http://ngo.ovdinfo.org/api/nco/' + this.owner.id + '/check';
    }
  })
});

ncos.Models.NCO.has().many('cases', {
	inverse: 'nco',
  collection: ncos.Collections.Cases.extend({
  	url: function() {
      return 'http://ngo.ovdinfo.org/api/nco/' + this.owner.id + '/case';
    }
  })
});

ncos.Models.NCO.has().many('sanctions', {
	inverse: 'nco',
  collection: ncos.Collections.Sanctions.extend({
  	url: function() {
      return 'http://ngo.ovdinfo.org/api/nco/' + this.owner.id + '/sanction';
    }
  })
});