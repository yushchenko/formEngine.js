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
});