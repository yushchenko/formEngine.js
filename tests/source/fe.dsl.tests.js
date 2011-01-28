describe('fe.dsl', function () {

    it('should be defined', function() {

        expect(fe.dsl).toBeDefined();
        expect(fe.dsl.defaultElementProperties).toBeDefined();
        expect(typeof fe.dsl.elementConstructor).toEqual('function');
    });

    it('should create element with properties', function() {

        var element = fe.dsl.elementConstructor('test'),
            e1 = element().get(),
            e2 = element().property('a', 1).property('b', 2).get();

        expect(e1).toEqual({ typeName: 'test', properties: {}, validationRules: {}, elements: [] });
        expect(e2.properties).toEqual({ a: 1, b: 2});
    });

    it('should create children elements', function() {

        var element = fe.dsl.elementConstructor(),
            e = element(
                    element().id(1),
                    element().id(2)
                ).get(),
            e2 = element().id(1)(
                    element().id(2)
                ).get();

        expect(e.elements[0].id).toEqual(1);
        expect(e.elements[1].id).toEqual(2);

        expect(e2.id).toEqual(1);
        expect(e2.elements[0].id).toEqual(2);
    });

    it('showld allow to add new methods to all elements', function() {

        fe.dsl.defaultElementProperties.test = function(value) {
            this.element.testValue = value;
            return this.chain;
        };

        this.after = function() { delete fe.dsl.defaultElementProperties.test; };

        var element = fe.dsl.elementConstructor(),
            e = element().test('test value').get();

        expect(e.testValue).toEqual('test value');
    });

    it('should allow to add new element constructors', function() {

        var ui = {};

        ui.test = fe.dsl.elementConstructor('test',
            {
                initialize: function() {
                    this.element.initTest = 'initTest';
                },
                validate: function() {
                    if (!this.element.testValue) {
                        throw new Error('test error');
                    }
                }
            },
            {
                method: function(value) {
                    this.element.testValue = value;
                    return this.chain;
                }
            }
        );

        ui.test2 = fe.dsl.elementConstructor('test2');

        var e = ui.test().method('value').get(),
            e2 = ui.test2().get();

        expect(e.typeName).toEqual('test');
        expect(e.testValue).toEqual('value');
        expect(e2.typeName).toEqual('test2');
    });
});