
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