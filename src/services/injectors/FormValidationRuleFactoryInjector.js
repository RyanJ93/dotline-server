'use strict';

import FormValidationRuleFactory from '../../factories/FormValidationRuleFactory.js';
import IllegalArgumentException from '../../exceptions/IllegalArgumentException.js';
import Injector from './Injector.js';

class FormValidationRuleFactoryInjector extends Injector {
    /**
     * @type {FormValidationRuleFactory}
     */
    #formValidationRuleFactory;

    /**
     * Sets the form validation rule factory instance to provide.
     *
     * @param {FormValidationRuleFactory} formValidationRuleFactory
     */
    #setFormValidationRuleFactory(formValidationRuleFactory){
        if ( !( formValidationRuleFactory instanceof FormValidationRuleFactory ) ){
            throw new IllegalArgumentException('Invalid form validation rule factory.');
        }
        this.#formValidationRuleFactory = formValidationRuleFactory;
    }

    /**
     * The class constructor.
     *
     * @param {FormValidationRuleFactory} formValidationRuleFactory
     */
    constructor(formValidationRuleFactory){
        super();

        this.#setFormValidationRuleFactory(formValidationRuleFactory);
    }

    /**
     * Injects the instance of the FormValidationRuleFactory class defined.
     *
     * @returns {FormValidationRuleFactory}
     */
    inject(){
        return this.#formValidationRuleFactory;
    }
}

export default FormValidationRuleFactoryInjector;
