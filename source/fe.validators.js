fe.validators = {};

fe.validators.required = function required(value, properties) {

    if (value === undefined || value === null || 
        (typeof value === 'string' && trim(value) === '') ||
        (typeof value === 'number' && isNaN(value))) {

        return format(properties.message || fe.validationMessages.required, properties);
    }

    return undefined;
};

fe.validators.minLength = function minLength(value, properties) {

    if (value && value.length !== undefined && value.length < properties.length) {
        return format(properties.message || fe.validationMessages.minLenght, properties);
    }

    return undefined;
};
fe.validators.minLength.defaultProperty = 'length';


fe.validators.maxLength = function maxLength(value, properties) {

    if (value && value.length !== undefined && value.length > properties.length) {
        return format(properties.message || fe.validationMessages.maxLenght, properties);
    }

    return undefined;
};
fe.validators.maxLength.defaultProperty = 'length';

fe.validationMessages = {
    required: 'This field is required!',
    minLenght: 'This field should contain more that {length} symbols!',
    maxLenght: 'This field should contain less that {length} symbols!'
};