
describe('fe.triggers', function() {
    
    it('should have appropriate interface', function() {

        expect(fe.triggers).toBeDefined();
        expect(typeof fe.triggers.expression).toEqual('function');
        expect(typeof fe.triggers.change).toEqual('function');
    });

    it('should execute function and send message', function() {

        var engine = fe.engine(),
            model = fe.model({ engine: engine }),
            data = { x: 1, y: 2 },
            t = fe.triggers.expression({
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

    it('should evaluate change status and send message', function() {

        var engine = fe.engine(),
            model = fe.model({ engine: engine }),
            t = fe.triggers.change({
                id: 't1',
                type: 'change',
                processorArgs: ['x', 'y'],
                signal: 'test',
                engine: engine
            }),
            result;

        engine.addRule({ receiverId: 't1', path: ['x', 'y'], signal: 'change' });

        engine.subscribe({ senderId: 't1', signal: 'change' }, function(msg) {
            result = msg.data;
        });

        engine.sendMessage({ senderId: '*', path: 'x', signal: 'change', data: 'changed' });
        expect(result).toEqual('changed');

        engine.sendMessage({ senderId: '*', path: 'x', signal: 'change', data: 'saved' });
        expect(result).toEqual('saved');

        engine.sendMessage({ senderId: '*', path: 'y', signal: 'change', data: 'changed' });
        expect(result).toEqual('changed');

        engine.sendMessage({ senderId: '*', path: 'y', signal: 'change', data: 'default' });
        expect(result).toEqual('saved');

        engine.sendMessage({ senderId: '*', path: 'x', signal: 'change', data: 'default' });
        expect(result).toEqual('default');
    });

});