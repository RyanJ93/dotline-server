'use strict';

import FormValidationRule from './FormValidationRule.js';
import DateUtils from '../../utils/DateUtils.js';

/**
 * @typedef {FormValidationRuleParams} DateFormValidationRuleParams
 */

class DateFormValidationRule extends FormValidationRule {
    /**
     * Returns the default error message to use whenever this validation rule fails.
     *
     * @returns {string}
     */
    getDefaultErrorMessage(){
        return 'Invalid date.';
    }

    /**
     * Validates a given value.
     *
     * @param {any} value
     * @param {DateFormValidationRuleParams} params
     *
     * @returns {boolean}
     */
    validate(value, params){
        return DateUtils.isDate(value) || DateUtils.isDate(DateUtils.parseDateString(value));
    }
}

export default DateFormValidationRule;
