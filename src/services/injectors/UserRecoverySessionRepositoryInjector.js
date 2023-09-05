'use strict';

import UserRecoverySessionRepository from '../../repositories/UserRecoverySessionRepository.js';
import Injector from './Injector.js';

class UserRecoverySessionRepositoryInjector extends Injector {
    inject(){
        return new UserRecoverySessionRepository();
    }
}

export default UserRecoverySessionRepositoryInjector;
