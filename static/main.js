// map center, zoom1 14 var center = new google.maps.LatLng(40.704066,-73.992727);


DateModel = Backbone.Model.extend({
    defaults: { date: new Date()},
    initialize: function() {
	var that=this;
	$.getJSON("/getDateRange",function(data) {
	    that.set('min',data.min);
	    that.set('max',data.max);
	    that.get('view').render();
	});
    }
    
});


DateView = Backbone.View.extend({
    el:'#interface',
    initialize: function() {
	//_.bindAll(this,"render");
	//this.model.bind('change',this.render);
	//this.render();
    },
    events: {
	"change input[type=range]": "doChangeDate",
	"mouseup input[type=range]": "render"
    },
    doChangeDate : function(e) {
	
	var tmp = new Date();
	var d = new Date(parseInt(e.target.value));
	this.model.set({'date':d});
	//this.render(); // this seems to be better as a mouseup
    },
    render: function() {
	var date=this.model.get('date')
	var max=this.model.get('max');
	var min=this.model.get('min')
	var subs={date:date,min:min,max:max};
	var t = _.template($("#time_template").html(),subs)
	this.$el.html(t);
	return this;
    }
});


StationsView = Backbone.View.extend({
    el:'#stationlist',
    events: {
	"change select": "doChangeStation"
	},
    doChangeStation:function(e) {
	var newStation = e.target.value;
	var m = new StationModel(newStation);
	var mv = new StationGraphView({model:m});
	m.set('view',mv);
    },

    render: function() {
	var subs={stations:this.model.get('stations')};
	var t = _.template($("#stationlist_template").html(),subs);
	this.$el.html(t);
	return this;
    }
});

StationsModel = Backbone.Model.extend({
    url:'/getStations',
    initialize:function() {
	var that=this;
	this.fetch({success:function(data) {
	    that.get('view').render();
	    }});
    }

})


makeGraph = function(stats) {
console.log(stats);
var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 270 - margin.top - margin.bottom;

var parseDate = d3.time.format("%d-%b-%y").parse;

var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").tickFormat(d3.time.format("%H:%M"));//ticks(5);

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

var valueline = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.bikes); });

var svg = d3.select('#graph')
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // loop over stats and make date and bikes for each 
    stats.forEach(function (d) {
	var nd = new Date(d['timestamp']*1000);
	//d.date=new Date(d['timestamp'])
	d.date = d3.time.format.iso.parse(nd);
	d.bikes=d['availableBikes'];
   });

   // Scale the range of the data
    x.domain(d3.extent(stats, function(d) { return d.date; }));
    y.domain([0, d3.max(stats, function(d) { return d.bikes; })]);

    svg.append("path")      // Add the valueline path.
        .attr("d", valueline(stats));

    svg.append("g")         // Add the X Axis
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")         // Add the Y Axis
        .attr("class", "y axis")
        .call(yAxis);

return svg;		  
}



StationGraphView = Backbone.View.extend({
    el:"#graph",
    initialize: function() {
    },
    render: function() {
	//this.$el.html(this.model.get('stationName'));
	var stats = this.model.get('stats');
	this.$el.empty();
	var g = makeGraph(stats);
	//this.%el.html(g);
	return this;
    }
    
});


StationModel = Backbone.Model.extend({
    url:function () {
	return "/getStation/"+this.get('stationName');
    },
    initialize: function(data) {
	if (data===undefined) {
	    data = '';
	}
	var that=this;
	this.set({'stationName':data});
	this.fetch({success:function(data) {
	that.get('view').render();
	}});
    }
});



var d,v;
var stations,sv;
$(document).ready(function(){
    d = new DateModel();
    v = new DateView({model:d});
    d.set('view',v);
    stations=new StationsModel();
    sv = new StationsView({model:stations});
    stations.set('view',sv);
});

