
describe('fe.engine', function() {
    
    it('should declare engine constructor', function() {
        expect(fe.engine).toBeDefined();
    });

    it('should have appropriate interface', function() {

        var e = fe.engine({});

        expect(typeof e.addReceiver).toEqual('function');
        expect(typeof e.addRule).toEqual('function');
        expect(typeof e.addTrigger).toEqual('function');
        expect(typeof e.sendMessage).toEqual('function');
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
            rule = { receiverId: 'r1', path: 'a', signal: 'value' },
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
            msg1 = { senderId: 'm1', path: 'a.b.c', signal: 'value', data: 'test a.b.c'},
            msg2 = { senderId: 'm1', path: 'a.b.d', signal: 'value', data: 'test a.b.d'};

        e.addReceiver('r1', receiver);
        e.addRule(rule);

        e.sendMessage(msg1);
        e.sendMessage(msg2);

        expect(receiver.receiveMessage).toHaveBeenCalledWith(msg1);
    });

    it('should send message to trigger', function() {

        var e = fe.engine(),
            receiver = { receiveMessage: jasmine.createSpy('receiveMessage')},
            rule = { receiverId: 'r1', path: ['p1', 'p2'], signal: 'value' },
            msg1 = { senderId: 'm1', path: 'p1', signal: 'value', data: 'test p1'},
            msg2 = { senderId: 'm2', path: 'p2', signal: 'value', data: 'test p2'},
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

});