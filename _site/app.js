var App = Em.Application.create({
    name: "PS",
    
    Models:      Ember.Object.extend(),
    Views:       Ember.Object.extend(),
    Controllers: Ember.Object.extend(),

    // Sniff the URL if we're running as an elasticsearch `_site` plugin
    //
    elasticsearch_url: function() {
	var location = window.location
	return (/_plugin/.test(location.href.toString())) ? location.protocol + "//" + location.host : "http://localhost:9200"
    }(),
    
    ready: function() {
	var index_url = [App.store.adapter.url, "psutils"].join('/');
	
	// Let's check if the `psutils` index exists...
	//
	jQuery.ajax({
	    url:   index_url,
	    type:  'HEAD',
	    error: function(xhr, textStatus, error) {
		// ... elasticsearch appears to be down (no response)
		//
		if ( ""          == error ) App.set("elasticsearch_unavailable", true);
		//
		// ... elasticsearch is up but the index is missing, let's create it
		//
		if ( "Not Found" == error ) jQuery.post(index_url, {}, function(data) {});
	    }
	});
    }
});

// Define a store for the application
//
App.store = DS.Store.create({
    revision: 4,
    adapter: DS.ElasticSearchAdapter.create({url: App.elasticsearch_url})
});

// Define the model using _Ember Data_ API
//
App.Models.Monitor = DS.Model.extend({
    // Properties:
    //
    hostname:   DS.attr('string'),
    timestamp:  DS.attr('integer'),
    
    
});

App.Models.Monitor.reopenClass({
    // Define the index and type for elasticsearch
    //
    url: 'psutils/PS'
});

App.Controllers.readings = Ember.ArrayController.create({
    // TODO: Display sorted with `sortProperties`,
    //       currently fails with `Cannot read property 'length' of undefined` @ ember-1.0.pre.js:18675
    //
    content: App.Models.Monitor.find(),

    worst_writes: function() {
	
    },
    
    hosts: function() {
	return 0;
    },
    
    recorded: function() {
	return this.filterProperty('completed', false);
    }.property('@each.completed').cacheable()
});
