$(function() {

    var metadata = {
        id: 'testForm',
        typeName: 'view',
        properties: {
            viewContainerId: 'view'
        },
        children: [
            {
                id: 'firstName',
                typeName: 'textBox',
                binding: 'customer.firstName',
                properties: { label: 'First Name' }
            },
            {
                id: 'lastName',
                typeName: 'textBox',
                binding: 'customer.lastName',
                properties: { label: 'Last Name' }
            }
        ]
    };

    var data = {
        customer: {
            firstName: 'John',
            lastName: 'Smith'
        }
    };

    var provider = fe.metadataProvider({ metadata: metadata }),
        engine = fe.engine(),
        model = fe.model({ metadata: provider.getModelMetadata(), engine: engine }),
        view = fe.view({ metadata: provider.getViewMetadata(), elementTypes: fe.jquery.elements, engine: engine });

    engine.addRules(provider.getRules());
    engine.addTriggers(provider.getTriggers());

    view.initialize();

    model.set(data);

    window.model = model; // to play from console ;)
});