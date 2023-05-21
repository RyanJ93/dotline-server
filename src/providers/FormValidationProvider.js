'use strict';

import NotEmptyStringFormValidationRule from '../forms/validationRules/NotEmptyStringFormValidationRule.js';
import FormValidationRuleFactoryInjector from '../services/injectors/FormValidationRuleFactoryInjector.js';
import ArrayLengthFormValidationRule from '../forms/validationRules/ArrayLengthFormValidationRule.js';
import FileSizeFormValidationRule from '../forms/validationRules/FileSizeFormValidationRule.js';
import BooleanFormValidationRule from '../forms/validationRules/BooleanFormValidationRule.js';
import IntegerFormValidationRule from '../forms/validationRules/IntegerFormValidationRule.js';
import ArrayFormValidationRule from '../forms/validationRules/ArrayFormValidationRule.js';
import DateFormValidationRule from '../forms/validationRules/DateFormValidationRule.js';
import JSONFormValidationRule from '../forms/validationRules/JSONFormValidationRule.js';
import FormValidationRuleFactory from '../factories/FormValidationRuleFactory.js';
import InjectionManager from '../support/InjectionManager.js';
import Provider from './Provider.js';

class FormValidationProvider extends Provider {
    /**
     * Registers all the available validation rules into the validation rule factory.
     *
     * @param {FormValidationRuleFactory} formValidationRuleFactory
     */
    static #registerFormValidationRules(formValidationRuleFactory){
        formValidationRuleFactory.registerFormValidationRule('non-empty-string', NotEmptyStringFormValidationRule);
        formValidationRuleFactory.registerFormValidationRule('array-length', ArrayLengthFormValidationRule);
        formValidationRuleFactory.registerFormValidationRule('file-size', FileSizeFormValidationRule);
        formValidationRuleFactory.registerFormValidationRule('boolean', BooleanFormValidationRule);
        formValidationRuleFactory.registerFormValidationRule('integer', IntegerFormValidationRule);
        formValidationRuleFactory.registerFormValidationRule('array', ArrayFormValidationRule);
        formValidationRuleFactory.registerFormValidationRule('date', DateFormValidationRule);
        formValidationRuleFactory.registerFormValidationRule('json', JSONFormValidationRule);
    }

    /**
     * Registers validation rules.
     *
     * @return {Promise<void>}
     */
    async run(){
        const formValidationRuleFactory = new FormValidationRuleFactory();
        FormValidationProvider.#registerFormValidationRules(formValidationRuleFactory);
        const formValidationRuleFactoryInjector = new FormValidationRuleFactoryInjector(formValidationRuleFactory);
        InjectionManager.getInstance().register('FormValidationRuleFactory', formValidationRuleFactoryInjector);
    }
}

export default FormValidationProvider;
