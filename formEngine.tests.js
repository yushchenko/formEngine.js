
describe('fe', function() {
    
    it('should declare namespace', function() {
        expect(fe).toBeDefined();
    });

    it('should expose version', function() {
        expect(typeof fe.version).toEqual('string');
    });

    it('should return unique IDs', function() {

        var id1 = getUniqueId(),
            id2 = getUniqueId(),
            id3 = getUniqueId();

        expect(id1).not.toEqual(id2);
        expect(id2).not.toEqual(id3);
        expect(id3).not.toEqual(id1);
    });

    it('should return object property by path', function() {

        var obj = { x: 1, y: { z: 2 }, yy: null  };

        expect(getByPath(obj, 'x')).toEqual(1);
        expect(getByPath(obj, 'y.z')).toEqual(2);
        expect(getByPath(obj, 'not.existing.path')).not.toBeDefined();
        expect(getByPath(obj, 'yy.notPath')).not.toBeDefined();
    });

    it('should set object property by path', function() {

        var obj = { x: 1, y: { z: 2 } };

        setByPath(obj, 'x', 3);
        expect(obj.x).toEqual(3);

        setByPath(obj, 'y.z', 4);
        expect(obj.y.z).toEqual(4);

        setByPath(obj, 'not.existing.path', 5); 
        expect(obj.not).not.toBeDefined(); // should ignore not existing paths
    });

    it('should apply function to args', function() {

        var args = [];
        applyToArgs([1,2,3], function(a) { args.push(a); });
        expect(args).toEqual([1,2,3]);

        args = [];
        applyToArgs([[1,2],3], function(a) { args.push(a); });
        expect(args).toEqual([1,2,3]);

        args = [];
        applyToArgs([[]], function(a) { args.push(a); });
        expect(args).toEqual([]);
    });

    it('should trim strings', function() {
        expect(trim('')).toEqual('');
        expect(trim(null)).toEqual('');
        expect(trim(undefined)).toEqual('');
        expect(trim(' abc  ')).toEqual('abc');
    });

    it('should format strings', function() {

        expect(format()).toEqual('');
        expect(format('abc')).toEqual('abc');
        expect(format('I\'m {name}', {name: 'John'})).toEqual('I\'m John');
        expect(format('{firstName} {lastName}', {firstName: 'John', lastName: 'Smith' })).toEqual('John Smith');
    });
});
describe('fe.dsl', function () {

    it('should be defined', function() {

        expect(fe.dsl).toBeDefined();
        expect(fe.dsl.defaultElementProperties).toBeDefined();
        expect(typeof fe.dsl.elementConstructor).toEqual('function');
    });

    it('should create element with properties', function() {

        var element = fe.dsl.elementConstructor('test'),
            e1 = element().get(),
            e2 = element().property('a', 1).property('b', 2).get();

        expect(e1).toEqual({ typeName: 'test', properties: {}, validationRules: {}, elements: [] });
        expect(e2.properties).toEqual({ a: 1, b: 2});
    });

    it('should create children elements', function() {

        var element = fe.dsl.elementConstructor(),
            e = element(
                    element().id(1),
                    element().id(2)
                ).get(),
            e2 = element().id(1)(
                    element().id(2)
                ).get();

        expect(e.elements[0].id).toEqual(1);
        expect(e.elements[1].id).toEqual(2);

        expect(e2.id).toEqual(1);
        expect(e2.elements[0].id).toEqual(2);
    });

    it('showld allow to add new methods to all elements', function() {

        fe.dsl.defaultElementProperties.test = function(value) {
            this.element.testValue = value;
            return this.chain;
        };

        this.after = function() { delete fe.dsl.defaultElementProperties.test; };

        var element = fe.dsl.elementConstructor(),
            e = element().test('test value').get();

        expect(e.testValue).toEqual('test value');
    });

    it('should allow to add new element constructors', function() {

        var ui = {};

        ui.test = fe.dsl.elementConstructor('test',
            {
                initialize: function() {
                    this.element.initTest = 'initTest';
                },
                validate: function() {
                    if (!this.element.testValue) {
                        throw new Error('test error');
                    }
                }
            },
            {
                method: function(value) {
                    this.element.testValue = value;
                    return this.chain;
                }
            }
        );

        ui.test2 = fe.dsl.elementConstructor('test2');

        var e = ui.test().method('value').get(),
            e2 = ui.test2().get();

        expect(e.typeName).toEqual('test');
        expect(e.testValue).toEqual('value');
        expect(e2.typeName).toEqual('test2');
    });
});

describe('fe.rule', function() {

    it('should define appropriate methods according given configuration', function() {

        var rule1 = fe.rule({ receiverId: 'r1', senderId: 's1'}),
            rule2 = fe.rule({ receiverId: 'r1', path: 'p1'}),
            rule3 = fe.rule({ receiverId: 'r1', signal: 's1'});

        expect(rule1.receiverId).toEqual('r1');
        expect(typeof rule1.checkSender).toEqual('function');
        expect(rule1.checkPath).not.toBeDefined();
        expect(rule1.checkSignal).not.toBeDefined();

        expect(typeof rule2.checkPath).toEqual('function');
        expect(rule2.path).toEqual('p1');
        expect(typeof rule3.checkSignal).toEqual('function');
    });

    it('[bug] should check signal properly when several signals given', function() {

        var r = fe.rule({ receiverId: 'r1', signal: ['value', 'error'] });

        expect(r.checkSignal('value')).toEqual(true);
        expect(r.checkSignal('error')).toEqual(true);
        expect(r.checkSignal('other')).toEqual(false);
    });

    it('should transform data', function() {

        var rule1 = fe.rule({ receiverId: 'r1', path: 'a.b.c'}),
            rule2 = fe.rule({ receiverId: 'r1', signal: 'x' }),
            data = { a: { b: { c: 'value' } } };

        expect(rule1.transformData(data, '')).toEqual('value');
        expect(rule2.transformData(data, '')).toEqual(data); // no transformation
    });

});

describe('fe.trigger', function() {
    
    it('should have appropriate interface', function() {

        var engine = fe.engine(),
            t = fe.trigger({ id: 't1', engine: engine });

        expect(typeof t.receiveMessage).toEqual('function');
    });

    it('should execute function and send message', function() {

        var engine = fe.engine(),
            model = fe.model({ engine: engine }),
            data = { x: 1, y: 2 },
            t = fe.trigger({
                id: 't1',
                processorArgs: ['x', 'y'],
                processor: function (x,y) { return x + y; },
                signal: 'test',
                engine: engine
            }),
            r = { receiveMessage: jasmine.createSpy() };

        engine.addRule({ receiverId: 't1', path: ['x', 'y'], signal: 'value' });

        engine.addReceiver('r1', r);
        engine.addRule({ receiverId: 'r1', signal: 'test' });

        model.set(data);
        
        expect(r.receiveMessage).toHaveBeenCalledWith({ senderId: 't1', signal: 'test', data: 3 });
    });

});

describe('fe.engine', function() {
    
    it('should declare engine constructor', function() {
        expect(fe.engine).toBeDefined();
    });

    it('should have appropriate interface', function() {

        var e = fe.engine({});

        expect(typeof e.addReceiver).toEqual('function');
        expect(typeof e.addRule).toEqual('function');
        expect(typeof e.addRules).toEqual('function');           
        expect(typeof e.addTrigger).toEqual('function');
        expect(typeof e.addTriggers).toEqual('function');
        expect(typeof e.sendMessage).toEqual('function');
    });

    it('should check receiver id and receiver', function() {

        var e = fe.engine(),
            r = { receiveMessage: function() {} };

        expect(function() { e.addReceiver();  }).toThrow(msg.receiverIdMustBeString);
        expect(function() { e.addReceiver('1', {}); }).toThrow(msg.noReceiveMessageMethod);
        e.addReceiver('1', r);
        expect(function() { e.addReceiver('1', r);  }).toThrow(msg.notUniqueReceiverId);
    });

    it('should check rule', function() {

        var e = fe.engine();

        expect(function() { e.addRule({}); }).toThrow(msg.noReceiverId);
    });

    it('should send simple message (event subscription)', function() {

        var e = fe.engine(),
            receiver = { receiveMessage: jasmine.createSpy('receiveMessage') },
            rule = { receiverId: 'r1', senderId: 's1', signal: 'test' },
            message =  { senderId: 's1', signal: 'test', data: 'test data' };

        e.addReceiver('r1', receiver);
        e.addRule(rule);

        e.sendMessage(message);

        expect(receiver.receiveMessage).toHaveBeenCalled();
    });

    it('should send messages from control to model', function() {

        var e = fe.engine(),
            receiver = { receiveMessage: jasmine.createSpy('receiveMessage') },
            rule = { receiverId: 'r1', signal: 'value' },
            message1 =  { senderId: 's1', path: 'a.b.c', signal: 'value', data: 'test data c' },
            message2 =  { senderId: 's1', path: 'a.b.d', signal: 'value', data: 'test data d' };

        e.addReceiver('r1', receiver);
        e.addRule(rule);

        e.sendMessage(message1);
        expect(receiver.receiveMessage).toHaveBeenCalledWith(message1);

        e.sendMessage(message2);
        expect(receiver.receiveMessage).toHaveBeenCalledWith(message2);
    });

    it('should send messages from model to control', function() {

        var e = fe.engine(),
            receiver = { receiveMessage: jasmine.createSpy('receiveMessage')},
            rule = { receiverId: 'r1', path: 'a.b.c', signal: 'value' },
            msg1 = { senderId: 'm1', path: 'a.b.c', rulePath: 'a.b.c', signal: 'value', data: 'test a.b.c'},
            msg2 = { senderId: 'm1', path: 'a.b.d', rulePath: 'a.b.c', signal: 'value', data: 'test a.b.d'};

        e.addReceiver('r1', receiver);
        e.addRule(rule);

        e.sendMessage(msg1);
        e.sendMessage(msg2);

        expect(receiver.receiveMessage).toHaveBeenCalledWith(msg1);
    });

    it('should extract data according subpath if rule path longer than msg path', function() {

        var e = fe.engine(),
            receiver = { receiveMessage: jasmine.createSpy('receiveMessage')},
            rule = { receiverId: 'r1', path: 'a.b.c', signal: 'value' },

            msg1 = { senderId: 'm1', path: '', signal: 'value', data: {a: {b: {c: 1}}}},
            expMsg1 = { senderId: 'm1', path: '', rulePath: 'a.b.c', signal: 'value', data: 1},

            msg2 = { senderId: 'm1', path: 'a', signal: 'value', data: {b: {c: 2}}},
            expMsg2 = { senderId: 'm1', path: 'a', rulePath: 'a.b.c', signal: 'value', data: 2},

            msg3 = { senderId: 'm1', path: 'a.b', signal: 'value', data: {c: 3}},
            expMsg3 = { senderId: 'm1', path: 'a.b', rulePath: 'a.b.c', signal: 'value', data: 3},

            msg4 = { senderId: 'm1', path: 'a.b.c', rulePath: 'a.b.c', signal: 'value', data: 4};

        e.addReceiver('r1', receiver);
        e.addRule(rule);

        e.sendMessage(msg1);
        expect(receiver.receiveMessage).toHaveBeenCalledWith(expMsg1);

        e.sendMessage(msg2);
        expect(receiver.receiveMessage).toHaveBeenCalledWith(expMsg2);

        e.sendMessage(msg3);
        expect(receiver.receiveMessage).toHaveBeenCalledWith(expMsg3);

        e.sendMessage(msg4);
        expect(receiver.receiveMessage).toHaveBeenCalledWith(msg4);
    });

    it('should send message to trigger', function() {

        var e = fe.engine(),
            receiver = { receiveMessage: jasmine.createSpy('receiveMessage')},
            rule = { receiverId: 'r1', path: ['p1', 'p2'], signal: 'value' },
            msg1 = { senderId: 'm1', path: 'p1', rulePath: ['p1', 'p2'], signal: 'value', data: 'test p1'},
            msg2 = { senderId: 'm2', path: 'p2', rulePath: ['p1', 'p2'], signal: 'value', data: 'test p2'},
            msg3 = { senderId: 'm3', path: 'p_other', signal: 'value', data: 'test p other'};

        e.addReceiver('r1', receiver);
        e.addRule(rule);

        e.sendMessage(msg1);
        expect(receiver.receiveMessage).toHaveBeenCalledWith(msg1);

        e.sendMessage(msg2);
        expect(receiver.receiveMessage).toHaveBeenCalledWith(msg2);

        e.sendMessage(msg3);
        expect(receiver.receiveMessage).not.toHaveBeenCalledWith(msg3);
    });

    it('should send message from trigger', function() {

        var e = fe.engine(),
            c1 = { receiveMessage: jasmine.createSpy('c1.receiveMessage')},
            c2 = { receiveMessage: jasmine.createSpy('c2.receiveMessage')},
            rule1 = { receiverId: 'c1', senderId: 't', signal: 'hidden' },
            rule2 = { receiverId: 'c2', senderId: 't', signal: 'hidden' },
            msg = { senderId: 't', signal: 'hidden', data: true };
        
        e.addReceiver('c1', c1);
        e.addReceiver('c2', c2);
        e.addRules([rule1, rule2]);

        e.sendMessage(msg);
        expect(c1.receiveMessage).toHaveBeenCalledWith(msg);
        expect(c2.receiveMessage).toHaveBeenCalledWith(msg);
    });

    it('should throw exception when sending message to unknown receiver', function() {

        var e = fe.engine(),
            rule = { receiverId: 'not existing', senderId: 't', signal: 'test' },
            msg = { senderId: 't', signal: 'test'};

        e.addRule(rule);
        expect(function() {  e.sendMessage(msg); }).toThrow(msg.receiverNotFound);
    });

    it('should return value from registrated model', function() {

        var e = fe.engine(),
            model1 = fe.model({ engine: e }),
            model2 = fe.model({ engine: e }),
            data1 = { a: { b: { c: 'value1' } } },
            data2 = { x: { y: { z: 'value2' } } };

        model1.set(data1);
        model2.set(data2);

        expect(e.get('a.b.c')).toEqual('value1');
        expect(e.get('x.y.z')).toEqual('value2');
        expect(e.get('non.existing.path')).not.toBeDefined();
    });

    it('should accept function as receiver', function () {

        var e = fe.engine(),
            msg = { senderId: 's1', signal: 'test' },
            rule = { receiverId: 'r1', signal: 'test'},
            receivedMsg;

        e.addReceiver('r1', function(msg) {
            receivedMsg = msg;
        });

        e.addRule(rule);
        e.sendMessage(msg);
        
        expect(receivedMsg).toEqual(msg);
    });

    it('should add receiver and rule when subscribe method called', function () {

        var e = fe.engine(),
            msg = { senderId: 's1', signal: 'test' },
            receivedMsg;

        e.subscribe({ signal: 'test' }, function (m) {
            receivedMsg = m;
        });

        e.sendMessage(msg);

        expect(receivedMsg).toEqual(msg);
    });

});

describe('fe.model', function() {
    
    it('should declare fe.model constructor', function() {
        expect(fe.model).toBeDefined();
    });

    it('should have appropriate interface', function() {

        var  e = fe.engine(),
             m = fe.model({ engine: e });

        expect(typeof m.receiveMessage).toEqual('function');
        expect(typeof m.set).toEqual('function');
        expect(typeof m.get).toEqual('function');
        expect(typeof m.validate).toEqual('function');
    });

    it('should provide access to data', function() {

        var e = fe.engine(),
            m = fe.model({ engine: e }),
            data = { x: 1, y: { z: 2 } };

        m.set(data);

        expect(m.get()).toEqual(data);
        expect(m.get('x')).toEqual(1);
        expect(m.get('y.z')).toEqual(2);
        expect(m.get('not.existing.path')).toEqual(undefined); // broken path

        m.set('x', 3);
        m.set('y.z', 4);
        m.set('y.zz', 5);
        m.set('not.existing.path', 6);

        expect(m.get('x')).toEqual(3);
        expect(m.get('y.z')).toEqual(4);
        expect(m.get('y.zz')).toEqual(5); // new property
        expect(m.get('not.existing.path')).toEqual(undefined); // broken path
    });

    it('should update data when gets message with appropriate path and signal', function() {

        var e = fe.engine(),
            m = fe.model({ engine: e }),
            data = { x: 1, y: { z: 2 } },
            msg = { path: 'y.z', signal: 'value', data: 3 };

        m.set(data);
        expect(m.get('y.z')).toEqual(2);

        e.sendMessage(msg);

        expect(m.get('y.z')).toEqual(3);
    });

    it('should notify data update', function() {

        var e = fe.engine(),
            m = fe.model({ id: 'model', engine: e }),
            data = { x: 1, y: { z: 2 } },
            receiver = { receiveMessage: jasmine.createSpy() },
            rule = { receiverId: 'r1', path: 'y.z', signal: 'value' },
            msg1 = { senderId: 'model', path: '', rulePath: 'y.z', signal: 'value', data: 2},
            msg2 = { senderId: 'model', path: 'y.z', rulePath: 'y.z', signal: 'value', data: 3};

        e.addReceiver('r1', receiver);
        e.addRule(rule);
                    
        m.set(data);
        expect(receiver.receiveMessage).toHaveBeenCalledWith(msg1); // the first update

        m.set('y.z', 3);
        expect(receiver.receiveMessage).toHaveBeenCalledWith(msg2); // on data change by model.set()
    });

    it('should validate data on value message and send error message', function() {
        
        var e = fe.engine(),
            rules = [
                { path: 'x.y.z', validatorName: 'required' }
            ],
            m = fe.model({ engine: e, metadata: { validationRules: rules }}),
            data = { x: { y: { z: 1 } } },
            errors = [];

        m.set(data);

        e.subscribe({ path: 'x.y.z', signal: 'error'}, function(msg) {
            errors = msg.data;
        });

        e.sendMessage({ senderId: 's1', path: 'x.y.z', signal: 'value', data: null });
        expect(errors.length).toEqual(1);

        e.sendMessage({ senderId: 's1', path: 'x.y.z', signal: 'value', data: 1 });
        expect(errors.length).toEqual(0);
    });

    it('should return validation result', function() {

        var e = fe.engine(),
            rules = [
                { path: 'x.y.z', validatorName: 'required' },
                { path: 'x.y.z2', validatorName: 'required' }
            ],
            m = fe.model({ engine: e, metadata: { validationRules: rules }}),
            data = { x: { y: { z: 1, z2: 2 } } };

        expect(m.validate()).toEqual(false);

        m.set(data);
        expect(m.validate()).toEqual(true);

        m.set('x.y.z', null);
        expect(m.validate('x.y.z')).toEqual(false);
        expect(m.validate('x.y.z2')).toEqual(true);

        m.set('x.y.z', 1);
        expect(m.validate('x.y.z')).toEqual(true);
        expect(m.validate('x.y.z2')).toEqual(true);
    });

    it('should send error message on validate method if not suppressed', function () {
        
        var e = fe.engine(),
            rules = [
                { path: 'x.y.z', validatorName: 'required' }
            ],
            m = fe.model({ engine: e, metadata: { validationRules: rules }}),
            data = { x: { y: { z: 1 } } },
            errors = [];

        e.subscribe({ path: 'x.y.z', signal: 'error'}, function(msg) {
            errors = msg.data;
        });

        m.validate();
        expect(errors.length).toEqual(1);

        m.set(data);
        m.validate();
        expect(errors.length).toEqual(0);

        m.set('x.y.z', null);
        m.validate(undefined, true);
        expect(errors.length).toEqual(0);

        m.validate();
        expect(errors.length).toEqual(1);
    });

    it('[bug] should send value and properties to validator', function() {

        fe.validators.test = jasmine.createSpy();
        this.after(function() { delete fe.validators.test; });

        var e = fe.engine(),
            rules = [
                { path: 'x.y.z', validatorName: 'test', validatorProperties: { testProperty: 1 } }
            ],
            m = fe.model({ engine: e, metadata: { validationRules: rules }}),
            data = { x: { y: { z: 1 } } };

        m.validate();

        expect(fe.validators.test).toHaveBeenCalledWith(undefined, { testProperty: 1 });
    });

});

describe('fe.validationRule', function () {

    it('should have appropriate interface', function() {

        var e = fe.engine(),
            r = fe.validationRule({
                engine: e,
                path: 'x.y.z'
            });

        expect(typeof r.receiveMessage).toEqual('function');
        expect(typeof r.validate).toEqual('function');

        expect(r.path).toEqual('x.y.z');
    });

    it('should validate data using given validator if not hidden or readonly', function() {


        var e = fe.engine(),
            r = fe.validationRule({
                id: 'vr1',
                engine: e,
                path: 'x.y.z',
                validatorName: 'required',
                validatorProperties: { message: 'test error' }
            }),
            data = {};

        e.addRule({ receiverId: 'vr1', senderId: 'e', signal: 'validation-inactive'});

        expect(r.validate(data)).toEqual('test error');

        e.sendMessage({ senderId: 'e', signal: 'validation-inactive', data: true });
        expect(r.validate(data)).toEqual(undefined);

        e.sendMessage({ senderId: 'e', signal: 'validation-inactive', data: false });
        expect(r.validate(data)).toEqual('test error');
    });
});
describe('fe.validators', function() {

    it('should validate required', function () {

        var v = fe.validators.required,
            msg = 'error',
            properties = { message: msg };

        expect(v).toBeDefined();

        expect(v('value', properties)).toEqual(undefined);
        expect(v(0, properties)).toEqual(undefined);
        expect(v(new Date(), properties)).toEqual(undefined);
        expect(v({}, properties)).toEqual(undefined);
        expect(v([], properties)).toEqual(undefined);

        expect(v(undefined, properties)).toEqual(msg);        
        expect(v(null, properties)).toEqual(msg);
        expect(v(NaN, properties)).toEqual(msg);
        expect(v('', properties)).toEqual(msg);
        expect(v(' ', properties)).toEqual(msg);
    });

    it('should validate minLenght', function() {

        var v = fe.validators.minLength,
            msg = 'error',
            properties = { message: msg, length: 3 };

        expect(v).toBeDefined();

        expect(v(undefined, properties)).toEqual(undefined);
        expect(v('value', properties)).toEqual(undefined);
        expect(v(0, properties)).toEqual(undefined); // not string

        expect(v('12', properties)).toEqual(msg);
    });

    it('should validate maxLenght', function() {

        var v = fe.validators.maxLength,
            msg = 'error',
            properties = { message: msg, length: 3 };

        expect(v).toBeDefined();

        expect(v(undefined, properties)).toEqual(undefined);
        expect(v('val', properties)).toEqual(undefined);
        expect(v(0, properties)).toEqual(undefined); // not string

        expect(v('1234', properties)).toEqual(msg);
    });

    it('should validate minValue', function() {

        var v = fe.validators.minValue,
            msg = 'error',
            properties = { message: msg, value: 3 };

        expect(v).toBeDefined();

        expect(v(undefined, properties)).toEqual(undefined);
        expect(v(4, properties)).toEqual(undefined);

        expect(v(1, properties)).toEqual(msg);
    });

    it('should validate maxValue', function() {

        var v = fe.validators.maxValue,
            msg = 'error',
            properties = { message: msg, value: 3 };

        expect(v).toBeDefined();

        expect(v(undefined, properties)).toEqual(undefined);
        expect(v(1, properties)).toEqual(undefined);

        expect(v(4, properties)).toEqual(msg);
    });

    it('should format message', function() {

        var testValues = {
                required: null,
                maxLength: 'abcd',
                minLength: 'ab',
                maxValue: 4,
                minValue: 1
            },
            name, v;

        for (name in fe.validators) {
            if (fe.validators.hasOwnProperty(name)) {
                v = fe.validators[name];
                expect(v(testValues[name], { length: 3, value: 3, message: '{x}', x: 'test' })).toEqual('test');
            }
        }

    });

    it('should extend javascript dsl', function() {

        var element = fe.dsl.elementConstructor(),
            e = element().required().minLength(1).maxLength(30).minValue(1).maxValue(30).get();

        expect(e.validationRules).toEqual({ required: true, minLength: 1, maxLength: 30,
                                            minValue: 1, maxValue: 30 });
    });
});
describe('fe.changeTracker', function() {

    it('should have appropriate interface', function() {

        expect(fe.changeTracker).toBeDefined();

        var t = fe.changeTracker();

        expect(typeof t.push).toEqual('function');
        expect(typeof t.moveBack).toEqual('function');
        expect(typeof t.moveForward).toEqual('function');
        expect(typeof t.getBackCount).toEqual('function');
        expect(typeof t.getForwardCount).toEqual('function');
        expect(typeof t.getStatus).toEqual('function');           
    });

    it('should store changes', function() {

        var t = fe.changeTracker();

        t.push('C1');

        expect(t.moveBack()).toEqual('C1');
        expect(t.moveBack()).toEqual(undefined);
        expect(t.moveForward()).toEqual('C1');
        expect(t.moveForward()).toEqual(undefined);
    });

    it('should return amount of changes', function() {

        var t = fe.changeTracker();

        t.push('C1');

        expect(t.getBackCount()).toEqual(1);
        expect(t.getForwardCount()).toEqual(0);

        t.moveBack();

        expect(t.getBackCount()).toEqual(0);
        expect(t.getForwardCount()).toEqual(1);

        t.moveForward();

        expect(t.getBackCount()).toEqual(1);
        expect(t.getForwardCount()).toEqual(0);
    });

    it('should truncate forward changes on new change push', function() {

        var t = fe.changeTracker();

        t.push('C1');
        t.push('C2');
        t.push('C3');

        t.moveBack();
        t.moveBack();
        t.push('C4');

        expect(t.getForwardCount()).toEqual(0);
        expect(t.moveForward()).toEqual(undefined);
    });
    
});

describe('fe.view', function() {
    
    it('should declare fe.view constructor', function() {
        expect(fe.view).toBeDefined();
    });

    it('should have appropriate interface', function() {

        var engine = fe.engine(),
            v = getView(engine);

        expect(typeof v.initialize).toEqual('function');
        expect(typeof v.getElementById).toEqual('function');
    });

    it('should build element tree from view metadata', function() {

         var engine = fe.engine(),
             v = getView(engine);

         expect(v.element).toBeDefined();
         expect(v.element.id).toEqual('testForm');

         expect(v.element.elements.length).toEqual(2);
         expect(v.element.elements[0].id).toEqual('field1');
         expect(v.element.elements[1].properties).toEqual({ p: 'p2' });
    });

    it('should find element by id', function() {

         var engine = fe.engine(),
             v = getView(engine);

         expect(v.getElementById('testForm').id).toEqual('testForm');
         expect(v.getElementById('field2').id).toEqual('field2');
    });

    it('should initialize elements', function() {

         var engine = fe.engine(),
             v = getView(engine),
             form = v.getElementById('testForm');

         v.initialize();

         expect(form.hasBeenInitialized).toEqual(true);
    });

    function getView(engine) {
        return fe.view({
            metadata: getViewMetadata(),
            elementTypes: getElementTypes(),
            engine: engine
        });
    }

    function getViewMetadata() {

        return {
            id: 'testForm',
            typeName: 'form',
            elements: [
                {
                    id: 'field1',
                    typeName: 'textBox',
                    properties: { p: 'p1' }
                },
                {
                    id: 'field2',
                    typeName: 'textBox',
                    properties: { p: 'p2' }
                }
            ]
        };
    }

    function getElementTypes() {
        return {
            form: function(config) {
                var that = fe.element(config);

                that.initialize = function() {
                    that.hasBeenInitialized = true;
                };

                return that;
            },
            textBox: function(config) {
                return fe.element(config);
            }
        };
    }
});

describe('fe.element', function() {
    
    it('should declare fe.element constructor', function() {
        expect(fe.element).toBeDefined();
    });

    it('should have appropriate interface', function() {

        var engine = fe.engine(),
            e = fe.element({ metadata: getElementMedatadata(), engine: engine });

        expect(typeof e.receiveMessage).toEqual('function');
        expect(typeof e.initialize).toEqual('function');
        expect(typeof e.notifyValueChange).toEqual('function');
        expect(typeof e.setHidden).toEqual('function');
        expect(typeof e.setReadonly).toEqual('function');
        expect(typeof e.notifyValidationStatusChange).toEqual('function');
    });

    it('should initialize propeties from metadata', function() {

        var engine = fe.engine(),
            e = fe.element({ metadata: getElementMedatadata(), engine: engine });

        expect(e.id).toEqual('test');
        expect(e.properties).toEqual({ test: 'ok', binding: 'a.b.c' });
        expect(e.elements).toEqual([]);
    });

    it('should call setValue method on "value" message', function() {

        var engine = fe.engine(),
            f = field({ metadata: getElementMedatadata(), engine: engine }),
            rule = { receiverId: 'test', path: 'a.b.c', signal: 'value' },
            msg = { senderId: 'unknown', path: 'a.b.c', signal: 'value', data: 123 };

        engine.addRule(rule);
        engine.sendMessage(msg);

        expect(f.currentValue).toEqual(123);
    });

    it('should send "value" message when notifyValueChange called', function() {

        var engine = fe.engine(),
            f = field({ metadata: getElementMedatadata(), engine: engine }),
            receiver = { receiveMessage: jasmine.createSpy() },
            rule = { receiverId: 't', path: 'a.b.c', signal: 'value' },
            msg = { senderId: 'test', path: 'a.b.c', rulePath: 'a.b.c', signal: 'value', data: 123 };

        engine.addReceiver('t', receiver);
        engine.addRule(rule);

        f.notifyValueChange(123);
        
        expect(receiver.receiveMessage).toHaveBeenCalledWith(msg);
    });

    it('should throw exception when notifyValueChange called for element without binding', function() {

        var engine = fe.engine(),
            element = fe.element({ metadata: {}, engine: engine });

        expect(function() { element.notifyValueChange(123); }).toThrow(msg.elementWithoutBinding);
    });

    it('should iterate over child elements', function() {

        var engine = fe.engine(),
            element = fe.element({ metadata: {}, engine: engine }),
            child1 = fe.element({ metadata: { id: 'c1' }, engine: engine }),
            child2 = fe.element({ metadata: { id: 'c2' }, engine: engine }),
            ids = [], indexes = [];

        element.elements.push(child1, child2);

        element.eachChild(function(child, index) {
            ids.push(child.id);
            indexes.push(index);
        });

        expect(ids).toEqual(['c1', 'c2']);
        expect(indexes).toEqual([0, 1]);
    });

    it('should notify validation status change on setHidden and setReadonly', function() {

        var e = fe.engine(),
            element = fe.element({ metadata: { id: 'e1' }, engine: e }),
            status;

        e.subscribe({ senderId: 'e1', signal: 'validation-inactive' }, function (msg) {
            status = msg.data;
        });

        element.setHidden(true);
        expect(status).toEqual(true);

        element.setHidden(false);
        expect(status).toEqual(false);
    });

    function getElementMedatadata() {
        return {
            id: 'test',
            properties: { test: 'ok', binding: 'a.b.c' }
        };
    }

    function field(config) {
        var that = fe.element(config);

        that.setValue = function(value) {
            that.currentValue = value;
        };

        return that;
    }
});
describe('fe.expressionParser', function () {

    it ('should parse expressions', function () {

        var p = fe.expressionParser;

        expect(typeof p).toEqual('function');

        expect(p(':x.y.z').args).toEqual(['x.y.z']);
        expect(p(':x.y.z').processor(1)).toEqual(1);

        expect(p(':x.z + :y.z').args).toEqual(['x.z', 'y.z']);
        expect(p(':x.z + :y.z').processor(1,2)).toEqual(3);

        expect(p('[:x.z, :y.z].join(" ")').processor('John', 'Smith')).toEqual('John Smith');
    });

});

describe('fe.metadataProvider', function() {
    
    it('should declare fe.metadataProvider constructor', function() {
        expect(fe.metadataProvider).toBeDefined();
    });

    it('should have appropriate interface', function() {

        var p = fe.metadataProvider({ metadata: getMetadata() });

        expect(typeof p.getModelMetadata).toEqual('function');
        expect(typeof p.getViewMetadata).toEqual('function');
        expect(typeof p.getRules).toEqual('function');
        expect(typeof p.getTriggers).toEqual('function');
    });

    it('should return view metadata', function() {

        var p = fe.metadataProvider({ metadata: getMetadata() });

        expect(p.getViewMetadata()).toEqual({
            id: 'testForm',
            typeName: 'form',
            properties: { header: 'test form' },
            elements: [
                {
                    id: 'firstName',
                    typeName: 'textBox',
                    properties: { binding: 'customer.firstName' }
                },
                {
                    id: 'lastName',
                    typeName: 'textBox',
                    properties: { binding: 'customer.lastName' }
                },
                {
                    id: 'discount',
                    typeName: 'textBox',
                    properties: { binding: 'customer.discount' }
                }
            ]
        });
    });

    it('should return engine rules', function() {

        var p = fe.metadataProvider({ metadata: getMetadata() }),
            rules = p.getRules(),
            elementCount = 3, exprCount = 1, ruleCount = 4;

        expect(rules.length).toEqual(elementCount + 2*exprCount + ruleCount);

        expect(rules.slice(0,1)).toEqual([
            { receiverId: 'firstName', path: 'customer.firstName', signal: ['value', 'error'] }
        ]);

    });

    it('should return triggers', function() {

        var p = fe.metadataProvider({ metadata: getMetadata() }),
            t = p.getTriggers()[0];

        expect(t.processorArgs).toEqual([ 'customer.hasDiscount' ]);
        expect(t.processor(true)).toEqual(false);
        expect(t.signal).toEqual('hidden');
    });

    it('should return model metadata (validation rules)', function() {

        var p = fe.metadataProvider({ metadata: getMetadata() }),
            rules = p.getModelMetadata().validationRules;

        expect(rules.length).toEqual(4);
        expect(rules[0].path).toEqual('customer.lastName');
        expect(rules[0].validatorName).toEqual('required');
        expect(rules[1].validatorProperties).toEqual({ length: 2 });
    });

    function getMetadata() {

        return {
            id: 'testForm',
            typeName: 'form',
            properties: { header: 'test form' },
            elements: [
                {
                    id: 'firstName',
                    typeName: 'textBox',
                    binding: 'customer.firstName'
                },
                {
                    id: 'lastName',
                    typeName: 'textBox',
                    binding: 'customer.lastName',
                    validationRules: { required: true, minLength: 2, maxLength: { length: 30 } }
                },
                {
                    id: 'discount',
                    typeName: 'textBox',
                    binding: 'customer.discount',
                    hidden: '!:customer.hasDiscount',
                    validationRules: { required: true }
                }
            ]
        };
    }
});

describe('formEngine', function() {

    var form = {
        id: 'testForm',
        typeName: 'form',
        hidden: ':customer.secret',
        elements: [
            {
                id: 'firstName',
                typeName: 'textBox',
                binding: 'customer.firstName'
            },
            {
                id: 'lastName',
                typeName: 'textBox',
                binding: 'customer.lastName'
            },
            {
                id: 'discount',
                typeName: 'textBox',
                hidden: '!:customer.hasDiscount',
                binding: 'customer.discount',
                validationRules: { required: true }
            }
        ]
    };

    var data = {
        customer: {
            firstName: 'John',
            lastName: 'Smith',
            hasDiscount: true,
            discount: null,
            secret: false
        }
    };

    var elementTypes = {};

    elementTypes.form = function(config) {
        var that = fe.element(config);

        return that;
    };

    elementTypes.textBox = function(config) {
        var that = fe.element(config);

        that.setValue = function (value) {
            that.currentValue = value;
        };

        that.showErrors = function(errors) {
            that.errors = errors;
        };

        return that;
    };

    it('should run sample from desing document', function() {

        var provider = fe.metadataProvider({ metadata: form }),
            engine = fe.engine(),
            model = fe.model({ metadata: provider.getModelMetadata(), engine: engine }),
            view = fe.view({ metadata: provider.getViewMetadata(), elementTypes: elementTypes, engine: engine });

        engine.addRules(provider.getRules());
        engine.addTriggers(provider.getTriggers());

        view.initialize();

        model.set(data);
    });

    it('should push data to controls', function() {

        var app = getApp(); 

        expect(app.view.getElementById('firstName').currentValue).toEqual('John');
        expect(app.view.getElementById('lastName').currentValue).toEqual('Smith');

        app.model.set('customer.firstName', 'Jane');

        expect(app.view.getElementById('firstName').currentValue).toEqual('Jane');
        expect(app.model.get('customer.firstName')).toEqual('Jane');
    });

    it('should push data from controls to model', function() {
        
        var app = getApp();

        app.view.getElementById('firstName').notifyValueChange('Jane'); // emitation of user edit

        expect(app.model.get('customer.firstName')).toEqual('Jane');
    });

    it('should validate only visible fields', function() {

        var app = getApp(),
            discount = app.view.getElementById('discount');

        app.model.validate();
        expect(discount.errors.length).toEqual(1);

        app.model.set('customer.hasDiscount', false); // hide discount element
        expect(discount.hidden).toEqual(true);
        app.model.validate();
        expect(discount.errors.length).toEqual(0);

        app.model.set('customer.hasDiscount', true); // show discount element
        app.model.validate();
        expect(discount.errors.length).toEqual(1);

        app.model.set('customer.secret', true); // hide all form - discount hidden as child
        app.model.validate();
        expect(discount.errors.length).toEqual(0);

    });

    function getApp() {

        var app = {};

        app.provider = fe.metadataProvider({ metadata: form });
        app.engine = fe.engine();
        app.model = fe.model({ metadata: app.provider.getModelMetadata(), engine: app.engine });
        app.view = fe.view({ metadata: app.provider.getViewMetadata(), elementTypes: elementTypes, engine: app.engine });

        app.engine.addRules(app.provider.getRules());
        app.engine.addTriggers(app.provider.getTriggers());

        app.view.initialize();

        app.model.set(data);

        return app;
    }
});
