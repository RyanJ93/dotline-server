'use strict';

import AccessTokenRepositoryInjector from '../services/injectors/AccessTokenRepositoryInjector.js';
import UserRepositoryInjector from '../services/injectors/UserRepositoryInjector.js';
import InjectionManager from '../support/InjectionManager.js';
import Provider from './Provider.js';

class RepositoryProvider extends Provider {
    async run(){
        InjectionManager.getInstance().register('AccessTokenRepository', new AccessTokenRepositoryInjector());
        InjectionManager.getInstance().register('UserRepository', new UserRepositoryInjector());
    }
}

export default RepositoryProvider;
