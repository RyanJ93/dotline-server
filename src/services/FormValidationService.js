'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import ErrorMessageBag from '../DTOs/ErrorMessageBag.js';
import Injector from '../facades/Injector.js';
import HTTPForm from '../forms/HTTPForm.js';
import Service from './Service.js';

class FormValidationService extends Service {
    /**
     * Returns the value associated to a field given its name.
     *
     * @param {Object.<string, any>} fields
     * @param {string} fieldName
     *
     * @returns {any}
     */
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

    /**
     * @type {FormValidationRuleFactory}
     */
    #formValidationRuleFactory;

    /**
     * @type {HTTPForm}
     */
    #form;

    /**
     * Adds an error message to the error message bag.
     *
     * @param {string} fieldName
     * @param {string} errorMessage
     */
    #addErrorMessage(fieldName, errorMessage){
        if ( this.#lastErrorMessageBag === null ){
            this.#lastErrorMessageBag = new ErrorMessageBag();
        }
        this.#lastErrorMessageBag.add(fieldName, errorMessage);
    }

    /**
     * validates a given fields against a given value.
     *
     * @param {any} value
     * @param {string} fieldName
     * @param {FormFieldMapping} properties
     *
     * @returns {boolean}
     */
    #validateFormField(value, fieldName, properties){
        let isValid = true;
        for ( const ruleName in properties.rules ){
            const formValidationRule = this.#formValidationRuleFactory.craft(ruleName);
            const params = properties.rules[ruleName].params ?? {};
            if ( !formValidationRule.validate(value, params) ){
                const message = properties.rules[ruleName].msg ?? formValidationRule.getDefaultErrorMessage();
                this.#addErrorMessage(fieldName, message);
                isValid = false;
            }
        }
        return isValid;
    }

    /**
     * The class constructor.
     *
     * @param {HTTPForm} form
     */
    constructor(form){
        super();

        this.#formValidationRuleFactory = Injector.inject('FormValidationRuleFactory');
        this.setForm(form);
    }

    /**
     * Sets the form to validate.
     *
     * @param {HTTPForm} form
     *
     * @returns {FormValidationService}
     *
     * @throws {IllegalArgumentException} If an invalid form instance is given.
     */
    setForm(form){
        if ( !( form instanceof HTTPForm ) ){
            throw new IllegalArgumentException('Invalid form instance.');
        }
        this.#form = form;
        return this;
    }

    /**
     * Returns the form to validate.
     *
     * @returns {HTTPForm}
     */
    getForm(){
        return this.#form;
    }

    /**
     * Returns an error message bag containing all the errors occurred during last validation process.
     *
     * @returns {?ErrorMessageBag}
     */
    getLastErrorMessageBag(){
        return this.#lastErrorMessageBag;
    }

    /**
     * Validates the given fields against the form that has been defined.
     *
     * @param {Object.<string, any>} fields
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid fields set is given.
     */
    validate(fields){
        if ( fields === null || typeof fields !== 'object' ){
            throw new IllegalArgumentException('Invalid fields set.');
        }
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
