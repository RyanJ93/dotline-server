'use strict';

import HTTPForm from './HTTPForm.js';

class UserRecoverAccountHTTPForm extends HTTPForm {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            RSAPrivateKeyEncryptionParametersKeyLength: { rules: { ['integer']: { msg: 'You must provide a valid AES encryption key length.' } }, isRequired: true },
            RSAPrivateKeyEncryptionParametersMode: { rules: { ['non-empty-string']: { msg: 'You must provide a valid AES encryption mode.' } }, isRequired: true },
            RSAPrivateKeyEncryptionParametersIV: { rules: { ['non-empty-string']: { msg: 'You must provide a valid AES encryption IV.' } }, isRequired: true },
            sessionToken: { rules: { ['non-empty-string']: { msg: 'You must provide a valid user recovery session token.' } }, isRequired: true },
            RSAPrivateKey: { rules: { ['non-empty-string']: { msg: 'You must provide a valid RSA private key.' } }, isRequired: true },
            password: { rules: { ['non-empty-string']: { msg: 'You must provide a valid password.' } }, isRequired: true }
        };
    }
}

export default UserRecoverAccountHTTPForm;
