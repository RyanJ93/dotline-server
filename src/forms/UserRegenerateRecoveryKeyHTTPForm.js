'use strict';

import HTTPForm from './HTTPForm.js';

class UserRegenerateRecoveryKeyHTTPForm extends HTTPForm {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            recoveryRSAPrivateKeyEncryptionParametersKeyLength: { rules: { ['integer']: { msg: 'You must provide a valid AES encryption key length.' } }, isRequired: true },
            recoveryRSAPrivateKeyEncryptionParametersMode: { rules: { ['non-empty-string']: { msg: 'You must provide a valid AES encryption mode.' } }, isRequired: true },
            recoveryRSAPrivateKeyEncryptionParametersIV: { rules: { ['non-empty-string']: { msg: 'You must provide a valid AES encryption IV.' } }, isRequired: true },
            recoveryRSAPrivateKey: { rules: { ['non-empty-string']: { msg: 'You must provide a valid recovery RSA private key.' } }, isRequired: true },
            recoveryKey: { rules: { ['non-empty-string']: { msg: 'You must provide a valid recovery key.' } }, isRequired: true }
        };
    }
}

export default UserRegenerateRecoveryKeyHTTPForm;
