'use strict';

import HTTPForm from './HTTPForm.js';

class UserSignupHTTPForm extends HTTPForm {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            recoveryRSAPrivateKeyEncryptionParametersKeyLength: { rules: { ['integer']: { msg: 'You must provide a valid AES encryption key length.' } }, isRequired: true },
            recoveryRSAPrivateKeyEncryptionParametersMode: { rules: { ['non-empty-string']: { msg: 'You must provide a valid AES encryption mode.' } }, isRequired: true },
            recoveryRSAPrivateKeyEncryptionParametersIV: { rules: { ['non-empty-string']: { msg: 'You must provide a valid AES encryption IV.' } }, isRequired: true },
            RSAPrivateKeyEncryptionParametersKeyLength: { rules: { ['integer']: { msg: 'You must provide a valid AES encryption key length.' } }, isRequired: true },
            RSAPrivateKeyEncryptionParametersMode: { rules: { ['non-empty-string']: { msg: 'You must provide a valid AES encryption mode.' } }, isRequired: true },
            RSAPrivateKeyEncryptionParametersIV: { rules: { ['non-empty-string']: { msg: 'You must provide a valid AES encryption IV.' } }, isRequired: true },
            recoveryRSAPrivateKey: { rules: { ['non-empty-string']: { msg: 'You must provide a valid recovery RSA private key.' } }, isRequired: true },
            RSAPrivateKey: { rules: { ['non-empty-string']: { msg: 'You must provide a valid RSA private key.' } }, isRequired: true },
            RSAPublicKey: { rules: { ['non-empty-string']: { msg: 'You must provide a valid RSA public key.' } }, isRequired: true },
            recoveryKey: { rules: { ['non-empty-string']: { msg: 'You must provide a valid recovery key.' } }, isRequired: true },
            username: { rules: { ['non-empty-string']: { msg: 'You must provide a valid username.' } }, isRequired: true },
            password: { rules: { ['non-empty-string']: { msg: 'You must provide a valid password.' } }, isRequired: true }
        };
    }
}

export default UserSignupHTTPForm;
