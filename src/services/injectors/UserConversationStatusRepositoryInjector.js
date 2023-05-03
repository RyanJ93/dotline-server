'use strict';

import UserConversationStatusRepository from '../../repositories/UserConversationStatusRepository.js';
import Injector from './Injector.js';

class UserConversationStatusRepositoryInjector extends Injector {
    inject(){
        return new UserConversationStatusRepository();
    }
}

export default UserConversationStatusRepositoryInjector;
