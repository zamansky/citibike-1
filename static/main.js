
DateModel = Backbone.Model.extend({
    defaults: { date: new Date()}
});


DateView = Backbone.View.extend({
    el:'#interface',
    initialize: function() {
	this.render();
    },
    events: {
	"change input[type=range]": "doChangeDate",
	"mouseup input[type=range]": "render"
    },
    doChangeDate : function(e) {
	console.log(e.target.value);
	
	var tmp = new Date();
	var d = new Date(parseInt(e.target.value));
	this.model.set({'date':d});
	//this.render();
    },
    render: function() {
	var date=this.model.get('date')
	var now=new Date()
	var max=now.getTime();
	var min=max-(1000*60*5)
	var subs={date:date,min:min,max:max};
	var t = _.template($("#time_template").html(),subs)
	this.$el.html(t);
	return this;
    }
});

var d,v;

$(document).ready(function(){
    d = new DateModel();
    v = new DateView({model:d});
});

