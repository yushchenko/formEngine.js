
describe('fe.metadataProvider', function() {
    
    it('should declare fe.metadataProvider constructor', function() {
        expect(fe.metadataProvider).toBeDefined();
    });

    it('should have appropriate interface', function() {

        var p = fe.metadataProvider({ metadata: getMetadata() });

        expect(typeof p.getModelMetadata).toEqual('function');
        expect(typeof p.getViewMetadata).toEqual('function');
        expect(typeof p.getRules).toEqual('function');
        expect(typeof p.getTriggers).toEqual('function');
    });

    it('should return view metadata', function() {

        var p = fe.metadataProvider({ metadata: getMetadata() });

        expect(p.getViewMetadata()).toEqual({
            id: 'testForm',
            typeName: 'form',
            properties: { header: 'test form' },
            children: [
                {
                    id: 'firstName',
                    typeName: 'textBox',
                    properties: { binding: 'customer.firstName' }
                },
                {
                    id: 'lastName',
                    typeName: 'textBox',
                    properties: { binding: 'customer.lastName' }
                },
                {
                    id: 'discount',
                    typeName: 'textBox',
                    properties: { binding: 'customer.discount' }
                }
            ]
        });
    });

    it('should return engine rules', function() {

        var p = fe.metadataProvider({ metadata: getMetadata() }),
            rules = p.getRules();

        expect(rules.length).toEqual(5);

        expect(rules.slice(0,3)).toEqual([
            { receiverId: 'firstName', path: 'customer.firstName', signal: ['value', 'error'] },
            { receiverId: 'lastName', path: 'customer.lastName', signal: ['value', 'error'] },
            { receiverId: 'discount', path: 'customer.discount', signal: ['value', 'error'] }
        ]);

        expect(rules[3].path).toEqual(['customer.hasDiscount']);
        expect(rules[4].signal).toEqual('hidden');
    });

    it('should return triggers', function() {

        var p = fe.metadataProvider({ metadata: getMetadata() }),
            t = p.getTriggers()[0];

        expect(t.processorArgs).toEqual([ 'customer.hasDiscount' ]);
        expect(t.processor(true)).toEqual(false);
        expect(t.signal).toEqual('hidden');
    });

    it('should return model metadata (validation rules)', function() {

        var p = fe.metadataProvider({ metadata: getMetadata() }),
            validationRules = p.getModelMetadata().validationRules;

        expect(validationRules).toEqual([
            { path: 'customer.lastName', validatorName: 'required' },
            { path: 'customer.lastName', validatorName: 'minLength', validatorProperties: { length: 2 } },
            { path: 'customer.lastName', validatorName: 'maxLength', validatorProperties: { length: 30 } }
        ]);

    });

    function getMetadata() {

        return {
            id: 'testForm',
            typeName: 'form',
            properties: { header: 'test form' },
            children: [
                {
                    id: 'firstName',
                    typeName: 'textBox',
                    binding: 'customer.firstName'
                },
                {
                    id: 'lastName',
                    typeName: 'textBox',
                    binding: 'customer.lastName',
                    validationRules: { required: true, minLength: 2, maxLength: { length: 30 } }
                },
                {
                    id: 'discount',
                    typeName: 'textBox',
                    binding: 'customer.discount',
                    hidden: '!customer.hasDiscount'
                }
            ]
        };
    }
});