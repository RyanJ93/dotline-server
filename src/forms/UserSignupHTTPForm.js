'use strict';

import HTTPForm from './HTTPForm.js';

class UserSignupHTTPForm extends HTTPForm {
    constructor(){
        super();

        this._mapping = {
            RSAPrivateKeyEncryptionParametersKeyLength: { rules: { ['integer']: 'You must provide a valid AES encryption key length.' }, isRequired: true },
            RSAPrivateKeyEncryptionParametersMode: { rules: { ['non-empty-string']: 'You must provide a valid AES encryption mode.' }, isRequired: true },
            RSAPrivateKeyEncryptionParametersIV: { rules: { ['non-empty-string']: 'You must provide a valid AES encryption IV.' }, isRequired: true },
            RSAPrivateKey: { rules: { ['non-empty-string']: 'You must provide a valid RSA private key.' }, isRequired: true },
            RSAPublicKey: { rules: { ['non-empty-string']: 'You must provide a valid RSA public key.' }, isRequired: true },
            username: { rules: { ['non-empty-string']: 'You must provide a valid username.' }, isRequired: true },
            password: { rules: { ['non-empty-string']: 'You must provide a valid password.' }, isRequired: true }
        };
    }
}

export default UserSignupHTTPForm;
