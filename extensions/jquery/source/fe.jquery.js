
fe.jquery = {};
fe.jquery.elements = {};
fe.jquery.dsl = {};

function template(str, data) { // Stolen from Underscore.js ;)

    var escapeRegExp = function(s) { return s.replace(/([.*+?\^${}()|\[\]\/\\])/g, '\\$1'); },
        c  = { start: '<%', end: '%>', interpolate : /<%=(.+?)%>/g },
        endMatch = new RegExp("'(?=[^"+c.end.substr(0, 1)+"]*"+escapeRegExp(c.end)+")","g"),
        fn = new Function('obj',
                          'var p=[],print=function(){p.push.apply(p,arguments);};' +
                          'with(obj||{}){p.push(\'' +
                          str.replace(/\r/g, '\\r')
                          .replace(/\n/g, '\\n')
                          .replace(/\t/g, '\\t')
                          .replace(endMatch,"✄")
                          .split("'").join("\\'")
                          .split("✄").join("'")
                          .replace(c.interpolate, "',$1,'")
                          .split(c.start).join("');")
                          .split(c.end).join("p.push('") + "');}return p.join('');");

    return data ? fn(data) : fn;
}

function runSimpleApp(metadata, data) {

    var app = {};

    app.provider = fe.metadataProvider({ metadata: metadata });
    app.engine = fe.engine();
    app.model = fe.model({ metadata: app.provider.getModelMetadata(), engine: app.engine, trackChanges: true });
    app.view = fe.view({
                           metadata: app.provider.getViewMetadata(),
                           elementTypes: fe.jquery.elements,
                           defaultElementType: fe.jquery.element,
                           engine: app.engine
                       });

    app.engine.addRules(app.provider.getRules());
    app.engine.addTriggers(app.provider.getTriggers());

    app.view.initialize();

    app.model.set(data);

    return app;
}

var msg = {
    undefinedViewContainerId: 'view.initialize: viewContainerId property must be defined for view element.'
};

fe.jquery.runSimpleApp = runSimpleApp;