;(function(formEngine){

    formEngine.controls.form = function form(engine, element) {

        var that = formEngine.controlBase(engine, element),
            templ = formEngine.template('<div class="fe-form"><%=content%></div>');

        that.getMarkup = function getMarkup() {
            return templ({ content: that.getChildMarkup() });
        };

        return that;
    };

    formEngine.controls.textBox = function textBox(engine, element) {

        var that = formEngine.controlBase(engine, element),
            templ = formEngine.template('<div class="fe-control">textBox</div>');

        that.getMarkup = function getMarkup() {
            return templ();
        };

        return that;
    };

})(formEngine);