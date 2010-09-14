;(function(formEngine){

   var model = {
           firstName: 'John',
           lastName: 'Smith',
           occupation: 'Software Developer'
       },

       form = formEngine.form('test')

          .element('text', 'textBox')
               .property('label', 'First Name')
               .value('firstName')
          .end()

          .text('textBox')
               .label('Last Name').value('lastName')
          .end()

          .text().textBox()
               .label('Occupation').value('occupation')
          .end()

       .end(),

   
       engine = formEngine({
           containerId: 'formContainer',
           form: form
       });

   engine.bindData(model);

   engine.show();

})(formEngine);