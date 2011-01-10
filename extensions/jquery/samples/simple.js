$(function() {

    var data = {
        customer: {
            firstName: 'John',
            lastName: 'Smith',
            country: { id: 2 }
        },
        countries: [
            { id: 1, name: 'Great Britain' },
            { id: 2, name: 'Australia' },
            { id: 3, name: 'USA' }
        ]
    };

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
            },
            {
                id: 'country',
                typeName: 'comboBox',
                binding: 'customer.country',
                properties: { list: 'countries', label: 'Country' }
            }
        ]
    };

    var provider = fe.metadataProvider({ metadata: metadata }),
        engine = fe.engine(),
        model = fe.model({ metadata: provider.getModelMetadata(), engine: engine }),
        view = fe.view({
            metadata: provider.getViewMetadata(),
            elementTypes: fe.jquery.elements,
            defaultElementType: fe.jquery.element,
            engine: engine
        });

    engine.addRules(provider.getRules());
    engine.addTriggers(provider.getTriggers());

    view.initialize();

    model.set(data);

    window.model = model; // to play from console ;)
});