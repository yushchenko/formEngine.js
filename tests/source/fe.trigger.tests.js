
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