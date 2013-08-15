ncos.Models.NCO = Supermodel.Model.extend({
  urlRoot: "http://ngo.ovdinfo.org/api/nco",
  page: "ncos",
  idAttribute: '_id',
  clear: function() {
  	this.reset();
    this.destroy();
  },
});

ncos.Collections.NCOs = Backbone.PageableCollection.extend({
  model: ncos.Models.NCO,
  url: "http://ngo.ovdinfo.org/api/nco",
  mode: 'client',
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
});

ncos.Models.Check = Supermodel.Model.extend({
  urlRoot: "http://ngo.ovdinfo.org/api/check",
  page: "checks",
  idAttribute: '_id',
  clear: function() {
  	this.reset();
    this.destroy();
  },
	initialize: function(attributes) {
		Supermodel.Model.prototype.initialize.apply(this, arguments);
		if(!_.isUndefined(this.get('chronology'))&&!_.isUndefined(this.get('chronology')[0])){
  		this.set({currentState:this.get('chronology')[0].state});
  		this.set({currentStateDate:this.get('chronology')[0].stateDate});
  		if(!_.isNull(this.get('chronology')[0].stateSource)){
  			this.set({currentStateSource:this.get('chronology')[0].stateSource});
  		}
  	}
  	if(!_.isUndefined(this._nco)){	
  		this.set({region:this._nco.get('administrative_area_level_1')});
  		this.set({sector:this._nco.get('sector')});
  		this.set({ncoFullName:this._nco.get('fullName')});
  	}
	}
});

ncos.Collections.Checks = Backbone.PageableCollection.extend({
  model: ncos.Models.Check,
  url: "http://ngo.ovdinfo.org/api/check",
  mode: 'client',
	state: {
    pageSize: 30,
    sortKey: "ncoName",
    order: -1,
  },
	queryParams: {
		currentPage: "page",
		pageSize:	"per_page",
		totalPages:	"total_pages",
		totalRecords: "total_entries",
		sortKey: "sort_by",
	}
});

ncos.Models.Case = Supermodel.Model.extend({
  urlRoot: "http://ngo.ovdinfo.org/api/case",
  page: "cases",
  idAttribute: '_id',
  clear: function() {
  	this.reset();
    this.destroy();
  },
	initialize: function(attributes) {
		Supermodel.Model.prototype.initialize.apply(this, arguments);
		var self = this;
		if(!_.isUndefined(self.get('chronology'))&&!_.isUndefined(self.get('chronology')[0])){
  		self.set({currentState:self.get('chronology')[0].state});
  		self.set({currentStateDate:self.get('chronology')[0].stateDate});
  	}
	}
});

ncos.Collections.Cases = Backbone.PageableCollection.extend({
  model: ncos.Models.Case,
  url: "http://ngo.ovdinfo.org/api/case",
  mode: 'server',
	state: {
    pageSize: 30,
    sortKey: "nco",
    order: -1,
  },
	queryParams: {
		currentPage: "page",
		pageSize:	"per_page",
		totalPages:	"total_pages",
		totalRecords: "total_entries",
		sortKey: "sort_by",
	}
});

ncos.Models.Sanction = Supermodel.Model.extend({
  urlRoot: "http://ngo.ovdinfo.org/api/sanction",
  page: "sanctions",
  idAttribute: '_id',
  clear: function() {
    this.reset();
    this.destroy();
  },
	initialize: function(attributes) {
		Supermodel.Model.prototype.initialize.apply(this, arguments);
		var self = this;
		if(!_.isUndefined(self.get('chronology'))&&!_.isUndefined(self.get('chronology')[0])){
  		self.set({currentState:self.get('chronology')[0].state});
  		self.set({currentStateDate:self.get('chronology')[0].stateDate});
  	}
	}
});

ncos.Collections.Sanctions = Backbone.PageableCollection.extend({
  model: ncos.Models.Sanction,
  url: "http://ngo.ovdinfo.org/api/sanction",
  mode: 'server',
	state: {
    pageSize: 30,
    sortKey: "date",
    order: -1,
  },
	queryParams: {
		currentPage: "page",
		pageSize:	"per_page",
		totalPages:	"total_pages",
		totalRecords: "total_entries",
		sortKey: "sort_by",
	}
});

ncos.Models.Media = Supermodel.Model.extend({
  urlRoot: "http://ngo.ovdinfo.org/api/media",
  page: "media",
  idAttribute: '_id',
  clear: function() {
  	this.reset();
    this.destroy();
  }
});

ncos.Collections.Media = Backbone.PageableCollection.extend({
  model: ncos.Models.Media,
  url: "http://ngo.ovdinfo.org/api/media",
  mode: 'server',
	state: {
    pageSize: 30,
    sortKey: "date",
    order: -1,
  },
	queryParams: {
		currentPage: "page",
		pageSize:	"per_page",
		totalPages:	"total_pages",
		totalRecords: "total_entries",
		sortKey: "sort_by",
	}
});

ncos.Models.Authority = Supermodel.Model.extend({
  urlRoot: "http://ngo.ovdinfo.org/api/authorities",
  page: "authorities",
  idAttribute: '_id',
  clear: function() {
  	this.reset();
    this.destroy();
  },
});

ncos.Collections.Authorities = Backbone.PageableCollection.extend({
  model: ncos.Models.Authority,
  url: "http://ngo.ovdinfo.org/api/authorities",
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
      return '/api/case/' + this.owner.id + '/sanction';
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
      return '/api/check/' + this.owner.id + '/sanction';
    }
  })
});

ncos.Models.Check.has().many('cases', {
  inverse: 'check',
  collection: ncos.Collections.Cases.extend({
  	url: function() {
      return '/api/check/' + this.owner.id + '/case';
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
      return '/api/nco/' + this.owner.id + '/check';
    }
  })
});

ncos.Models.NCO.has().many('cases', {
	inverse: 'nco',
  collection: ncos.Collections.Cases.extend({
  	url: function() {
      return '/api/nco/' + this.owner.id + '/case';
    }
  })
});

ncos.Models.NCO.has().many('sanctions', {
	inverse: 'nco',
  collection: ncos.Collections.Sanctions.extend({
  	url: function() {
      return '/api/nco/' + this.owner.id + '/sanction';
    }
  })
});