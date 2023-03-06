'use strict';

import FormValidationRule from './FormValidationRule.js';

class NotEmptyStringFormValidationRule extends FormValidationRule {
    /**
     * Returns the default error message to use whenever this validation rule fails.
     *
     * @returns {string}
     */
    getDefaultErrorMessage(){
        return 'String cannot be empty.';
    }

    /**
     * Validates a given value.
     *
     * @param {string} value
     *
     * @returns {boolean}
     */
    validate(value) {
        return typeof value === 'string' && value !== '';
    }
}

export default NotEmptyStringFormValidationRule;
