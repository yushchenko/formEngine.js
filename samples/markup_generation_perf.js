;(function(formEngine){

   var amountOfElements = 1000,
       model = {
       },

       form =
       {
           id: 'testForm',
           typeName: 'form',
           controlName: 'form',
           elements: []
       };
   
   var fName, fValue, fid, fLabel;

   for (var i = 0; i < amountOfElements; i += 1) {

       fName = 'text ' + i;
       fValue = 'field value ' + i;
       fid = 'id' + i;
       fLabel = 'Text Field # ' + i;

       model[fName] = fValue;
       
       form.elements.push({
           id: fid,
           typeName: 'text',
           valueExp: fName,
           controlName: 'textBox',
           controlProperties: { label: fLabel }
       });
   }


   var engine;
   var creationTime = formEngine.measureExecutionTime(function () {

           engine = formEngine({ containerId: 'formContainer', form: form });
       }),
       bindTime  = formEngine.measureExecutionTime(function () {

           engine.bindData(model);
       }),
       showTime  = formEngine.measureExecutionTime(function () {

           engine.show();
       });
                                                               
   $('.fe-kpi').text('formEngine({}): ' + creationTime + 'ms, bindData(): ' + bindTime + 'ms, show(): ' + showTime + 'ms.');

})(formEngine);