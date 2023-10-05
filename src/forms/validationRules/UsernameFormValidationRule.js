'use strict';

import FormValidationRule from './FormValidationRule.js';
import StringUtils from '../../utils/StringUtils.js';

/**
 * @typedef {FormValidationRuleParams} UsernameFormValidationRuleParams
 */

class UsernameFormValidationRule extends FormValidationRule {
    /**
     * Returns the default error message to use whenever this validation rule fails.
     *
     * @returns {string}
     */
    getDefaultErrorMessage(){
        return 'Invalid username format.';
    }

    /**
     * Validates a given value.
     *
     * @param {any} value
     * @param {UsernameFormValidationRuleParams} params
     *
     * @returns {boolean}
     */
    validate(value, params){
        return typeof value === 'string' && StringUtils.isValidUsername(value);
    }
}

export default UsernameFormValidationRule;
