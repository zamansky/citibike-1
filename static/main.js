
StationsView = Backbone.View.extend({
    el:'#stationmap',
    doChangeStation:function(e) {
	//var newStation = e.target.value;
	var newStation = e;
	var m = new StationModel(newStation);
	var mv = new StationGraphView({model:m});
	m.set('view',mv);
    },

    render: function() {
	var myLatlng = new google.maps.LatLng(40.704066,-73.992727);
	var mapOptions = {
	    zoom: 14,
	    center: myLatlng,
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	this.map = new google.maps.Map(document.getElementById('stationmap'), mapOptions);
	var that=this;
	this.model.get('stations').forEach(function (d) {
	    var ll = new google.maps.LatLng(parseFloat(d['latitude']),
					    parseFloat(d['longitude']));
	    var marker = new google.maps.Marker({
		position: ll,
		map:that.map,
		title: d['stationName']
	    });
	    google.maps.event.addListener(marker, 'click', function(e) {
		var newStation = d['stationName'];
		var m = new StationModel(newStation);
		var mv = new StationGraphView({model:m});
		m.set('view',mv);
		var sv = new StationStatModelView({model:m});
	    });

	});

	//console.log(map);
	//var subs={stations:this.model.get('stations')};
	//var t = _.template($("#stationlist_template").html(),subs);
	//
	//$("#stationamp").replaceWith(this.el);
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


var margin = {top: 30, right: 40, bottom: 150, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;
    //height = 270 - margin.top - margin.bottom;

var parseDate = d3.time.format("%d-%b-%y").parse;

var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").tickFormat(d3.time.format("%a %H:%M")).ticks(d3.time.hours,2);

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
	var nd = new Date(d['timestamp']*1000+1000*60*3*60);
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
        .call(xAxis).selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
                });

    svg.append("g")         // Add the Y Axis
        .attr("class", "y axis")
        .call(yAxis);

return svg;		  
}



StationGraphView = Backbone.View.extend({
    el:"#graph",
    render: function() {
	//this.$el.html(this.model.get('stationName'));
	var stats = this.model.get('stats');
	this.$el.empty();
	var g = makeGraph(stats);
	d3.select('#graph').append(g);
	//this.$el.html(d3.select('svg'));
	
	return this;
    }
    
});



StationStatModelView = Backbone.View.extend({
    el:"#stationstats",
    initialize: function(d) {
	_.bindAll(this,"render");
	this.model.bind('change',this.render);
    },
    render:function() {
	var m = this.model;
	var s=m.get('info');
	console.log(s);
	var t = _.template($("#stationstat_template").html(),s);
	this.$el.html(t);
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
    stations=new StationsModel();
    sv = new StationsView({model:stations});
    stations.set('view',sv);
});
