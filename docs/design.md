## Form Engine Design

### Introduction

FormEngine.js implements MVC pattern, it consists of 3 parts: model, engine and view.
Model is responsible for data access, data validation and change tracking.
Engine works like a controler, it passes messages between model and view.
View presents data to user and allows to edit it.

The main difference between formEngine.js and classical MVC is that
every FormEngine's component is configured using metadata.
Model's metadata contains validation rules.
View's metadata is represented as visual tree, cares information
about UI controls and their properties.
Engine's configured by set of rules and triggers.
A rule instructs engine how to pass messages between components.
A trigger is a kind of filter, it gets message, makes calculation and send next message.

### Model
* provides data access and notifies other participants about data changes;
* changes data according received messages;
* validates data and notifies when validation status changes;
* tracks data changes, allows undo or redo data changes, notifies data status changes;
* can be extended adding new types of validators;

### Engine
* maintains catalog of message receivers;
* routes messages to receivers according rules;
* executes triggers;

Message:
    senderId: one
    path: undefined|one
    signal: one
    data: undefined|one

Rule:
    receiverId: one
    senderId: undefined|one|list
    path: undefined|one|list         // link to data, e.g. request.client.name
    sigal: undefined|one|list        // value, changes, errors, click, select

Trigger:
    rule: one
    processor: one                  // function, gets in and returns out message
    
Rule examples:
* control's value  { path: request.client.name, signal: value|errors|changes }
* model binding { path: request, signal: value }
* event subscription { senderId: saveButton, signal: click }
* trigger { path: [path1, path2, ...], signal: value } 
* control's on trigger { senderId: txxx, signal: hidden|readonly }      

### View
* initialize element hierarchy using metadata;
* provides access to elements by id;

config:
    engine: {reference to engine, mandatory}
    metadata: {metadata}
    elementTypesLocation: {reference to dictionary which contains element type's constructors by name}
    defaultElementType: {default element type, used when typeName in metadata is empty}

### Element
* represents data to user, refreshes on change notifications;
* allows user to edit data and notifies about changes;
* presents data status: errors, changes;
* can be extended adding new types of controls;

config:
    engine: {reference to engine, mandatory}
    metadata: {metadata}

### Metadata Provider
* gets form description in format convinient for developer
  and returns metadata for model, engine and view.

config:
    metadata: {full form's metadata}

### View Metadata

    id: 'element id, if not provided, will be generated'
    typeName: 'element type name, if not provided, view.defaultElement will be used'
    children: [references to child elements]
    properties: {}

### Model Metadata

### Code Sample

    var provider = fe.metadataProvider(/* JSON, DSL etc */),
        engine = fe.engine(),
        model = fe.model({ metadata: provider.getModelMetadata(), engine: engine }),
        view = fe.view({ metadata: provider.getViewMetadata(), engine: engine });

    engine.addRules(provider.getRules());
    engine.addTriggers(provider.getTriggers());

    view.initialize();

    model.set(data);

