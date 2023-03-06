'use strict';

import AccessToken from '../models/AccessToken.js';
import Repository from './Repository.js';

class AccessTokenRepository extends Repository {
    async createAccessToken(user, accessTokenString, clientTrackingInfo){
        const accessToken = new AccessToken();
        accessToken.setBrowserName(clientTrackingInfo.getBrowserName());
        accessToken.setLocation(clientTrackingInfo.getLocation());
        accessToken.setIP(clientTrackingInfo.getIP());
        accessToken.setAccessToken(accessTokenString);
        await accessToken.setUser(user).save();
        return accessToken;
    }

    getAccessToken(accessToken){
        return AccessToken.findOne({ accessToken: accessToken });
    }

    deleteAccessToken(accessToken){
        return accessToken.delete();
    }
}

export default AccessTokenRepository;
