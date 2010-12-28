
describe('fe.model', function() {
    
    it('should declare fe.model constructor', function() {
        expect(fe.model).toBeDefined();
    });

    it('should have appropriate interface', function() {

        var m = fe.model({});

        expect(typeof m.receiveMessage).toEqual('function');
    });
});