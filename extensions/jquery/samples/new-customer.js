$(function() {

    var ui = fe.jquery.dsl,
        metadata = ui.view().container('view')(

            ui.textBox('customer.firstName').label('First Name')
                .required(),

            ui.textBox('customer.lastName').label('Last Name')
                .required().minLength(2).maxLength(20),

            ui.label().label('Full Name')
                .value('[:customer.firstName || "", :customer.lastName || ""].join(" ")'),

            ui.comboBox('customer.country').label('Country')
                .list('countries')
                .required(),

            ui.checkBox('customer.hasDiscount').label('Has Discount'),

            ui.checkBox('customer.hasVariableDiscount').label('Has Variable Discount')
                .hidden('!:customer.hasDiscount'),

            ui.numberEditor('customer.discount').label('Discount')
                .hidden('!:customer.hasDiscount')
                .readonly('!:customer.hasVariableDiscount')
                .required().minValue(0).maxValue(100),

            ui.toolBar(
                ui.button('undo').label('Undo').icon('ui-icon-arrowreturnthick-1-w'),
                ui.button('redo').label('Redo').icon('ui-icon-arrowreturnthick-1-e'),
                ui.button().id('saveButton').label('Save').icon('ui-icon-disk')
            )
                    
        ).get(),

        data = {
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
        },

        app = fe.jquery.runSimpleApp({ metadata: metadata, data: data, trackChanges: true });

    app.engine.subscribe({ senderId: 'saveButton', signal: 'click' }, function (msg) {

        if (app.model.validate()) {

            showData($('#dialog'), app.model.get('customer'));

            app.model.markSave();
        }
    });

    app.engine.subscribe({ senderId: ['undo', 'redo'], signal: 'click' }, function(msg) {
        app.model[msg.senderId]();
    });

    app.engine.subscribe({ signal: 'change' }, function(msg) {
        setupButtons();
    });

    function setupButtons() {

        function set(id, method) {
            app.view.getElementById(id).setReadonly(app.model[method]() === 0);
        }

        set('undo', 'getUndoCount');
        set('redo', 'getRedoCount');
    }

    setupButtons();

    window.model = app.model; // to play with data binding from console ;)
});