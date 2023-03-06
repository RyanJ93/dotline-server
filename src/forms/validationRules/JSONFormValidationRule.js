'use strict';

import FormValidationRule from './FormValidationRule.js';

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
     * @param {string} value
     *
     * @returns {boolean}
     */
    validate(value){
        try{
            JSON.parse(value);
            return true;
        }catch{
            return false;
        }
    }
}

export default JSONFormValidationRule;
