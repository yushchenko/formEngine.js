describe('fe.changeTracker', function() {

    it('should have appropriate interface', function() {

        expect(fe.changeTracker).toBeDefined();

        var t = fe.changeTracker();

        expect(typeof t.push).toEqual('function');
        expect(typeof t.moveBack).toEqual('function');
        expect(typeof t.moveForward).toEqual('function');
        expect(typeof t.getBackCount).toEqual('function');
        expect(typeof t.getForwardCount).toEqual('function');
        expect(typeof t.getStatus).toEqual('function');           
    });

    it('should store changes', function() {

        var t = fe.changeTracker();

        t.push('C1');

        expect(t.moveBack()).toEqual('C1');
        expect(t.moveBack()).toEqual(undefined);
        expect(t.moveForward()).toEqual('C1');
        expect(t.moveForward()).toEqual(undefined);
    });

    it('should return amount of changes', function() {

        var t = fe.changeTracker();

        t.push('C1');

        expect(t.getBackCount()).toEqual(1);
        expect(t.getForwardCount()).toEqual(0);

        t.moveBack();

        expect(t.getBackCount()).toEqual(0);
        expect(t.getForwardCount()).toEqual(1);

        t.moveForward();

        expect(t.getBackCount()).toEqual(1);
        expect(t.getForwardCount()).toEqual(0);
    });

    it('should truncate forward changes on new change push', function() {

        var t = fe.changeTracker();

        t.push('C1');
        t.push('C2');
        t.push('C3');

        t.moveBack();
        t.moveBack();
        t.push('C4');

        expect(t.getForwardCount()).toEqual(0);
        expect(t.moveForward()).toEqual(undefined);
    });
    
});