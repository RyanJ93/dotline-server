'use strict';

import UserSettingsRepository from '../../repositories/UserSettingsRepository.js';
import Injector from './Injector.js';

class UserSettingsRepositoryInjector extends Injector {
    inject(){
        return new UserSettingsRepository();
    }
}

export default UserSettingsRepositoryInjector;
