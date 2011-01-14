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

    it('should format message', function() {

        var testValues = {
                required: null,
                maxLength: 'abcd',
                minLength: 'ab'
            },
            name, v;

        for (name in fe.validators) {
            if (fe.validators.hasOwnProperty(name)) {
                v = fe.validators[name];
                expect(v(testValues[name], { length: 3, message: '{x}', x: 'test' })).toEqual('test');
            }
        }

    });
});