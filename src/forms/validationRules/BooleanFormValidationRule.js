'use strict';

import FormValidationRule from './FormValidationRule.js';

/**
 * @typedef {FormValidationRuleParams} BooleanFormValidationRuleParams
 */

class BooleanFormValidationRule extends FormValidationRule {
    /**
     * Returns the default error message to use whenever this validation rule fails.
     *
     * @returns {string}
     */
    getDefaultErrorMessage(){
        return 'Invalid boolean value.';
    }

    /**
     * Validates a given value.
     *
     * @param {any} value
     * @param {BooleanFormValidationRuleParams} params
     *
     * @returns {boolean}
     */
    validate(value, params){
        if ( value === true || value === false ){
            return true;
        }
        if ( typeof value === 'string' ){
            value = value.toLowerCase();
            return value === '1' || value === '0' || value === 'yes' || value === 'no' || value === 'true' || value === 'false';
        }
        return false;
    }
}

export default BooleanFormValidationRule;
