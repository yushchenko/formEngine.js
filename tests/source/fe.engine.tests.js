
describe('fe.engine', function() {
    
    it('should declare engine constructor', function() {
        expect(fe.engine).toBeDefined();
    });

    it('should have appropriate interface', function() {

        var e = fe.engine({});

        expect(typeof e.addReceiver).toEqual('function');
        expect(typeof e.addRule).toEqual('function');
        expect(typeof e.addTrigger).toEqual('function');
        expect(typeof e.sendMessage).toEqual('function');
    });
});