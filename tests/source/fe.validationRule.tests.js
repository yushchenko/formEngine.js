
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

        e.addRule({ receiverId: 'vr1', senderId: 't', signal: ['hidden', 'readonly']});

        expect(r.validate(data)).toEqual('test error');

        e.sendMessage({ senderId: 't', signal: 'hidden', data: true });
        expect(r.validate(data)).toEqual(undefined);

        e.sendMessage({ senderId: 't', signal: 'hidden', data: false });
        expect(r.validate(data)).toEqual('test error');

        e.sendMessage({ senderId: 't', signal: 'readonly', data: true });
        expect(r.validate(data)).toEqual(undefined);

        e.sendMessage({ senderId: 't', signal: 'readonly', data: false });
        expect(r.validate(data)).toEqual('test error');
    });
});