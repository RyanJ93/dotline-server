'use strict';

import ServerInfoService from '../services/ServerInfoService.js';
import Controller from './Controller.js';
import App from '../facades/App.js';

class ServerController extends Controller {
    async info(){
        this._sendSuccessResponse(200, 'SUCCESS', {
            serverParams: new ServerInfoService().getServerParams(),
            version: App.getVersion()
        });
    }
}

export default ServerController;
