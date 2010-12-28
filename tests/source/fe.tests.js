
describe('fe', function() {
    
    it('should declare namespace', function() {
        expect(fe).toBeDefined();
    });

    it('should expose version', function() {
        expect(fe.version).toBeDefined();
        //expect(fe.version).toEqual('string');
    });

});