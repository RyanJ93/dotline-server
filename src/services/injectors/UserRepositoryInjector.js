'use strict';

import UserRepository from '../../repositories/UserRepository.js';
import Injector from './Injector.js';

class UserRepositoryInjector extends Injector {
    inject() {
        return new UserRepository();
    }
}

export default UserRepositoryInjector;
