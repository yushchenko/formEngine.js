## Form Engine Design

### Metadata Structure

    element
        id: element id

        typeName: form|container|control|text|number|date|entity|list

        controlName: textBox|comboBox|datePicker|...
        controlProperties: {...}

        valueExp: binding expression
        hiddenExp: binding expression
        readonlyExp: binding expression
        
        elements: []

        validationRules: [
            validatorName: required|maxLength|minLength|...
            properties: {...}
        ]

### Expressions

Expression types:

  - direct two way bindings like `request.client.name`, uses the first argument only
  - templates for example `<%=name%> (<%=code%>)`, uses the first argument only
  - lambdas like `entity.countryId === model.person.country.id`
  - function

Expression contexts and arguments:

  - value (two way if direct, one way otherwise), arguments - model
  - hidden, readonly, entity list (one way), arguments - model
  - entity list formatter and filter, arguments - entity, model
  - ...

### Form Engine Interface

    formEngine.controls[...]
    formEngine.validators[...]

    var form = formEngine({ containerId: id, form: metadata, model: model });
    form.show();

    form.model.request.setValue('step', '02');

    form.validate();

### Element Interface

    formEngine.element(metadata)
        typeName
        controlName
        control
        
        container
        elements

### Control Interface

    control(properties, element, engine): formEngine.controlBase

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
    formEngine.lambda
    
