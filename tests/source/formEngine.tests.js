
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

});