'use strict';

import FormValidationRule from './FormValidationRule.js';

/**
 * @typedef {FormValidationRuleParams} JSONFormValidationRuleParams
 */

class JSONFormValidationRule extends FormValidationRule {
    /**
     * Returns the default error message to use whenever this validation rule fails.
     *
     * @returns {string}
     */
    getDefaultErrorMessage(){
        return 'Invalid JSON string.';
    }

    /**
     * Validates a given value.
     *
     * @param {any} value
     * @param {JSONFormValidationRuleParams} params
     *
     * @returns {boolean}
     */
    validate(value, params){
        try{
            JSON.parse(value);
            return true;
        }catch{
            return false;
        }
    }
}

export default JSONFormValidationRule;
