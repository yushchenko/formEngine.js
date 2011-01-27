
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