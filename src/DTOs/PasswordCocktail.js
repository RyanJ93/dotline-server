'use strict';

import UDTImplementation from './UDTImplementation.js';

/**
 * @typedef PasswordCocktailUDTProperties
 *
 * @property {string} pepper
 * @property {string} salt
 * @property {string} hash
 * @property {number} loop
 */

/**
 * @typedef PasswordCocktailProperties
 *
 * @property {string} pepper
 * @property {string} salt
 * @property {string} hash
 * @property {number} loop
 */

class PasswordCocktail extends UDTImplementation {
    /**
     * Generates an instance of this class based on the given properties obtained from an UDT object from the database.
     *
     * @param {PasswordCocktailUDTProperties} properties
     *
     * @returns {PasswordCocktail}
     */
    static makeFromUDT(properties){
        return new PasswordCocktail(properties);
    }

    /**
     * @type {string}
     */
    #pepper;

    /**
     * @type {string}
     */
    #salt;

    /**
     * @type {string}
     */
    #hash;

    /**
     * @type {number}
     */
    #loop;

    /**
     * The class constructor.
     *
     * @param {PasswordCocktailUDTProperties} properties
     */
    constructor(properties){
        super(properties);

        this.#pepper = properties.pepper;
        this.#salt = properties.salt;
        this.#hash = properties.hash;
        this.#loop = properties.loop;
    }

    /**
     * Returns the pepper string used during the password hashing process.
     *
     * @returns {string}
     */
    getPepper(){
        return this.#pepper;
    }

    /**
     * Returns the salt string used during the password hashing process.
     *
     * @returns {string}
     */
    getSalt(){
        return this.#salt;
    }

    /**
     * Returns the hashed password.
     *
     * @returns {string}
     */
    getHash(){
        return this.#hash;
    }

    /**
     * Returns how many times the password has bene hashed.
     *
     * @returns {number}
     */
    getLoop(){
        return this.#loop;
    }

    /**
     * Returns a database serializable representation of this class.
     *
     * @returns {PasswordCocktailUDTProperties}
     */
    toUDT(){
        return {
            pepper: this.#pepper,
            salt: this.#salt,
            hash: this.#hash,
            loop: this.#loop,
        };
    }
}

export default PasswordCocktail;
