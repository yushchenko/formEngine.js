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
                   valueExp: 'firstName',
                   controlName: 'textBox',
                   controlProperties: {
                       label: 'First Name'
                   }
               },
               {
                   id: 'lastName',
                   typeName: 'text',
                   valueExp: 'lastName',
                   controlName: 'textBox',
                   controlProperties: {
                       label: 'Last Name'
                   }
               },
               {
                   id: 'occupation',
                   typeName: 'text',
                   valueExp: 'occupation',
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