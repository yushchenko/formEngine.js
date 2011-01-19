
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
            },
            {
                id: 'discount',
                typeName: 'textBox',
                hidden: '!:customer.hasDiscount',
                binding: 'customer.discount',
                validationRules: { required: true }
            }
        ]
    };

    var data = {
        customer: {
            firstName: 'John',
            lastName: 'Smith',
            hasDiscount: true,
            discount: null
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

        that.setHidden = function(hidden) {
            that.hidden = hidden;
        };

        that.showErrors = function(errors) {
            that.errors = errors;
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

    it('should validate only visible fields', function() {

        var app = getApp(),
            discount = app.view.getElementById('discount');

        app.model.validate();
        expect(discount.errors.length).toEqual(1);


        app.model.set('customer.hasDiscount', false); // hide discount element
        expect(discount.hidden).toEqual(true);
        app.model.validate();
        expect(discount.errors.length).toEqual(0);
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