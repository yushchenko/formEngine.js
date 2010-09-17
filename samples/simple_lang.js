;(function(formEngine){

   var model = {

           person: {
               firstName: 'John',
               lastName: 'Smith',
               occupation: 'Software Developer',
               loveJavaScript: true,
               country: { id: 3 },
               city: { code: 2}
           },

           countries: [
               { id: 1, name: 'USA', language: 'English' },
               { id: 2, name: 'Canada', language: 'English' },
               { id: 3, name: 'England', language: 'English' }
           ],

           cities: [
               { code: 1, name: 'New York', countryId: 1 },
               { code: 2, name: 'London', countryId: 3 }
           ],

           citiesInPersonCountry: function () {
               var result = [];

               for (var i = 0; i < this.cities.length; i += 1) {
                   if (this.person.country.id === this.cities[i].countryId) {
                       result.push(this.cities[i]);
                   }
               }

               return result;
           }
       };

    model.citiesInPersonCountry.dependsOn = ['person.country', 'cities'];

    var form = formEngine.form('test')

          .element('text', 'textBox')
               .property('label', 'First Name')
               .value('person.firstName')
          .end()

          .text('textBox')
               .label('Last Name').value('person.lastName')
          .end()

          .textLabel()
               .label('Full Name').value('person.firstName') 
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
               .entityListFormatter(function(e) { return e.name + ' (' + e.language +')'; })
          .end()

          .comboBox()
               .label('City').value('person.city')
               .entityList('citiesInPersonCountry').entityListKey('code')
          .end()

       .end();

    var engine = formEngine({ containerId: 'formContainer', form: form, model: model });

    // engine.getElementById('loveJavaScript').control.onClick.bind(function() {
    //     alert('model.person.loveJavaScript: ' + model.person.loveJavaScript);
    // });

    engine.show();

})(formEngine);