;(function(formEngine){

   var amountOfElements = 1000,
       model = {
       },

       form =
       {
           id: 'testForm',
           typeName: 'form',
           controlName: 'form',
           elements: [],
           bindings: []
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
           controlProperties: { label: fLabel },
           elements: [],
           bindings: [{ binding: fName, method: 'setValue' }]
       });
   }


   var engine = formEngine({ containerId: 'formContainer', form: form, model: model }),
       msg = '';

   engine.show();

   for (var n in engine.KPI) {
       msg += n + ': ' + engine.KPI[n].toString() + 'ms<br /> ';
   }
                                                               
   $('.fe-kpi').html(msg);

})(formEngine);