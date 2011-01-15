$(function() {

    var data = {
        customer: {
            firstName: null,
            lastName: null,
            country: null,
            hasDiscount: false,
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
                properties: { label: 'Last Name' },
                validationRules: { required: true, minLength: 2, maxLength: 20 }
            },
            {
                id: 'country',
                typeName: 'comboBox',
                binding: 'customer.country',
                properties: { list: 'countries', label: 'Country' },
                validationRules: { required: true }
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
                        id: 'saveButton',
                        typeName: 'button',
                        properties: { label: 'Save', icon: 'ui-icon-disk' }
                    }
                ]
            }
        ]
    };

    var app = fe.jquery.runSimpleApp(metadata, data);

    app.engine.subscribe({ senderId: 'saveButton', signal: 'click' }, function (msg) {
        if (app.model.validate()) {
            alert('Data is valid and ready to be sent to server.');
        }
    });

    window.model = app.model; // to play with data binding from console ;)
});