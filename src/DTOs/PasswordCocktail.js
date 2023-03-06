'use strict';

import UDTImplementation from './UDTImplementation.js';

class PasswordCocktail extends UDTImplementation {
    static makeFromUDT(properties){
        return new PasswordCocktail(properties);
    }

    #pepper;
    #salt;
    #hash;
    #loop;

    constructor(properties){
        super(properties);

        this.#pepper = properties.pepper;
        this.#salt = properties.salt;
        this.#hash = properties.hash;
        this.#loop = properties.loop;
    }

    getPepper(){
        return this.#pepper;
    }

    getSalt(){
        return this.#salt;
    }

    getHash(){
        return this.#hash;
    }

    getLoop(){
        return this.#loop;
    }

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
