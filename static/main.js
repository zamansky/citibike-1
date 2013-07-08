
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
	m = new StationModel(newStation);
	console.log(m);
	},
    render: function() {
	console.log(this);
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


StationGraphView = Backbone.View.extend({
});


StationModel = Backbone.Model.extend({
    url:function () {
	return "/getStation/"+this.get('stationName');
    },
    initialize: function(data) {
	console.log(data);
	if (data===undefined) {
	    data = '';
	}
	this.set({'stationName':data});
	this.fetch();
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

