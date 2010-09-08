;(function(formEngine){

   var model = {
           firstName: 'John',
           lastName: 'Smith'
       },

       form =
       {
           id: 'testForm',
           typeName: 'form',
           controlName: 'form',

           elements:
           [
               {
                   id: 'firstName',
                   typeName: 'text',
                   controlName: 'textBox'
               },
               {
                   id: 'lastName',
                   typeName: 'text',
                   controlName: 'textBox'
               }
           ]
       },
   
       engine = formEngine({
           containerId: 'formContainer',
           form: form
       });

   engine.bindData(model);

   engine.show();

})(formEngine);