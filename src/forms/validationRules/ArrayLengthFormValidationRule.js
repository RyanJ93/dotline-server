'use strict';

import FormValidationRule from './FormValidationRule.js';

/**
 * @typedef {FormValidationRuleParams} ArrayLengthFormValidationRuleParams
 *
 * @property {number} size
 */

class ArrayLengthFormValidationRule extends FormValidationRule {
    /**
     * Returns the default error message to use whenever this validation rule fails.
     *
     * @returns {string}
     */
    getDefaultErrorMessage(){
        return 'File is too big.';
    }

    /**
     * Validates a given value.
     *
     * @param {string} value
     * @param {ArrayLengthFormValidationRuleParams} params
     *
     * @returns {boolean}
     */
    validate(value, params){
        return ( Array.isArray(value) ? value.length : 1 ) <= params.length;
    }
}

export default ArrayLengthFormValidationRule;
