'use strict';

import Config from '../facades/Config.js';
import Service from './Service.js';

/**
 * @typedef ServerParams
 *
 * @property {number} maxMessageLength
 * @property {number} maxFileCount
 * @property {number} maxFileSize
 */

class ServerInfoService extends Service {
    /**
     * Returns defined server params.
     *
     * @returns {ServerParams}
     */
    getServerParams(){
        let { serverParams } = Config.getConfig();
        if ( serverParams === null || typeof serverParams !== 'object' ){
            serverParams = {};
        }
        if ( serverParams.maxMessageLength === null || isNaN(serverParams.maxMessageLength) || serverParams.maxMessageLength <= 0 ){
            this._logger.warn('No valid max message length value specified, using default one.');
            serverParams.maxMessageLength = ServerInfoService.DEFAULT_MAX_MESSAGE_LENGTH;
        }
        if ( serverParams.maxFileSize === null || isNaN(serverParams.maxFileSize) || serverParams.maxFileSize <= 0 ){
            this._logger.warn('No valid max file size value specified, using default one.');
            serverParams.maxFileSize = ServerInfoService.DEFAULT_MAX_FILE_SIZE;
        }
        if ( serverParams.maxFileCount === null || isNaN(serverParams.maxFileCount) || serverParams.maxFileCount < 0 ){
            this._logger.warn('No valid max file count value specified, using default one.');
            serverParams.maxFileCount = ServerInfoService.DEFAULT_MAX_FILE_COUNT;
        }
        return serverParams;
    }
}

/**
 * @constant {number}
 */
Object.defineProperty(ServerInfoService, 'DEFAULT_MAX_MESSAGE_LENGTH', { value: 10000, writable: false });

/**
 * @constant {number}
 */
Object.defineProperty(ServerInfoService, 'DEFAULT_MAX_FILE_SIZE', { value: 52428800, writable: false });

/**
 * @constant {number}
 */
Object.defineProperty(ServerInfoService, 'DEFAULT_MAX_FILE_COUNT', { value: 20, writable: false });

export default ServerInfoService;
