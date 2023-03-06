'use strict';

import UndefinedFormValidationRuleException from '../exceptions/UndefinedFormValidationRuleException.js';
import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import FormValidationRule from '../forms/validationRules/FormValidationRule.js';
import ParametricFactory from './ParametricFactory.js';

class FormValidationRuleFactory extends ParametricFactory {
    /**
     * @type {Object.<string, FormValidationRule.constructor>}
     */
    #availableFormValidationRules = Object.create(null);

    /**
     * Registers a validation rule.
     *
     * @param {string} name
     * @param {FormValidationRule.constructor} formValidationRule
     *
     * @throws {IllegalArgumentException} If an invalid form validation rule name is given.
     * @throws {IllegalArgumentException} If an invalid form validation rule is given.
     */
    registerFormValidationRule(name, formValidationRule){
        // TODO: validate this.
        //if ( !( formValidationRule instanceof FormValidationRule ) ){
        //    throw new IllegalArgumentException('Invalid form validation rule class.');
        //}
        if ( typeof name !== 'string' || name === '' ){
            throw new IllegalArgumentException('Invalid form validation rule name.');
        }
        this.#availableFormValidationRules[name] = formValidationRule;
        return this;
    }

    /**
     * Builds an instance of a registered form validation rule given its name.
     *
     * @param {string} name
     *
     * @returns {FormValidationRule}
     *
     * @throws {UndefinedFormValidationRuleException} If no form validation rule matching the given name is found.
     * @throws {IllegalArgumentException} If an invalid form validation rule name is given.
     */
    craft(name){
        if ( typeof name !== 'string' || name === '' ){
            throw new IllegalArgumentException('Invalid form validation rule name.');
        }
        if ( typeof this.#availableFormValidationRules[name] === 'undefined' ){
            throw new UndefinedFormValidationRuleException('No available form validation rule found for the given name (' + name + ').');
        }
        return new this.#availableFormValidationRules[name]();
    }
}

export default FormValidationRuleFactory;
