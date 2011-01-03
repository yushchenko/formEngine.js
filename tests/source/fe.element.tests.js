
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
    });

    it('should initialize propeties from metadata', function() {

        var engine = fe.engine(),
            e = fe.element({ metadata: getElementMedatadata(), engine: engine });

        expect(e.id).toEqual('test');
        expect(e.properties).toEqual({ test: 'ok', binding: 'a.b.c' });
        expect(e.children).toEqual([]);
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
            msg = { senderId: 'test', path: 'a.b.c', signal: 'value', data: 123 };

        engine.addReceiver('t', receiver);
        engine.addRule(rule);

        f.notifyValueChange(123);
        
        expect(receiver.receiveMessage).toHaveBeenCalledWith(msg);
    });

    it('should throw exception when notifyValueChange called for element without binding', function() {

        var engine = fe.engine(),
            element = fe.element({ metadata: {}, engine: engine });

        expect(function() { element.notifyValueChange(123); }).toThrow('element.notifyValueChange: can\'t send notification if binding property not defined.');
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