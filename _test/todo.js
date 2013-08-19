$(function() {
    
    var TodoApp = {
        
        Collections: {},
        
        Models: {},
                        
        Views: {},
        
        Controllers: {},
        
        initialize: function() {
            new TodoApp.Controllers.Routes()
            Backbone.history.start();
        }
    };
    
    TodoApp.Models.Todo = Backbone.Model.extend({
        defaults: function() {
            return {
                title: 'empty todo...'
            }
        },
        
        initialize: function() {
            if (!this.get('title')) {
                this.set({
                    title: this.defaults.title
                });
            }
        },
        
        clear: function() {
            this.destroy();
        }
    });
    
    TodoApp.Collections.TodoList = Backbone.Collection.extend({
        model: TodoApp.Models.Todo
    });
    
    TodoApp.Collections.Todos = new TodoApp.Collections.TodoList;
    
    TodoApp.Views.TodoView = Backbone.View.extend({
        tagname: 'li',
        
        template: _.template($('#item-template').html()),
        
        events: {
            'click a.destroy': 'clear'
        },
        
        initialize: function() {
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
        },
        
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        
        clear: function() {
            this.model.clear();
        }
    });
    
    TodoApp.Views.AppView = Backbone.View.extend({
        el: $('body'),
        
        events: {
            "keypress #new-todo":  "createByEnter"
        },
        
        initialize: function() {          
            this.input = this.$("#new-todo");
            TodoApp.Collections.Todos.bind('add', this.addOne, this);
        },
        
        addOne: function(model) {
            var view = new TodoApp.Views.TodoView({
                model: model
            });
            this.$("#todo-list").append(view.render().el);
        },
        
        createByEnter: function(e) {
            if (e.keyCode != 13) return;
            if (!this.input.val()) return;                                   

            var todo = new TodoApp.Models.Todo({
                title : this.input.val()
            });
            TodoApp.Collections.Todos.add(todo);
            
            this.input.val('');
        }
    });
    
    TodoApp.Controllers.Routes = Backbone.Router.extend({
        routes: {
        "": 'start',
        "!helper": 'helper'
        },
        
        start: function() {
            var appView = new TodoApp.Views.AppView;
        },
        
        helper: function() {
            alert('helper');
        }
    });
    
    TodoApp.initialize();
        
});