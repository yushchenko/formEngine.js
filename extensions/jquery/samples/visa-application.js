$(function() {

    var data = {
        applicant: {
            firstName: null,
            lastName: null,
            country: null
        },
        countries: [
            { id: 1, name: 'Great Britain' },
            { id: 2, name: 'Australia' },
            { id: 3, name: 'USA' }
        ]
    };

    var metadata = {
        typeName: 'view',
        properties: { viewContainerId: 'view' },
        children: [
            {
                typeName: 'textBox',
                binding: 'customer.firstName',
                properties: { label: 'First Name' }
            },
            {
                typeName: 'textBox',
                binding: 'customer.lastName',
                properties: { label: 'Last Name' },
                validationRules: { required: true, minLength: 2, maxLength: 20 }
            },
            {
                typeName: 'toolBar',
                children: [
                    {
                        id: 'nextButton',
                        typeName: 'button',
                        properties: { label: 'Next', icon: 'ui-icon-circle-triangle-e' }
                    }
                ]
            }
        ]
    };

    var app = fe.jquery.runSimpleApp(metadata, data);

    app.engine.subscribe({ senderId: 'nextButton', signal: 'click' }, function (msg) {
    });

});