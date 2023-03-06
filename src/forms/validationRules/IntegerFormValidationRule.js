'use strict';

import FormValidationRule from './FormValidationRule.js';

class IntegerFormValidationRule extends FormValidationRule {
    /**
     * Returns the default error message to use whenever this validation rule fails.
     *
     * @returns {string}
     */
    getDefaultErrorMessage(){
        return 'Invalid integer number.';
    }

    /**
     * Validates a given value.
     *
     * @param {string} value
     *
     * @returns {boolean}
     */
    validate(value){
        return ( typeof value === 'number' && isNaN(value) ) || /[0-9]+/.test(value);
    }
}

export default IntegerFormValidationRule;
