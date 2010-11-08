;(function(formEngine){

   var model = {

           person: {
               firstName: 'John',
               lastName: 'Smith',
               occupation: 'JavaScript Developer',
               loveJavaScript: true,
               whyNotLoveJavaScript: '',
               country: { id: 2, name: 'Canada', language: 'English' },
               city: { code: 3, name: 'Toronto'}
           },

           countries: [
               { id: 1, name: 'USA', language: 'US English' },
               { id: 2, name: 'Canada', language: 'English' },
               { id: 3, name: 'England', language: 'British English' },
               { id: 4, name: 'France', language: 'French' }               
           ],

           cities: [
               { code: 1, name: 'New York', countryId: 1 },
               { code: 2, name: 'Boston', countryId: 1 },
               { code: 3, name: 'Toronto', countryId: 2 },
               { code: 4, name: 'London', countryId: 3 },
               { code: 5, name: 'Paris', countryId: 4 }
           ]
       };

    var form = formEngine.form('test')

          .element('text', 'textBox')
               .property('label', 'First Name')
               .value('person.firstName')
          .end()

          .text('textBox')
               .label('Last Name').value('person.lastName')
          .end()

          .checkBox().id('loveJavaScript')
               .label('Love JavaScript').value('person.loveJavaScript')
          .end()

          .textBox()
               .label('Why not love JavaScript?').value('person.whyNotLoveJavaScript')
               .hidden('person.loveJavaScript')
          .end()

          .textBox()
               .label('Occupation').value('person.occupation')
               .readonly('person.loveJavaScript')
          .end()

          .comboBox()
               .label('Country').value('person.country')
               .entityList('countries')
               .entityListFormatter(function(entity, model) { return entity.name + ' (' + entity.language + ')'; })
               // .entityListFormatter('e.name + " (" + e.language + ")"')
               // .entityListFormatter('<%=name%> (<%=language%>)')
          .end()

          .comboBox()
               .label('City').value('person.city')
               .entityList('cities').entityListKey('code')
               //.entityListFilter('e.countryId === m.person.country.id')
               .entityListFilter(function(model, entity) { return entity.countryId === model.person.country.id; })
               //.entityListFormatter('.name')
          .end()

          .textLabel()
              .label('Summary')
              .value(function(m) {
                         return m.person.firstName + ' ' + m.person.lastName +
                                ' from ' + m.person.city.name + ', ' + m.person.country.name +
                                ' speaks ' + m.person.country.language;
                    })
              // .value('<%=person.firstName%> <%=person.lastName%> from <%=person.city.name%>, <%= person.coutry.name%> ' +
              //        'speaks <%=m.person.country.language%>')
          .end()

       .end();

    var engine = formEngine({ containerId: 'formContainer', form: form, model: model });

    engine.getElementById('loveJavaScript').control.onClick.bind(function() {
        if (model.person.loveJavaScript) {
            model.person.setValue('occupation', 'JavaScript Developer');
        }
    });

    engine.show();

})(formEngine);