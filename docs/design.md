## Form Engine Design

### Metadata Structure

    element
        typeName: form|container|control|string|number|date|entity|list
        controlName: textBox|comboBox|datePicker|...
        
        valueExp: binding expression
        hiddenExp: binding expression
        readonlyExp: binding expression
        
        elements: []

        properties: {...}

        validationRules: [
            validatorName: required|maxLength|minLength|...
            properties: {...}
        ]

### Form Engine Interface

    var form = formEngine({ container: id, form: metadata, ... });
    form.bindData(data);
    form.show();

    form.model.request.setValue('step', '02');

    form.validate();

    formEngine.controls[...]
    formEngine.validators[...]

### Element Interface

    formEngine.element(metadata)
        typeName
        controlName
        control
        
        container
        elements

### Control Interface

    control(element, engine): formEngine.controlBase

        getMarkup()
        initialize() ???
        
        setValue(value)
        setHidden(hidden)
        setReadonly(readonly)
        setState(state)

        onValueChanged

### Validator Interface


### Utils

    formEngine.event
    formEngine.template
    
