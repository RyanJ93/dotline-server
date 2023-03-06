'use strict';

import AccessTokenRepository from '../../repositories/AccessTokenRepository.js';
import Injector from './Injector.js';

class AccessTokenRepositoryInjector extends Injector {
    inject(){
        return new AccessTokenRepository();
    }
}

export default AccessTokenRepositoryInjector;
