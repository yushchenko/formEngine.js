;(function(formEngine){

   var model = {
           firstName: 'John',
           lastName: 'Smith',
           occupation: 'Software Developer'
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
                   controlName: 'textBox',
                   controlProperties: {
                       label: 'First Name'
                   }
               },
               {
                   id: 'lastName',
                   typeName: 'text',
                   controlName: 'textBox',
                   controlProperties: {
                       label: 'Last Name'
                   }
               },
               {
                   id: 'occupation',
                   typeName: 'text',
                   controlName: 'textBox',
                   controlProperties: {
                       label: 'Occupation'
                   }
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