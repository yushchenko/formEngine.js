
describe('fe', function() {
    
    it('should declare namespace', function() {
        expect(fe).toBeDefined();
    });

    it('should expose version', function() {
        expect(typeof fe.version).toEqual('string');
    });

    it('should return unique IDs', function() {

        var id1 = fe.getUniqueId(),
            id2 = fe.getUniqueId(),
            id3 = fe.getUniqueId();

        expect(id1).not.toEqual(id2);
        expect(id2).not.toEqual(id3);
        expect(id3).not.toEqual(id1);
    });

});