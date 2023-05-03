'use strict';

import UnauthorizedHTTPException from '../exceptions/UnauthorizedHTTPException.js';
import AccessTokenService from '../services/AccessTokenService.js';
import UserService from '../services/UserService.js';
import Middleware from './Middleware.js';

class AuthenticatedMiddleware extends Middleware {
    /**
     * Returns the access token that has been sent as part of the request headers.
     *
     * @param {Request} request
     *
     * @returns {string}
     */
    static #getAccessToken(request){
        let accessToken = ( request.headers['authorization'] ?? null );
        if ( typeof accessToken === 'string' && accessToken !== '' ){
            accessToken = accessToken.substr(7);
        }
        return accessToken;
    }

    /**
     * Handles incoming HTTP requests.
     *
     * @param {Request} request
     * @param {Response} response
     * @param {Function} next
     *
     * @returns {Promise<void>}
     */
    async handle(request, response, next){
        const isWhitelisted = AuthenticatedMiddleware.WHITELISTED_ROUTE_LIST.indexOf(request.path) >= 0;
        request.accessToken = AuthenticatedMiddleware.#getAccessToken(request);
        request.authenticatedUser = null;
        if ( !isWhitelisted ){
            // If current route is not whitelisted then check authentication.
            if ( request.accessToken === null || request.accessToken === '' ){
                throw new UnauthorizedHTTPException('Invalid access token.');
            }
            request.authenticatedUser = await new AccessTokenService().getUserByAccessToken(request.accessToken);
            await ( await AccessTokenService.makeFromAccessToken(request.accessToken) ).updateLastAccess();
            await new UserService(request.authenticatedUser).updateLastAccess();
        }
        await next();
    }
}

/**
 * @constant {string[]}
 */
Object.defineProperty(AuthenticatedMiddleware, 'WHITELISTED_ROUTE_LIST', {
    value: Object.freeze(['/user/login', '/user/signup', '/user/verify-username']),
    writable: false
});

export default AuthenticatedMiddleware;
