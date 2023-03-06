'use strict';

import UnauthorizedHTTPException from '../exceptions/UnauthorizedHTTPException.js';
import ClientTrackingInfo from '../DTOs/ClientTrackingInfo.js';
import CryptoUtils from '../utils/CryptoUtils.js';
import Injector from '../facades/Injector.js';
import Service from './Service.js';

class AccessTokenService extends Service {
    #accessTokenRepository;

    constructor(){
        super();

        this.#accessTokenRepository = Injector.inject('AccessTokenRepository');
    }

    generateAccessToken(user, clientTrackingInfo){
        const accessTokenString = CryptoUtils.generateRandomString(256);
        return this.#accessTokenRepository.createAccessToken(user, accessTokenString, clientTrackingInfo);
    }

    async getUserByAccessToken(accessTokenString){
        const accessToken = await this.#accessTokenRepository.getAccessToken(accessTokenString);
        if ( accessToken === null ){
            throw new UnauthorizedHTTPException('No such token found.');
        }
        return accessToken.getUser();
    }
    async deleteAccessToken(accessTokenString){
        const accessToken = await this.#accessTokenRepository.getAccessToken(accessTokenString);
        if ( accessToken !== null ){
            await this.#accessTokenRepository.deleteAccessToken(accessToken);
        }
    }
}

export default AccessTokenService;
