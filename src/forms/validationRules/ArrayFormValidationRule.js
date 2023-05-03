'use strict';

import FormValidationRule from './FormValidationRule.js';

class ArrayFormValidationRule extends FormValidationRule {
    /**
     * Returns the default error message to use whenever this validation rule fails.
     *
     * @returns {string}
     */
    getDefaultErrorMessage(){
        return 'Invalid array.';
    }

    /**
     * Validates a given value.
     *
     * @param {any} value
     *
     * @returns {boolean}
     */
    validate(value){
        return Array.isArray(value);
    }
}

export default ArrayFormValidationRule;