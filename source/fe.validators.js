fe.validators = {};

fe.validators.required = function required(value, properties) {

    if (value === undefined || value === null || 
        (typeof value === 'string' && trim(value) === '') ||
        (typeof value === 'number' && isNaN(value))) {

        return properties.message || 'This field is required!';
    }

    return undefined;
};