fe.changeTracker = function(config) {

    var that = {},
        changes = [],
        currentChange = -1,
        savedChange = -1;

    function push(change) {

        if (currentChange < changes.length - 1) {
            changes.splice(currentChange + 1);
        }

        changes.push(change);
        currentChange += 1;
    }

    function moveBack() {

        if (currentChange >= 0){
            currentChange -= 1;
            return changes[currentChange + 1];
        }
        return undefined;
    }

    function moveForward() {

        var nextChange = changes[currentChange + 1];

        if(nextChange) {
            currentChange += 1;
            return nextChange;
        }
        return undefined;
    }

    function getBackCount() {
        return currentChange + 1;
    }

    function getForwardCount() {
        return changes.length - currentChange - 1;
    }

    function getStatus(path) {

        var i;

        for ( i = currentChange; i >= 0; i -= 1 ) {
            if (changes[i].path === path) {
                return (i <= savedChange) ? 'saved' : 'changed';
            }
        }
        return 'default';
    }

    function markSave() {

        var i, saved = [];

        for (i = savedChange + 1; i <= currentChange; i += 1) {
            saved.push(changes[i].path);
        }

        savedChange = currentChange;
        return saved;
    }

    that.push = push;
    that.moveBack = moveBack;
    that.moveForward = moveForward;
    that.getBackCount = getBackCount;
    that.getForwardCount = getForwardCount;
    that.getStatus = getStatus;
    that.markSave = markSave;

    return that;
};