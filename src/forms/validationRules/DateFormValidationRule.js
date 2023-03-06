'use strict';

import FormValidationRule from './FormValidationRule.js';
import DateUtils from '../../utils/DateUtils.js';

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
     * @param {string} value
     *
     * @returns {boolean}
     */
    validate(value){
        return DateUtils.isDate(value) || DateUtils.isDate(DateUtils.parseDateString(value));
    }
}

export default DateFormValidationRule;
