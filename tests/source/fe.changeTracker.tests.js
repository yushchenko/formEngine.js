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
        expect(typeof t.markSave).toEqual('function');
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

    it('should return status by path', function() {

        var t = fe.changeTracker();

        t.push({ path: 'a.b.c' });

        expect(t.getStatus('a.b.c')).toEqual('changed');
        expect(t.getStatus('x.y.z')).toEqual('default');

        t.moveBack();

        expect(t.getStatus('a.b.c')).toEqual('default');

        t.moveForward();
        expect(t.getStatus('a.b.c')).toEqual('changed');
    });

    it('should return saved status after markSave', function() {

        var t = fe.changeTracker();

        t.push({ path: 'a.b.c1' });
        t.markSave();
        t.push({ path: 'a.b.c2' });

        expect(t.getStatus('a.b.c1')).toEqual('saved');
        expect(t.getStatus('a.b.c2')).toEqual('changed');
        expect(t.getStatus('x.y.z')).toEqual('default');
    });

    it('should return saved paths', function() {

        var t = fe.changeTracker();

        t.push({ path: 'C1' });
        t.push({ path: 'C2' });

        expect(t.markSave()).toEqual(['C1', 'C2']);

        t.push({ path: 'C3' });
        t.push({ path: 'C4' });
        t.moveBack();

        expect(t.markSave()).toEqual(['C3']);
    });
    
});