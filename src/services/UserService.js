'use strict';

import DuplicatedUsernameException from '../exceptions/DuplicatedUsernameException.js';
import UnauthorizedHTTPException from '../exceptions/UnauthorizedHTTPException.js';
import NotFoundHTTPException from '../exceptions/NotFoundHTTPException.js';
import ClientTrackingService from './ClientTrackingService.js';
import AccessTokenService from './AccessTokenService.js';
import PasswordUtils from '../utils/PasswordUtils.js';
import Injector from '../facades/Injector.js';
import Service from './Service.js';

class UserService extends Service {
    #userRepository;

    constructor(){
        super();

        this.#userRepository = Injector.inject('UserRepository');
    }

    async isUsernameAvailable(username){
        return ( await this.#userRepository.getUserByUsername(username) ) === null;
    }

    async signup(username, password, RSAPublicKey, RSAPrivateKey, RSAPrivateKeyEncryptionParameters){
        const isUsernameAvailable = await this.isUsernameAvailable(username);
        if ( !isUsernameAvailable ){
            throw new DuplicatedUsernameException('This username has already been taken.');
        }
        password = PasswordUtils.preparePasswordCocktail(password);
        return this.#userRepository.create(username, password, RSAPublicKey, RSAPrivateKey, RSAPrivateKeyEncryptionParameters);
    }

    async authenticateWithCredentials(username, password){
        const user = await this.#userRepository.getUserByUsername(username);
        if ( user === null ){
            throw new NotFoundHTTPException('No such user found.');
        }
        if ( !PasswordUtils.comparePassword(password, user.getPassword()) ){
            throw new UnauthorizedHTTPException('Password mismatch.');
        }
        return user;
    }

    async generateAccessToken(user, HTTPRequest){
        const clientTrackingService = new ClientTrackingService(), accessTokenService = new AccessTokenService();
        const clientTrackingInfo = await clientTrackingService.getClientTrackingInfoByHTTPRequest(HTTPRequest);
        return await accessTokenService.generateAccessToken(user, clientTrackingInfo);
    }
}

export default UserService;
