describe('fe.expressionParser', function () {

    it ('should parse expressions', function () {

        var p = fe.expressionParser;

        expect(typeof p).toEqual('function');

        expect(p(':x.y.z').args).toEqual(['x.y.z']);
        expect(p(':x.y.z').processor(1)).toEqual(1);

        expect(p(':x.z + :y.z').args).toEqual(['x.z', 'y.z']);
        expect(p(':x.z + :y.z').processor(1,2)).toEqual(3);

        expect(p('[:x.z, :y.z].join(" ")').processor('John', 'Smith')).toEqual('John Smith');
    });

});