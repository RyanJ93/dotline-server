'use strict';

import UDTImplementation from './UDTImplementation.js';

class AESEncryptionParameters extends UDTImplementation {
    static makeFromUDT(properties){
        properties.keyLength = properties.key_length;
        return new AESEncryptionParameters(properties);
    }

    static makeFromHTTPRequest(request, prefix = ''){
        return new AESEncryptionParameters({
            keyLength: parseInt(request.body[prefix + 'KeyLength']),
            mode: request.body[prefix + 'Mode'],
            iv: request.body[prefix + 'IV']
        });
    }

    #keyLength;
    #mode;
    #iv;

    constructor(properties){
        super(properties);

        this.#keyLength = properties.keyLength;
        this.#mode = properties.mode;
        this.#iv = properties.iv;
    }

    getKeyLength(){
        return this.#keyLength;
    }

    getMode(){
        return this.#mode;
    }

    getIV(){
        return this.#iv;
    }

    toJSON(){
        return {
            keyLength: this.#keyLength,
            mode: this.#mode,
            iv: this.#iv
        };
    }

    toUDT(){
        return {
            key_length: this.#keyLength,
            mode: this.#mode,
            iv: this.#iv
        };
    }
}

export default AESEncryptionParameters;
