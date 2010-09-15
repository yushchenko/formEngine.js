;(function(formEngine){

   var model = {
           firstName: 'John',
           lastName: 'Smith',
           occupation: 'Software Developer',
           loveJavaScript: true
       },

       form = formEngine.form('test')

          .element('text', 'textBox')
               .property('label', 'First Name')
               .value('firstName')
          .end()

          .text('textBox')
               .label('Last Name').value('lastName')
          .end()

          .textBox()
               .label('Occupation').value('occupation')
          .end()

          .checkBox().id('loveJavaScript')
               .label('Love JavaScript').value('loveJavaScript')
          .end()

       .end(),

       engine = formEngine({
           containerId: 'formContainer',
           form: form
       });

   engine.getElementById('loveJavaScript').control.onClick.bind(function() {
       alert('checkBox clicked');
   });

   engine.bindData(model);

   engine.show();

})(formEngine);