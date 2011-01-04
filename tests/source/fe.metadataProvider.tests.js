
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
                }
            ]
        });
    });

    it('should return engine rules', function() {

        var p = fe.metadataProvider({ metadata: getMetadata() });

        expect(p.getRules()).toEqual([
            { receiverId: 'firstName', path: 'customer.firstName', signal: 'value' },
            { receiverId: 'lastName', path: 'customer.lastName', signal: 'value' }
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
                    binding: 'customer.lastName'
                }
            ]
        };
    }
});