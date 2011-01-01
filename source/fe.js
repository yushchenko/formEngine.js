 
var fe = {
    version: '0.0.1'
};

var nextUniqueId = 0;

fe.getUniqueId = function getUniqueId() {
    nextUniqueId += 1;
    return 'i' + nextUniqueId;
};