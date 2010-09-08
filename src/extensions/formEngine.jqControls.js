;(function(formEngine){

    formEngine.controls.form = function form(engine, element) {

        var that = formEngine.controlBase(engine, element);

        that.getMarkup = function getMarkup() {

            var childMarkup = '';

            for (var i = 0; i < element.elements.length; i += 1) {
                childMarkup += element.elements[i].control.getMarkup();
            }

            return '<div class="fe-form">' + childMarkup + '</div>';
        };

        return that;
    };

    formEngine.controls.textBox = function textBox(engine, element) {

        var that = formEngine.controlBase(engine, element);

        that.getMarkup = function getMarkup() {
            return '<div class="fe-control">textBox</div>';
        };

        return that;
    };

})(formEngine);