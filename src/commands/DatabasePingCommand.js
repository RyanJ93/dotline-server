'use strict';

import StickerPackService from '../services/StickerPackService.js';
import Command from './Command.js';

class DatabasePingCommand extends Command {
    /**
     * Configures this command.
     *
     * @param {commander:Command} command
     */
    static configure(command){
        const commandInstance = command.command('database-ping');
        commandInstance.description('Performs a dummy query to keep the database instance alive.');
        commandInstance.action(DatabasePingCommand.getClosure());
    }

    /**
     * Implements the command logic.
     *
     * @returns {Promise<void>}
     */
    async handle(){
        await new StickerPackService().list();
        console.log('Database pinged!');
    }
}

export default DatabasePingCommand;
