var App = {
    Models: {},
    Views: {},
    Controllers: {},
    Collections: {},
    initialize: function() {
        new App.Controllers.Routes();
        Backbone.history.start();
    }
};

App.Models.Hello = Backbone.Model.extend({
    url: function() {
        return './api.php';
    },
    initialize: function() {
        this.set({'message': 'loading data...'});
    }
});

App.Views.Hello = Backbone.View.extend({
    //el: $('body'),
    
    //template: _.template($('#body-template').html()),
    
    initialize: function(options) {
        this.options = options;
        this.bind('change', this.render);
        this.model = this.options.model;
        alert('111');
    },
    
    render: function() {
        //this.$el.html(this.template(this.model.toJSON()));
        //$(this.el).html('1111');
        //alert(changeit);
        return this;
    }
});

App.Controllers.Routes = Backbone.Router.extend({
    routes: {
        "!/hello": "hello"
    },
    hello: function() {
        var helloModel = new App.Models.Hello;
        helloModel.fetch({
            success: function(model) {
                //var helloView = new App.Views.Hello({model: model});
                //helloView.triggle('change');
                alert(model.toString());
            }
        });
    }
});

App.initialize();