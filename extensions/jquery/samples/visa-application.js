$(function() {

    var data = {
        step: {
            code: '01',
            name: 'Personal info'
        },
        applicant: {
            firstName: null,
            lastName: null,

            isMaried: false,

            country: null
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
        { code: '03', name: 'Origin' },
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
                        properties: { label: 'First Name' }
                    },
                    {
                        typeName: 'textBox',
                        binding: 'applicant.lastName',
                        properties: { label: 'Last Name' }
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
                        properties: { list: 'countries', label: 'Country of origin' }
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
                app.model.set('step', nextStep);
                return;
            }
        }
    });

    app.engine.subscribe({ senderId: 'apply', signal: 'click' }, function(msg) {

    });

});