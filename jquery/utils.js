
function showData(dialog, data) {
    
    var title = 'Data is valid and ready to be sent to the server.',
        formated = JSON.stringify(data, null, 4).replace(/ /g, '&nbsp;').replace(/\n/g, '<br />');

    dialog.html(formated).dialog({ title: title, width: 460 });
}
