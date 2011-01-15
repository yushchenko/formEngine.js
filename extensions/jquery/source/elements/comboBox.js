
fe.jquery.elements.comboBox = function comboBox(config) {

    var that = fe.jquery.element(config),
        engine = config.engine,
        receiveMessageBase = that.receiveMessage,
        listPath = that.properties.list,
        currentList,
        selectedId;

    //TODO: consider moving this to metadataProvider (special properties exposed by control?)
    if (listPath) {
        engine.addRule({ receiverId: that.id, path: listPath, signal: 'value' });
    }

    that.template = template(
        '<div id="<%=containerId%>">' +
            '<label for="<%=editorId%>" class="fe-element-label"><%=properties.label%></label>' +
            '<select id="<%=editorId%>"></select>' +
            '<div id="<%=errorId%>" class="fe-element-error"></div>' +
        '</div>'
    );

    that.receiveMessage = function receiveMessage(message) {

        if (message.signal === 'value' && message.rulePath === listPath)  {
            setList(message.data);
            return;
        }

        receiveMessageBase(message);
    };

    that.initialize = function() {
        that.getEditor().change(function() {
            var item = getItemById(that.getEditor().val());
            that.notifyValueChange(item);
        });
    };

    function setList(list) {

        var i, len,
            select = document.getElementById(that.editorId);

        currentList = list;

        select.innerHTML = ''; // cleaning previous list of options

        function addOption(item) {

            var option = document.createElement('option');
            option.value = item.id;
            option.text = item.name;

            select.add(option, null);
        }

        addOption({ id: -1, name: 'Select...' });

        for (i = 0, len = list.length; i < len; i += 1) {
            addOption(list[i]);
        }

        selectItem(); // restoring selected item
    }

    that.setValue = function setValue(value) {
        selectedId = (value !== null && value !== undefined) ? value.id : -1;
        selectItem();
    };

    function selectItem(id) {
        that.getEditor().val(id || selectedId || -1);
    }

    function getItemById(id) {

        var i, len;

        id = parseInt(id, 10);

        if (currentList) {
            for (i = 0, len = currentList.length; i < len; i += 1) {
                if (currentList[i].id === id) {
                    return currentList[i];
                }
            }
        }

        return undefined;
    }

    return that;
};