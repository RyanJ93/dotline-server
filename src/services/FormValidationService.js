'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import ErrorMessageBag from '../DTOs/ErrorMessageBag.js';
import Injector from '../facades/Injector.js';
import HTTPForm from '../forms/HTTPForm.js';
import Service from './Service.js';

class FormValidationService extends Service {
    static #getFieldValue(fields, fieldName){
        let propertyHierarchy = fieldName.split('.'), value = fields;
        propertyHierarchy.forEach((property) => {
            value = value[property];
        });
        return value;
    }

    /**
     * @type {?ErrorMessageBag}
     */
    #lastErrorMessageBag = null;

    #formValidationRuleFactory;

    #form;

    #addErrorMessage(fieldName, errorMessage){
        if ( this.#lastErrorMessageBag === null ){
            this.#lastErrorMessageBag = new ErrorMessageBag();
        }
        this.#lastErrorMessageBag.add(fieldName, errorMessage);
    }

    #validateFormField(value, fieldName, properties){
        let isValid = true;
        for ( const ruleName in properties.rules ){
            const formValidationRule = this.#formValidationRuleFactory.craft(ruleName);
            if ( !formValidationRule.validate(value) ){
                const message = properties.rules[ruleName] ?? formValidationRule.getDefaultErrorMessage();
                this.#addErrorMessage(fieldName, message);
                isValid = false;
            }
        }
        return isValid;
    }

    constructor(form){
        super();

        this.#formValidationRuleFactory = Injector.inject('FormValidationRuleFactory');
        this.setForm(form);
    }

    setForm(form){
        if ( !( form instanceof HTTPForm ) ){
            throw new IllegalArgumentException('Invalid form instance.');
        }
        this.#form = form;
        return this;
    }

    getForm(){
        return this.#form;
    }

    getLastErrorMessageBag(){
        return this.#lastErrorMessageBag;
    }

    validate(fields){
        let isValid = true, formMapping = this.#form.getMapping();
        for ( const fieldName in formMapping ){
            const value = FormValidationService.#getFieldValue(fields, fieldName);
            const hasValue = typeof value !== 'undefined' && value !== null;
            const isRequired = formMapping[fieldName].isRequired === true;
            if ( isRequired || hasValue ){
                isValid = isValid && this.#validateFormField(value, fieldName, formMapping[fieldName]);
            }
        }
        return isValid;
    }
}

export default FormValidationService;
