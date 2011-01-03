
describe('fe.element', function() {
    
    it('should declare fe.element constructor', function() {
        expect(fe.element).toBeDefined();
    });

    it('should have appropriate interface', function() {

        var engine = fe.engine(),
            e = fe.element({ metadata: getElementMedatadata(), engine: engine });

        expect(typeof e.receiveMessage).toEqual('function');
        expect(typeof e.initialize).toEqual('function');
        expect(typeof e.notifyValueChange).toEqual('function');
    });

    it('should initialize propeties from metadata', function() {

        var engine = fe.engine(),
            e = fe.element({ metadata: getElementMedatadata(), engine: engine });

        expect(e.id).toEqual('test');
        expect(e.properties).toEqual({ test: 'ok' });
        expect(e.children).toEqual([]);
    });

    function getElementMedatadata() {
        return {
            id: 'test',
            properties: { test: 'ok' }
        };
    }
});