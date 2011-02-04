$(function() {

    var ui = fe.jquery.dsl,

        metadata = ui.view().container('view')(

            ui.header().value('"Step " + :step.code + ": " + :step.name'),

            ui.panel().hidden(':step.code !== "01"')(

                ui.textBox('applicant.firstName').label('First Name')
                    .required(),

                ui.textBox('applicant.lastName').label('Last Name')
                    .required(),

                ui.datePicker('applicant.birthDate').label('Birth Date')
                    .required(),

                ui.textBox('applicant.passport').label('Passport Number')
            ),
            ui.panel().hidden(':step.code !== "02"')(

                ui.checkBox('applicant.isMarried').label('Are you married?'),

                ui.textBox('applicant.partner.firstName').label('Your Partner\'s First Name')
                    .hidden('!:applicant.isMarried')
                    .required(),

                ui.textBox('applicant.partner.lastName').label('Your Partner\'s Last Name')
                    .hidden('!:applicant.isMarried')
                    .required(),

                ui.datePicker('applicant.partner.birthDate').label('Your Partner\'s Birth Date')
                    .hidden('!:applicant.isMarried')
                    .required()
            ),
            ui.panel().hidden(':step.code !== "03"')(

                ui.comboBox('applicant.country').label('Country')
                    .list('countries')
                    .required(),

                ui.textBox('applicant.city').label('City')
                    .required(),

                ui.textBox('applicant.address').label('Address')
                    .required(),

                ui.textBox('applicant.phone').label('Phone')
            ),
            ui.panel().hidden(':step.code !== "04"')(

                ui.label().label('Full Name')
                    .value(':applicant.firstName + " " + :applicant.lastName'),

                ui.label().label('Partner\'s Full Name')
                    .value(':applicant.partner.firstName + " " + :applicant.partner.lastName')
                    .hidden('!:applicant.isMarried'),

                ui.label().label('Your Address')
                    .value(':applicant.address + ", " + :applicant.city + ", " + :applicant.country.name')
            ),
            ui.toolBar(

                ui.button('back').label('Back').icon('ui-icon-circle-triangle-w')
                    .hidden(':step.code === "01"'),

                ui.button('next').label('Next').icon('ui-icon-circle-triangle-e')
                    .hidden(':step.code === "04"'),

                ui.button('apply').label('Apply').icon('ui-icon-check')
                    .hidden(':step.code !== "04"')
            )
        ).get(),

        data = {
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

        app = fe.jquery.runSimpleApp({ metadata: metadata, data: data });

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
        if(app.model.validate()) {
            showData($('#dialog'), app.model.get('applicant'));
        }
    });

    window.model = app.model;
});