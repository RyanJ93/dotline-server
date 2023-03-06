'use strict';

import AuthenticatedMiddleware from '../middlewares/AuthenticatedMiddleware.js';
import ErrorHandlerMiddleware from '../middlewares/ErrorHandlerMiddleware.js';
import UserController from '../controllers/UserController.js';
import Config from '../facades/Config.js';
import Provider from './Provider.js';
import bb from 'express-busboy';
import express from 'express';

class ServerProvider extends Provider {
    /**
     * Configures the available HTTP routes.
     *
     * @param {Express} app
     */
    static #setupAPIRoutes(app){
        const APIRouter = new express.Router();
        bb.extend(app);
        APIRouter.use(AuthenticatedMiddleware.getClosure());
        APIRouter.get('/user/verify-username', UserController.getClosure('verifyUsername'));
        APIRouter.post('/user/signup', UserController.getClosure('signup'));
        APIRouter.post('/user/login', UserController.getClosure('login'));
        APIRouter.get('/user/logout', UserController.getClosure('logout'));
        APIRouter.get('/user/info', UserController.getClosure('info'));
        APIRouter.use(ErrorHandlerMiddleware.getClosure());
        app.use('/api', APIRouter);
    }

    /**
     * Instantiates the HTTP server.
     *
     * @returns {Promise<Express>}
     */
    static #setupServer(){
        const app = express(), port = Config.getConfig().port ?? ServerProvider.DEFAULT_HTTP_PORT;
        ServerProvider.#setupAPIRoutes(app);
        process.on('applicationReady', () => {
            console.log('Listening on port ' + port);
            app.listen(port);
        });
    }

    /**
     * Performs server HTTP setup.
     *
     * @returns {Promise<void>}
     */
    async run(){
        await ServerProvider.#setupServer();
    }
}

/**
 * @constant {number}
 */
Object.defineProperty(ServerProvider, 'DEFAULT_HTTP_PORT', {
    value: 8888,
    writable: false
});

export default ServerProvider;
