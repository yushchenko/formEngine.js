
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