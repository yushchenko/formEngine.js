fe.validators = {};

fe.validators.required = function required(value, properties) {

    if (value === undefined || value === null || 
        (typeof value === 'string' && trim(value) === '') ||
        (typeof value === 'number' && isNaN(value))) {

        return properties.message || 'This field is required!';
    }

    return undefined;
};

fe.validators.minLength = function minLength(value, properties) {

    if (value.length !== undefined && value.length < properties.length) {
        return properties.message || 'This field is too short!';
    }

    return undefined;
};
fe.validators.minLength.defaultProperty = 'length';


fe.validators.maxLength = function maxLength(value, properties) {

    if (value.length !== undefined && value.length > properties.length) {
        return properties.message || 'This field is too long!';
    }

    return undefined;
};
fe.validators.maxLength.defaultProperty = 'length';