'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import PasswordCocktail from '../DTOs/PasswordCocktail.js';
import CryptoUtils from './CryptoUtils.js';
import crypto from 'node:crypto';

class PasswordUtils {
    /**
     * Applies the SHA-512 hashing algorithm to a given string for a given number of times.
     *
     * @param {string} string
     * @param {number} count
     *
     * @returns {string}
     */
    static #multiStepHashing(string, count){
        for ( let i = 0 ; i < count ; i++ ){
            const hashProc = crypto.createHash('sha512').update(string);
            string = hashProc.digest().toString('hex');
        }
        return string;
    }

    /**
     * Generates a password cocktail based on the given password.
     *
     * @param {string} password
     *
     * @returns {PasswordCocktail}
     *
     * @throws {IllegalArgumentException} If an invalid password is given.
     */
    static preparePasswordCocktail(password){
        if ( password === '' || typeof password !== 'string' ){
            throw new IllegalArgumentException('Invalid password.');
        }
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

    /**
     * Compares a given password with a given password cocktail.
     *
     * @param {string} password
     * @param {PasswordCocktail} passwordCocktail
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid password cocktail is given.
     * @throws {IllegalArgumentException} If an invalid password is given.
     */
    static comparePassword(password, passwordCocktail){
        if ( !( passwordCocktail instanceof PasswordCocktail ) ){
            throw new IllegalArgumentException('Invalid password cocktail.');
        }
        if ( password === '' || typeof password !== 'string' ){
            throw new IllegalArgumentException('Invalid password.');
        }
        let hash = passwordCocktail.getSalt() + password + passwordCocktail.getPepper();
        hash = Buffer.from(PasswordUtils.#multiStepHashing(hash, passwordCocktail.getLoop()));
        return crypto.timingSafeEqual(hash, Buffer.from(passwordCocktail.getHash()));
    }
}

export default PasswordUtils;
