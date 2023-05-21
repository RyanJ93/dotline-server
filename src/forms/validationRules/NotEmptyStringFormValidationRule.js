'use strict';

import FormValidationRule from './FormValidationRule.js';

/**
 * @typedef {FormValidationRuleParams} NotEmptyStringFormValidationRuleParams
 */

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
     * @param {any} value
     * @param {NotEmptyStringFormValidationRuleParams} params
     *
     * @returns {boolean}
     */
    validate(value, params){
        return typeof value === 'string' && value !== '';
    }
}

export default NotEmptyStringFormValidationRule;
