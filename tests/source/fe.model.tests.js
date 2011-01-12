
describe('fe.model', function() {
    
    it('should declare fe.model constructor', function() {
        expect(fe.model).toBeDefined();
    });

    it('should have appropriate interface', function() {

        var m = fe.model({});

        expect(typeof m.receiveMessage).toEqual('function');
        expect(typeof m.set).toEqual('function');
        expect(typeof m.get).toEqual('function');
        expect(typeof m.isValid).toEqual('function');
    });

    it('should provide access to data', function() {

        var m = fe.model(),
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

    it('should check if data is valid according validation rules', function() {
        
        var e = fe.engine(),
            rules = [
                { path: 'x.y.z', validatorName: 'required' }
            ],
            m = fe.model({ engine: e, metadata: { validationRules: rules }}),
            data = { x: { y: { z: 1 } } };

        expect(m.isValid()).toEqual(false);
        expect(m.isValid('x.y.z')).toEqual(false);

        m.set(data);

        expect(m.isValid()).toEqual(true);
        expect(m.isValid('x.y.z')).toEqual(true);
    });

});