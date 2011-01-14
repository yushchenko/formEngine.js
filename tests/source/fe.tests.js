
describe('fe', function() {
    
    it('should declare namespace', function() {
        expect(fe).toBeDefined();
    });

    it('should expose version', function() {
        expect(typeof fe.version).toEqual('string');
    });

    it('should return unique IDs', function() {

        var id1 = getUniqueId(),
            id2 = getUniqueId(),
            id3 = getUniqueId();

        expect(id1).not.toEqual(id2);
        expect(id2).not.toEqual(id3);
        expect(id3).not.toEqual(id1);
    });

    it('should return object property by path', function() {

        var obj = { x: 1, y: { z: 2 } };

        expect(getByPath(obj, 'x')).toEqual(1);
        expect(getByPath(obj, 'y.z')).toEqual(2);
        expect(getByPath(obj, 'not.existing.path')).not.toBeDefined();
    });

    it('should set object property by path', function() {

        var obj = { x: 1, y: { z: 2 } };

        setByPath(obj, 'x', 3);
        expect(obj.x).toEqual(3);

        setByPath(obj, 'y.z', 4);
        expect(obj.y.z).toEqual(4);

        setByPath(obj, 'not.existing.path', 5); 
        expect(obj.not).not.toBeDefined(); // should ignore not existing paths
    });

    it('should apply function to args', function() {

        var args = [];
        applyToArgs([1,2,3], function(a) { args.push(a); });
        expect(args).toEqual([1,2,3]);

        args = [];
        applyToArgs([[1,2],3], function(a) { args.push(a); });
        expect(args).toEqual([1,2,3]);

        args = [];
        applyToArgs([[]], function(a) { args.push(a); });
        expect(args).toEqual([]);
    });

    it('should trim strings', function() {
        expect(trim('')).toEqual('');
        expect(trim(null)).toEqual('');
        expect(trim(undefined)).toEqual('');
        expect(trim(' abc  ')).toEqual('abc');
    });

    it('should format strings', function() {

        expect(format()).toEqual('');
        expect(format('abc')).toEqual('abc');
        expect(format('I\'m {name}', {name: 'John'})).toEqual('I\'m John');
        expect(format('{firstName} {lastName}', {firstName: 'John', lastName: 'Smith' })).toEqual('John Smith');
    });
});