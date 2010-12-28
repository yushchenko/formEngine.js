
describe('fe.view', function() {
    
    it('should declare fe.view constructor', function() {
        expect(fe.view).toBeDefined();
    });

    it('should have appropriate interface', function() {

        var v = fe.view({});

        expect(typeof v.receiveMessage).toEqual('function');
    });
});