## Form Engine Design

### Introduction

FormEngine.js implements MVC pattern and consists of 3 parts: model, engine and view.
Model is responsible for data access, validation and change tracking.
Engine works like a controler, it passes messages between model and view.
View just presents data to user.

The main difference between formEngine.js and classical MVC is that
every FormEngine's component is configured using metadata.
Model's metadata contains validation rules.
View's metadata represents visual tree and cares information about UI controls properties.
Engine's configuration consists of set rules and triggers.
A rule instructs engine how to pass messages between receivers.
A trigger is a kind of filter, it gets a message, makes certain calculations and sends message back.


### Engine

Responsibilities:

* maintains catalog of message receivers;
* routes messages to receivers according rules;
* executes triggers;

Message structure:

    senderId: one
    path: undefined|one
    rulePath: undefined|one          // path from rule
    signal: one
    data: undefined|one

Rule structure:

    receiverId: one
    senderId: undefined|one|list
    path: undefined|one|list         // link to data, e.g. request.client.name
    signal: undefined|one|list       // value, changes, errors, click, select

Trigger structure:

    id: one
    processor: one                  // function, gets in and returns out message
    processorArgs: list
    signal: one
    
Rule examples:

* control's value  { path: request.client.name, signal: value|errors|changes }
* model binding { path: request, signal: value }
* event subscription { senderId: saveButton, signal: click }
* trigger { path: [path1, path2, ...], signal: value } 
* control's on trigger { senderId: txxx, signal: hidden|readonly }      


### Model

Responsibilities:

* provides data access and notifies other participants about data changes;
* updates data according received messages;
* validates data and notifies when validation status changes,
  can be extended adding new types of validators;
* tracks data changes, allows undo or redo data changes, notifies data status changes;

Configuration:

    engine: {reference to engine, mandatory}
    metadata: {model metadata, validation rules}
    
Model Metadata:

    validationRules: []
         path
         validatorName
         validatorProperties

Validation

A validator is function that gets value and validation rule properties as arguments
and returns error message if data invalid or undefined value otherwise.
All validators should be referenced in fe.validators object by name.

On value message model validates received data and sends result of validation
(array of errors) in error message[s].

Model's validation can be forced using validate([path], [skipNotification]) method.
By default this method also sends {error} messages
but this notification can be supressed using the second parameter.
Validate method returns true if data is valid and false otherwise.

Set method doesn't trigger validation, the data's assumed to be valid.


### View

Responsibilities:

* initialize element hierarchy using metadata;
* provides access to elements by id;

Configuration:

    engine: {reference to engine, mandatory}
    metadata: {metadata}
    elementTypes: {reference to dictionary which contains element type's constructors by name}
    defaultElementType: {default element type, used when typeName in metadata is empty}

View Metadata:

    id: 'element id, mandatory'
    typeName: 'element type name, if not provided, view.defaultElement will be used'
    children: [references to child elements]
    properties: {}



### Element

Responsibilities:

* represents data to user, refreshes on change notifications;
* allows user to edit data and notifies about changes;
* presents data status: errors, changes;
* can be extended adding new types of controls;

Configuration:

    engine: {reference to engine, mandatory}
    metadata: {metadata}


### Metadata Provider

Responsibilities:

* gets form description in format convinient for developer
  and returns metadata for model, engine and view.

Configuration:

    metadata: {full form metadata}

Form Metadata:

    id: 'element id, should be unique; if not provided, will be generated'
    typeName: 'element type name, determines which element type will be used'
    binding: 'element data binding'
    children: [references to child elements]
    properties: {}


### Code Sample

    var provider = fe.metadataProvider({ metadata: form }),
        engine = fe.engine(),
        model = fe.model({ metadata: provider.getModelMetadata(), engine: engine }),
        view = fe.view({ metadata: provider.getViewMetadata(), elementTypes: {...}, engine: engine });

    engine.addRules(provider.getRules());
    engine.addTriggers(provider.getTriggers());

    view.initialize();

    model.set(data);
