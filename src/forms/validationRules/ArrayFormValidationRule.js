'use strict';

import FormValidationRule from './FormValidationRule.js';

/**
 * @typedef {FormValidationRuleParams} ArrayFormValidationRuleParams
 */

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
     * @param {ArrayFormValidationRuleParams} params
     *
     * @returns {boolean}
     */
    validate(value, params){
        return Array.isArray(value);
    }
}

export default ArrayFormValidationRule;