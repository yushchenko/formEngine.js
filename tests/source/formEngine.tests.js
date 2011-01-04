
describe('formEngine', function() {

    var form = {
        id: 'testForm',
        typeName: 'form',
        children: [
            {
                id: 'firstName',
                typeName: 'textBox',
                binding: 'customer.firstName'
            },
            {
                id: 'lastName',
                typeName: 'textBox',
                binding: 'customer.lastName'
            }
        ]
    };

    var data = {
        customer: {
            firstName: 'John',
            lastName: 'Smith'
        }
    };

    var elementTypes = {};

    elementTypes.form = function(config) {
        var that = fe.element(config);

        return that;
    };

    elementTypes.textBox = function(config) {
        var that = fe.element(config);

        that.setValue = function (value) {
            that.currentValue = value;
        };

        return that;
    };

    it('should run sample from desing document', function() {

        var provider = fe.metadataProvider({ metadata: form }),
            engine = fe.engine(),
            model = fe.model({ metadata: provider.getModelMetadata(), engine: engine }),
            view = fe.view({ metadata: provider.getViewMetadata(), elementTypes: elementTypes, engine: engine });

        engine.addRules(provider.getRules());
        engine.addTriggers(provider.getTriggers());

        view.initialize();

        model.set(data);
    });

    it('should push data to controls', function() {

        var app = getApp(); 

        expect(app.view.getElementById('firstName').currentValue).toEqual('John');
        expect(app.view.getElementById('lastName').currentValue).toEqual('Smith');

        app.model.set('customer.firstName', 'Jane');

        expect(app.view.getElementById('firstName').currentValue).toEqual('Jane');
        expect(app.model.get('customer.firstName')).toEqual('Jane');
    });

    it('should push data from controls to model', function() {
        
        var app = getApp();

        app.view.getElementById('firstName').notifyValueChange('Jane'); // emitation of user edit

        expect(app.model.get('customer.firstName')).toEqual('Jane');
    });

    function getApp() {

        var app = {};

        app.provider = fe.metadataProvider({ metadata: form });
        app.engine = fe.engine();
        app.model = fe.model({ metadata: app.provider.getModelMetadata(), engine: app.engine });
        app.view = fe.view({ metadata: app.provider.getViewMetadata(), elementTypes: elementTypes, engine: app.engine });

        app.engine.addRules(app.provider.getRules());
        app.engine.addTriggers(app.provider.getTriggers());

        app.view.initialize();

        app.model.set(data);

        return app;
    }
});