$(function() {

    var data = {
        step: {
            code: '01',
            name: 'Personal info'
        },
        applicant: {
            firstName: null,
            lastName: null,
            birthDate: null,
            passport: null,

            isMaried: false,
            partner: {
                firstName: null,
                lastName: null,
                birthDate: null
            },

            country: null,
            city: null,
            address: null,
            phone: null
        },
        countries: [
            { id: 1, name: 'Great Britain' },
            { id: 2, name: 'Australia' },
            { id: 3, name: 'USA' }
        ]
    },

    steps = [
        { code: '01', name: 'Personal Info' },
        { code: '02', name: 'Family' },
        { code: '03', name: 'Contact Details' },
        { code: '04', name: 'Check Your Application'}
    ],

    metadata = {
        typeName: 'view',
        properties: { viewContainerId: 'view' },
        children: [
            {
                typeName: 'header',
                value: '"Step " + :step.code + ": " + :step.name'
            },
            {
                typeName: 'panel',
                hidden: ':step.code !== "01"',
                children: [
                    {
                        typeName: 'textBox',
                        binding: 'applicant.firstName',
                        properties: { label: 'First Name' },
                        validationRules: { required: true }
                    },
                    {
                        typeName: 'textBox',
                        binding: 'applicant.lastName',
                        properties: { label: 'Last Name' },
                        validationRules: { required: true }
                    },
                    {
                        typeName: 'datePicker',
                        binding: 'applicant.birthDate',
                        properties: { label: 'Birth Date' }
                    },
                    {
                        typeName: 'textBox',
                        binding: 'applicant.Passport',
                        properties: { label: 'Passport Number' }
                    }

                ]
            },
            {
                typeName: 'panel',
                hidden: ':step.code !== "02"',
                children: [
                    {
                        typeName: 'checkBox',
                        binding: 'applicant.isMarried',
                        properties: { label: 'Are you married?' }
                    },
                    {
                        typeName: 'textBox',
                        binding: 'applicant.partner.firstName',
                        hidden: '!:applicant.isMarried',
                        properties: { label: 'Your Partner\'s First Name' },
                        validationRules: { required: true }
                    },
                    {
                        typeName: 'textBox',
                        binding: 'applicant.partner.lastName',
                        hidden: '!:applicant.isMarried',
                        properties: { label: 'Your Partner\'s Last Name ' },
                        validationRules: { required: true }
                    },
                    {
                        typeName: 'datePicker',
                        binding: 'applicant.partner.birthDate',
                        hidden: '!:applicant.isMarried',
                        properties: { label: 'Your Partner\'s Birth Date' }
                    }
                ]
            },
            {
                typeName: 'panel',
                hidden: ':step.code !== "03"',
                children: [
                    {
                        typeName: 'comboBox',
                        binding: 'applicant.country',
                        properties: { list: 'countries', label: 'Country' },
                        validationRules: { required: true }
                    },
                    {
                        typeName: 'textBox',
                        binding: 'applicant.city',
                        properties: { label: 'City' },
                        validationRules: { required: true }                        
                    },
                    {
                        typeName: 'textBox',
                        binding: 'applicant.address',
                        properties: { label: 'Address' },
                        validationRules: { required: true }
                    },
                    {
                        typeName: 'textBox',
                        binding: 'applicant.phone',
                        properties: { label: 'Phone' }
                    }

                ]
            },
            {
                typeName: 'panel',
                hidden: ':step.code !== "04"',
                children: [
                    {
                        typeName: 'label',
                        value: ':applicant.firstName + " " + :applicant.lastName',
                        properties: { label: 'Full Name' }
                    },
                    {
                        typeName: 'label',
                        value: ':applicant.partner.firstName + " " + :applicant.partner.lastName',
                        hidden: '!:applicant.isMarried',
                        properties: { label: 'Partner\'s Full Name' }
                    },
                    {
                        typeName: 'label',
                        value: ':applicant.address + ", " + :applicant.city + ", " + :applicant.country.name',
                        properties: { label: 'Your Address' }
                    }

                ]
            },
            {
                typeName: 'toolBar',
                children: [
                    {
                        id: 'back',
                        typeName: 'button',
                        hidden: ':step.code === "01"',
                        properties: { label: 'Back', icon: 'ui-icon-circle-triangle-w' }
                    },
                    {
                        id: 'next',
                        typeName: 'button',
                        hidden: ':step.code === "04"',
                        properties: { label: 'Next', icon: 'ui-icon-circle-triangle-e' }
                    },
                    {
                        id: 'apply',
                        typeName: 'button',
                        hidden: ':step.code !== "04"',
                        properties: { label: 'Apply', icon: 'ui-icon-check' }
                    }

                ]
            }
        ]
    };

    var app = fe.jquery.runSimpleApp(metadata, data);

    app.engine.subscribe({ senderId: ['back','next'], signal: 'click' }, function (msg) {

        var currentCode = app.model.get('step.code'),
            shift = msg.senderId === 'next' ? 1 : -1,
            i, len, nextStep;

        for (i = 0, len = steps.length; i < len; i += 1) {

            nextStep = steps[i + shift];

            if (steps[i].code === currentCode && nextStep) {
                if ((shift === 1 && app.model.validate()) || shift === -1) {
                    app.model.set('step', nextStep);
                }
                return;
            }
        }
    });

    app.engine.subscribe({ senderId: 'apply', signal: 'click' }, function(msg) {

    });

    window.model = app.model;
});