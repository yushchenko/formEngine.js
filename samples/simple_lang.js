;(function(formEngine){

   var model = {

           person: {
               firstName: 'John',
               lastName: 'Smith',
               occupation: 'Software Developer',
               loveJavaScript: true,
               country: { id: 2, name: 'Canada' }
           },

           countries: [
               { id: 1, name: 'USA' },
               { id: 2, name: 'Canada' },
               { id: 3, name: 'England' }
           ]
       },

       form = formEngine.form('test')

          .element('text', 'textBox')
               .property('label', 'First Name')
               .value('person.firstName')
          .end()

          .text('textBox')
               .label('Last Name').value('person.lastName')
          .end()

          .textBox()
               .label('Occupation').value('person.occupation')
          .end()

          .checkBox().id('loveJavaScript')
               .label('Love JavaScript').value('person.loveJavaScript')
          .end()
          
          .comboBox()
               .label('Country').value('person.country')
               .entityList('countries')
          .end()

       .end(),

       engine = formEngine({
           containerId: 'formContainer',
           form: form,
           model: model
       });


   engine.getElementById('loveJavaScript').control.onClick.bind(function() {
       alert('model.person.loveJavaScript: ' + model.person.loveJavaScript);
   });

   engine.show();

})(formEngine);