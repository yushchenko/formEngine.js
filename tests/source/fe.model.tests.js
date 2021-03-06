
describe('fe.model', function() {
    
    it('should declare fe.model constructor', function() {
        expect(fe.model).toBeDefined();
    });

    it('should have appropriate interface', function() {

        var  e = fe.engine(),
             m = fe.model({ engine: e });

        expect(typeof m.receiveMessage).toEqual('function');
        expect(typeof m.set).toEqual('function');
        expect(typeof m.get).toEqual('function');
        expect(typeof m.validate).toEqual('function');
        expect(typeof m.undo).toEqual('function');
        expect(typeof m.redo).toEqual('function');
        expect(typeof m.getUndoCount).toEqual('function');
        expect(typeof m.getRedoCount).toEqual('function');
    });

    it('should provide access to data', function() {

        var e = fe.engine(),
            m = fe.model({ engine: e }),
            data = { x: 1, y: { z: 2 } };

        m.set(data);

        expect(m.get()).toEqual(data);
        expect(m.get('x')).toEqual(1);
        expect(m.get('y.z')).toEqual(2);
        expect(m.get('not.existing.path')).toEqual(undefined); // broken path

        m.set('x', 3);
        m.set('y.z', 4);
        m.set('y.zz', 5);
        m.set('not.existing.path', 6);

        expect(m.get('x')).toEqual(3);
        expect(m.get('y.z')).toEqual(4);
        expect(m.get('y.zz')).toEqual(5); // new property
        expect(m.get('not.existing.path')).toEqual(undefined); // broken path
    });

    it('should update data when gets message with appropriate path and signal', function() {

        var e = fe.engine(),
            m = fe.model({ engine: e }),
            data = { x: 1, y: { z: 2 } },
            msg = { path: 'y.z', signal: 'value', data: 3 };

        m.set(data);
        expect(m.get('y.z')).toEqual(2);

        e.sendMessage(msg);

        expect(m.get('y.z')).toEqual(3);
    });

    it('should notify data update', function() {

        var e = fe.engine(),
            m = fe.model({ id: 'model', engine: e }),
            data = { x: 1, y: { z: 2 } },
            receiver = { receiveMessage: jasmine.createSpy() },
            rule = { receiverId: 'r1', path: 'y.z', signal: 'value' },
            msg1 = { senderId: 'model', path: '', rulePath: 'y.z', signal: 'value', data: 2},
            msg2 = { senderId: 'model', path: 'y.z', rulePath: 'y.z', signal: 'value', data: 3};

        e.addReceiver('r1', receiver);
        e.addRule(rule);
                    
        m.set(data);
        expect(receiver.receiveMessage).toHaveBeenCalledWith(msg1); // the first update

        m.set('y.z', 3);
        expect(receiver.receiveMessage).toHaveBeenCalledWith(msg2); // on data change by model.set()
    });

    it('should validate data on value message and send error message', function() {
        
        var e = fe.engine(),
            rules = [
                { path: 'x.y.z', validatorName: 'required' }
            ],
            m = fe.model({ engine: e, metadata: { validationRules: rules }}),
            data = { x: { y: { z: 1 } } },
            errors = [];

        m.set(data);

        e.subscribe({ path: 'x.y.z', signal: 'error'}, function(msg) {
            errors = msg.data;
        });

        e.sendMessage({ senderId: 's1', path: 'x.y.z', signal: 'value', data: null });
        expect(errors.length).toEqual(1);

        e.sendMessage({ senderId: 's1', path: 'x.y.z', signal: 'value', data: 1 });
        expect(errors.length).toEqual(0);
    });

    it('should return validation result', function() {

        var e = fe.engine(),
            rules = [
                { path: 'x.y.z', validatorName: 'required' },
                { path: 'x.y.z2', validatorName: 'required' }
            ],
            m = fe.model({ engine: e, metadata: { validationRules: rules }}),
            data = { x: { y: { z: 1, z2: 2 } } };

        expect(m.validate()).toEqual(false);

        m.set(data);
        expect(m.validate()).toEqual(true);

        m.set('x.y.z', null);
        expect(m.validate('x.y.z')).toEqual(false);
        expect(m.validate('x.y.z2')).toEqual(true);

        m.set('x.y.z', 1);
        expect(m.validate('x.y.z')).toEqual(true);
        expect(m.validate('x.y.z2')).toEqual(true);
    });

    it('should send error message on validate method if not suppressed', function () {
        
        var e = fe.engine(),
            rules = [
                { path: 'x.y.z', validatorName: 'required' }
            ],
            m = fe.model({ engine: e, metadata: { validationRules: rules }}),
            data = { x: { y: { z: 1 } } },
            errors = [];

        e.subscribe({ path: 'x.y.z', signal: 'error'}, function(msg) {
            errors = msg.data;
        });

        m.validate();
        expect(errors.length).toEqual(1);

        m.set(data);
        m.validate();
        expect(errors.length).toEqual(0);

        m.set('x.y.z', null);
        m.validate(undefined, true);
        expect(errors.length).toEqual(0);

        m.validate();
        expect(errors.length).toEqual(1);
    });

    it('[bug] should send value and properties to validator', function() {

        fe.validators.test = jasmine.createSpy();
        this.after(function() { delete fe.validators.test; });

        var e = fe.engine(),
            rules = [
                { path: 'x.y.z', validatorName: 'test', validatorProperties: { testProperty: 1 } }
            ],
            m = fe.model({ engine: e, metadata: { validationRules: rules }}),
            data = { x: { y: { z: 1 } } };

        m.validate();

        expect(fe.validators.test).toHaveBeenCalledWith(undefined, { testProperty: 1 });
    });

    it('should notify changes', function() {

        var e = fe.engine(),
            m = fe.model({ engine: e, trackChanges: true }),
            changes = [];

        e.subscribe({ signal: 'change' }, function(msg) {
            changes.push(msg.data);
        });

        e.sendMessage({ senderId: 's', path: 'a.b.c', signal: 'value', data: 1 });

        expect(changes).toEqual(['changed']);
    });

    it('should undo/redo changes', function() {

        var e = fe.engine(),
            m = fe.model({ engine: e, trackChanges: true });

        m.set({ x: { y: 1 } });

        e.sendMessage({ senderId: 's', path: 'x.y', signal: 'value', data: 2 });
        expect(m.get('x.y')).toEqual(2);

        m.undo();
        expect(m.get('x.y')).toEqual(1);

        m.redo();
        expect(m.get('x.y')).toEqual(2);
    });

    it('should notify change on undo/redo', function() {

        var e = fe.engine(),
            m = fe.model({ engine: e, trackChanges: true }),
            commands = [];

        e.subscribe({ signal: 'change' }, function(msg) {
            commands.push(msg.data);
        });

        m.set({ x: { y: 1 } });

        e.sendMessage({ senderId: 's', path: 'x.y', signal: 'value', data: 2 });
        expect(commands).toEqual(['changed']);

        m.undo();
        expect(commands).toEqual(['changed', 'default']);

        m.redo();
        expect(commands).toEqual(['changed', 'default', 'changed']);
    });

    it('should return undo/redo counts', function() {

        var e = fe.engine(),
            m = fe.model({ engine: e, trackChanges: true });

        m.set({ x: { y: 1 } });

        e.sendMessage({ senderId: 's', path: 'x.y', signal: 'value', data: 2 });
        expect(m.getUndoCount()).toEqual(1);
        expect(m.getRedoCount()).toEqual(0);

        m.undo();
        expect(m.getUndoCount()).toEqual(0);
        expect(m.getRedoCount()).toEqual(1);

        m.redo();
        expect(m.getUndoCount()).toEqual(1);
        expect(m.getRedoCount()).toEqual(0);
    });

    it('should mark saved elements', function() {

        var e = fe.engine(),
            m = fe.model({ engine: e, trackChanges: true }),
            commands = [];

        m.set({ x: { y: 1 } });

        e.subscribe({ signal: 'change' }, function(msg) {
            commands.push(msg.data);
        });

        e.sendMessage({ senderId: 's', path: 'x.y', signal: 'value', data: 2 });

        expect(commands).toEqual(['changed']);

        m.markSave();

        expect(commands).toEqual(['changed', 'saved']);
    });

    it('should validate data on undo/redo', function() {

        var e = fe.engine(),
            rules = [
                { path: 'x.y', validatorName: 'required' }
            ],
            m = fe.model({ engine: e, metadata: { validationRules: rules }, trackChanges: true }),
            count = 0;

        m.set({ x: { y: 1 } });

        e.subscribe({ signal: 'error' }, function(msg) {
            count += 1;
        });

        e.sendMessage({ senderId: 's', path: 'x.y', signal: 'value', data: 2 });

        expect(count).toEqual(1);

        m.undo();
        expect(count).toEqual(2);

        m.redo();
        expect(count).toEqual(3);
    });

});