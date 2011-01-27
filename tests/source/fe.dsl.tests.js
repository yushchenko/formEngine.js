describe('fe.dsl', function () {

    it('should be defined', function() {

        expect(fe.dsl).toBeDefined();
        expect(typeof fe.dsl.element).toEqual('function');
    });

    it('should create element with properties', function() {

        var ui = fe.dsl,
            e1 = ui.element().get(),
            e2 = ui.element().property('a', 1).property('b', 2).get();

        expect(e1).toEqual({ properties: {}, validationRules: {}, elements: [] });
        expect(e2.properties).toEqual({ a: 1, b: 2});
    });

    it('should create children elements', function() {

        var ui = fe.dsl,
            e = ui.element(
                    ui.element().id(1),
                    ui.element().id(2)
                ).get(),
            e2 = ui.element().id(1)(
                    ui.element().id(2)
                ).get();

        expect(e.elements[0].id).toEqual(1);
        expect(e.elements[1].id).toEqual(2);

        expect(e2.id).toEqual(1);
        expect(e2.elements[0].id).toEqual(2);
    });

    it('showld allow to add new methods to all tokens', function() {

        fe.dsl.defaultMethods.test = function(value) {
            this.element.testValue = value;
            return this.chain;
        };

        this.after = function() { delete fe.dsl.defaultMethods.test; };

        var ui = fe.dsl,
            e = ui.element().test('test value').get();

        expect(e.testValue).toEqual('test value');
    });

    it('should allow to add new tokens', function() {

        fe.dsl.test = fe.dsl.token(
            function init(element) {
                element.typeName = 'test';
            },
            {
                method: function(value) {
                    this.element.testValue = value;
                    return this.chain;
                }
            }
        );

        this.after = function() { delete fe.dsl.test; };

        var ui = fe.dsl,
            e = ui.test().method('value').get();

        expect(e.typeName).toEqual('test');
        expect(e.testValue).toEqual('value');
        
    });
});