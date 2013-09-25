var map = L.map('map'),
		markerSize = 20,
		iframe = false;

if (window.location != window.parent.location) iframe = true;

//var iconsPath = iframe ? '../assets/img/markers/' : 'assets/img/markers/',
var iconsPath = iframe ? '../../assets/img/' : '../assets/img/',
		attribution = iframe ? '<a class="logo-img" href="http://closedsociety.org" target="_blank">ClosedSociety.org</a><br />According<a href="http://closedsociety.org" target="_blank">Closed Society</a> data.' : '<a class="logo-img" href="http://www.svoboda.org/section/authorities-against-ngo/3228.html" target="_blank"><img src="../assets/img/liberty.png" /></a><br />Inspections map is special project <br />with <a href="http://www.svoboda.org/section/authorities-against-ngo/3228.html" target="_blank">Radio Liberty</a>.';

map.spin(true);

map.addLayer(L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'))
	.setView([55, 50], 5);

map.attributionControl.setPrefix('');

L.spriteIcon = function(marker) {
	var color = '';
	switch (marker) {
		case 1:
			color = 'blue';
			break;
		case 2:
			color = 'purple';
			break;
		case 4:
			color = 'green';
			break;
		case 8:
			color = 'orange';
			break;
		case 16:
			color = 'yellow';
			break;
		case 32:
			color = 'red';
			break;
		default:
			break;
	}
	return L.icon({
		className: "leaflet-sprite leaflet-sprite-" + color,
		iconSize: [24, 41],
		shadowsize: [41, 41],
		iconAnchor: [12, 41],
		iconUrl: iframe ? '../../assets/img/blank.png' : '../assets/img/blank.png',
		shadowUrl: L.Icon.Default.imagePath + "/marker-shadow.png"
	});
};

L.MarkerClusterGroup.include({
	filter: function (f) {
		f = f || function (m) { return true; }
		var markersArr = Array();
		geoJsonLayer.eachLayer(function(l){
			var a = l.feature;
			if (!f(a)) { return true; }
			var marker = L.marker(new L.LatLng(a.geometry.coordinates[1], a.geometry.coordinates[0]), {
				icon: new L.spriteIcon(a.properties.marker),
				properties: a.properties
			});
			markersArr.push(marker);
		});
		this.clearLayers();
		this.addLayers(markersArr);
	}
});

var markers = L.markerClusterGroup({
	showCoverageOnHover: false,
	iconCreateFunction: function(cluster) {
		var murkersOfCluster = cluster.getAllChildMarkers();
		var l0 = murkersOfCluster.length;
		var byteInt = 0;
		var byteInt0;
		for(var i=0;i<l0;i++){
			if(murkersOfCluster[i].feature){
				byteInt0 = murkersOfCluster[i].feature.properties.marker;
			}
			else{
				byteInt0 = murkersOfCluster[i].options.properties.marker;
			}
			byteInt = byteInt | byteInt0;
		}
		return new L.DivIcon({
			iconSize: [2*markerSize, 2*markerSize],
			iconAnchor: [markerSize, markerSize],
			className: "cluster",
			//html: '<div style="width:'+2*markerSize+'px;height:'+2*markerSize+'px;line-height:'+2*markerSize+'px;background-image:url(\''+iconsPath+byteIntToString(byteInt)+'.png\');">' + cluster.getChildCount() + '</div>'
			html: '<div style="width:'+2*markerSize+'px;height:'+2*markerSize+'px;line-height:'+2*markerSize+'px;background-image:url(\''+iconsPath+'clusters.png\');background-position:'+(-40*byteInt)+'px 0px;">' + cluster.getChildCount() + '</div>'
		});
	}
});
		
var legendposition = iframe ? 'bottomleft' : 'bottomright',
		legend = L.control({position:legendposition});

legend.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'legend-en');
	this._div.innerHTML = '<span>NGOs by sanctions:</span> \
		<ul id="legend"> \
		<li><span class="red"></span> - Suspended</li> \
		<li><span class="violet"></span> - Administrative cases</li> \
		<li><span class="orange"></span> - Notice of violations</li> \
		<li><span class="yellow"></span> - Warnings</li> \
		<li><span class="green"></span> - Other</li> \
		<li><span class="blue"></span> - No data</li> \
		</ul>';
	return this._div;
};

legend.addTo(map);
		
var ShareControl = L.Control.extend({
	options: {
  	position: iframe ? 'topleft' : 'bottomright',
  	embed: '',
    url: '',
    text: ''
	},
	initialize: function(_, options) {
		L.setOptions(this, options);
	},
	onAdd: function(map) {
		this._map = map;
		var container = L.DomUtil.create('div', 'leaflet-control-share leaflet-bar');
		var link = L.DomUtil.create('a', 'share icon icon-share', container);
		link.href = '#';
		L.DomEvent.addListener(link, 'click', this._shareClick, this);
		L.DomEvent.disableClickPropagation(container);
		this._map.on('mousedown', this._clickOut, this);
		return container;
	},
	_clickOut: function(e) {
		if (this._popup) {
			this._map.removeLayer(this._popup);
			this._popup = null;
			return;
		}
	},
	_shareClick: function(e) {
		L.DomEvent.stop(e);
		if (this._popup) return this._clickOut(e);
		var url = this.options.url || 'http://closedsociety.org/en',
				text = this.options.text || 'State pressure on NGOs monitoring',
				embed = this.options.embed || 'http://closedsociety.org/en/map',
				twitter = 'http://twitter.com/intent/tweet?status=' + encodeURIComponent(text + '\n' + url),
				facebook = 'https://www.facebook.com/sharer.php?u=' + encodeURIComponent(url) + '&t=' + encodeURIComponent(text),
				share = "<a class='leaflet-popup-close-button' href='#close'>×</a>" +
					"<h3>Share this map</h3>" + "<div class='share-buttons'><a class='share-facebook icon icon-facebook' target='_blank' href='" + 
					facebook + "'>Facebook</a>" + "<a class='share-twitter icon icon-twitter' target='_blank' href='" + 
					twitter + "'>Twitter</a></div>" + "<h3>Embed code</h3>" + "<small>Copy and paste this HTML code into your page.</small>" +
          "<textarea rows=4>&lt;iframe width='700' height='500' allowfullscreen='true' frameBorder='0' src='" + embed + "'&gt;&lt;/iframe&gt;</textarea>";
		this._popup = L.marker(this._map.getCenter(), {
			zIndexOffset: 10000,
			icon: L.divIcon({
				className: 'share-popup',
				iconSize: L.point(360, 240),
				iconAnchor: L.point(180, 120),
				html: share
			})
    })
		.on('mousedown', function(e) {
			L.DomEvent.stopPropagation(e.originalEvent);
		})
		.on('click', clickPopup, this).addTo(this._map);
		function clickPopup(e) {
			if (e.originalEvent && e.originalEvent.target.nodeName === 'TEXTAREA') {
				var target = e.originalEvent.target;
				target.focus();
				target.select();
			} else if (e.originalEvent && e.originalEvent.target.getAttribute('href') === '#close') {
				this._clickOut(e);
			}
		}
	}
});

var share = new ShareControl();
share.addTo(map);

L.control.fullscreen({
	position: iframe ? 'topleft' : 'bottomright',
	title: 'Полноэкранная версия'
}).addTo(map);

new L.Control.Attribution({
	position: iframe ? 'bottomright' : 'bottomleft',
}).setPrefix('').addAttribution(attribution).addTo(map);

var info = L.control();

info.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'info');
	this.create();
	this.update();
	this._div.addEventListener('click',filter);
	return this._div;
};

info.create = function () {
	this._div.innerHTML = '<div id="filter-wrapper-en"> \
		<ul id="filter"> \
		<li data-filter="all" class="all active">All inspections</li> \
		<li data-filter="Prosecutor office">Prosecutor office</li> \
		<li data-filter="Ministry of Justice">Ministry of Justice</li> \
		<li data-filter="Interior Ministry">Interior Ministry</li> \
		<li data-filter="Emergency Ministry">Emergency Ministry</li> \
		<li data-filter="Migration Sercive">Migration Sercive</li> \
		<li data-filter="Tax Service">Tax Service</li> \
		<li data-filter="Security Service">Security Service</li> \
		<li data-filter="Customs Service">Customs Service</li> \
		<li data-filter="Drug Control Service">Drug Control Service</li> \
		<li data-filter="ROSKOMNADZOR">ROSKOMNADZOR</li> \
		<li data-filter="ROSPOTREBNADZOR">ROSPOTREBNADZOR</li> \
		<li data-filter="Economical Crimes Department">Economical Crimes Department</li> \
		<li data-filter="Anti-Extremism Department">Anti-Extremism Department</li> \
		</ul> \
		</div> \
		<div id="info"> \
		</div>';
};

info.update = function (props) {
	this._div.childNodes.item(2).innerHTML = props ? 
	getValue(props.name,'name','str') + getValue(props.formatted_address,'address','str') + getValue(props.checkDate,'check-date','date','inspected on ') + getValue(props.authorities,'authorities','arr','authorities: ') + getValue(props.sector,'sector','arr','sector: ') + getValue([props.currentCheckState,props.currentCheckStateEn],'state','state','current state: <br />') + getValue(props.check,'more','link') 
  : 'Click on marker to receive additional information about NGO';
};

info.addTo(map);

var geoJsonLayer = L.geoJson.ajax("http://api.closedsociety.org/api/geo/ncos/en",{dataType:"json"});
geoJsonLayer.on('data:loaded',handleGeoJSON);
		
markers.on('click',function(e) {
	info.update(e.layer.options.properties)
});

function handleGeoJSON() {
	markers.addLayer(geoJsonLayer);
	map.addLayer(markers);
	var el = document.getElementById("loader");
	el.parentNode.removeChild(el);
	markers.filter();
	map.spin(false);
}
		
function filter(e) {
	if (e.target.localName != "li" || e.target.className.indexOf('active') > -1) return false;
	L.DomUtil.removeClass(e.target.parentNode.getElementsByClassName('active')[0],'active');
	e.target.className += ' active';
	markers.filter(function(f){
		if(e.target.dataset.filter == 'all') {
			return true;
		} else {
			var authorities = f.properties.authoritiesEn;
		  if (authorities != null) {
		  	return authorities.indexOf(e.target.dataset.filter) > -1;
			} else {
		  	return false;
			}
		}
	});
}
		
function getValue(val,name,type,label) {
	label = label || '';
	if (val != null && val != '' && type == 'str') {
		return '<span class="' + name + '">' + val + '</span>';
	} else if (val > 0 && type == 'date') {
		var date = new Date(parseInt(val)*1000);
		return '<span class="date ' + name + '">' + label + dateFormat(date, 'DD.MM.YYYY') + '</span>';
	} else if (type == 'arr' && val != null) {
		var i = 0,
				output = '<span class="' + name + '">' + label + '</span><ul class="' + name + '">';
		for (i; i < val.length; i++) {
			output += '<li>' + val[i] + '</li>';
		}
		if (i > 0) {
			output += '</ul>';
			return output;
		} else {
			return '';
		}
	} else if (type == 'state' && val != null) {
		if (val[1] != null && val[0].stateDate == null) {
			return '<span class="' + name + '">' + label + '<i>' + val[1] + '</i></span>';
		} else if (val[1] != null && val[0].stateDate > 0) {
			var date = new Date(parseInt(val[0].stateDate)*1000);
		  return '<span class="' + name + '">' + label + '<i>' + val[1] + ' (' + dateFormat(date, 'DD.MM.YYYY') + ')</i></span>';
		} else {
			return '';
		}
	} else if (type == 'link' && val != null) {
		return iframe ? '<span class="' + name + '"><a href="http://closedsociety.org/en/data/checks/#' + val + '" target="_blank">more -></a></span>' : '<span class="' + name + '"><a href="http://closedsociety.org/en/data/checks/#' + val + '">more -></a></span>';
	} else {
		return '';
	}
}
		
function dateFormat(date, format) {
	format = format.replace("DD", (date.getDate() < 10 ? '0' : '') + date.getDate());
	format = format.replace("MM", (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1));
	format = format.replace("YYYY", date.getFullYear());
	return format;
}

function byteIntToString(byteInt){
	var str = "";
	for(var i=0;i<6;i++){
		str = (byteInt%2)+str;
		byteInt=(byteInt-byteInt%2)/2;
	}
	return str;
}