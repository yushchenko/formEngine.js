$(function() {

    var data = {
        customer: {
            firstName: 'John',
            lastName: 'Smith',
            country: { id: 2 },
            hasDiscount: true,
            hasVariableDiscount: false,
            discount: 10
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
        properties: { viewContainerId: 'view' },
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
            },
            {
                id: 'hasDiscount',
                typeName: 'checkBox',
                binding: 'customer.hasDiscount',
                properties: { label: 'Has Discount' }
            },
            {
                id: 'hasVariableDiscount',
                typeName: 'checkBox',
                binding: 'customer.hasVariableDiscount',
                hidden: '!customer.hasDiscount',
                properties: { label: 'Has Variable Discount' }
            },
            {
                id: 'discount',
                typeName: 'textBox',
                binding: 'customer.discount',
                hidden: '!customer.hasDiscount',
                readonly: '!customer.hasVariableDiscount',
                properties: { label: 'Discount' }
            },
            {
                typeName: 'toolBar',
                children: [
                    {
                        id: 'validateButton',
                        typeName: 'button',
                        properties: { label: 'Validate', icon: 'ui-icon-check' }
                    }
                ]
            }
        ]
    };

    var app = fe.jquery.runSimpleApp(metadata, data);

    app.engine.subscribe({ senderId: 'validateButton', signal: 'click' }, function (msg) {
        console.log('click');
    });

    window.model = app.model; // to play from console ;)
});