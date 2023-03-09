'use strict';

import UnauthorizedHTTPException from '../exceptions/UnauthorizedHTTPException.js';
import ClientTrackingInfo from '../DTOs/ClientTrackingInfo.js';
import CryptoUtils from '../utils/CryptoUtils.js';
import Injector from '../facades/Injector.js';
import Service from './Service.js';

class AccessTokenService extends Service {
    static async makeFromAccessToken(accessTokenString){
        const accessTokenRepository = Injector.inject('AccessTokenRepository');
        const accessToken = await accessTokenRepository.getAccessToken(accessTokenString);
        return accessToken === null ? null : new AccessTokenService(accessToken);
    }

    #accessTokenRepository;
    #accessToken = null;

    constructor(accessToken = null){
        super();

        this.#accessTokenRepository = Injector.inject('AccessTokenRepository');
        this.setAccessToken(accessToken);
    }

    setAccessToken(accessToken){
        this.#accessToken = accessToken;
        return this;
    }

    getAccessToken(){
        return this.#accessToken;
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
