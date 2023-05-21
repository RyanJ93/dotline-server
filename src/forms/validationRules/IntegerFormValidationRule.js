'use strict';

import FormValidationRule from './FormValidationRule.js';

/**
 * @typedef {FormValidationRuleParams} IntegerFormValidationRuleParams
 */

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
     * @param {any} value
     * @param {IntegerFormValidationRuleParams} params
     *
     * @returns {boolean}
     */
    validate(value, params){
        return ( typeof value === 'number' && isNaN(value) ) || /[0-9]+/.test(value);
    }
}

export default IntegerFormValidationRule;
