'use strict';

import PasswordCocktail from '../DTOs/PasswordCocktail.js';
import CryptoUtils from './CryptoUtils.js';
import crypto from 'node:crypto';

class PasswordUtils {
    static #multiStepHashing(string, count){
        for ( let i = 0 ; i < count ; i++ ){
            const hashProc = crypto.createHash('sha512').update(string);
            string = hashProc.digest().toString('hex');
        }
        return string;
    }

    static preparePasswordCocktail(password){
        const pepper = CryptoUtils.generateRandomString();
        const salt = CryptoUtils.generateRandomString();
        const loop = Math.floor(Math.random() * 100);
        let hash = salt + password + pepper;
        hash = PasswordUtils.#multiStepHashing(hash, loop);
        return new PasswordCocktail({
            pepper: pepper,
            salt: salt,
            hash: hash,
            loop: loop
        });
    }

    static comparePassword(password, passwordCocktail){
        let hash = passwordCocktail.getSalt() + password + passwordCocktail.getPepper();
        hash = Buffer.from(PasswordUtils.#multiStepHashing(hash, passwordCocktail.getLoop()));
        return crypto.timingSafeEqual(hash, Buffer.from(passwordCocktail.getHash()));
    }
}

export default PasswordUtils;
