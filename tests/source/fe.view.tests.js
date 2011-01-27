
describe('fe.view', function() {
    
    it('should declare fe.view constructor', function() {
        expect(fe.view).toBeDefined();
    });

    it('should have appropriate interface', function() {

        var engine = fe.engine(),
            v = getView(engine);

        expect(typeof v.initialize).toEqual('function');
        expect(typeof v.getElementById).toEqual('function');
    });

    it('should build element tree from view metadata', function() {

         var engine = fe.engine(),
             v = getView(engine);

         expect(v.element).toBeDefined();
         expect(v.element.id).toEqual('testForm');

         expect(v.element.elements.length).toEqual(2);
         expect(v.element.elements[0].id).toEqual('field1');
         expect(v.element.elements[1].properties).toEqual({ p: 'p2' });
    });

    it('should find element by id', function() {

         var engine = fe.engine(),
             v = getView(engine);

         expect(v.getElementById('testForm').id).toEqual('testForm');
         expect(v.getElementById('field2').id).toEqual('field2');
    });

    it('should initialize elements', function() {

         var engine = fe.engine(),
             v = getView(engine),
             form = v.getElementById('testForm');

         v.initialize();

         expect(form.hasBeenInitialized).toEqual(true);
    });

    function getView(engine) {
        return fe.view({
            metadata: getViewMetadata(),
            elementTypes: getElementTypes(),
            engine: engine
        });
    }

    function getViewMetadata() {

        return {
            id: 'testForm',
            typeName: 'form',
            elements: [
                {
                    id: 'field1',
                    typeName: 'textBox',
                    properties: { p: 'p1' }
                },
                {
                    id: 'field2',
                    typeName: 'textBox',
                    properties: { p: 'p2' }
                }
            ]
        };
    }

    function getElementTypes() {
        return {
            form: function(config) {
                var that = fe.element(config);

                that.initialize = function() {
                    that.hasBeenInitialized = true;
                };

                return that;
            },
            textBox: function(config) {
                return fe.element(config);
            }
        };
    }
});