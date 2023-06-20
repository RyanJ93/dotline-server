'use strict';

import StickerPackService from '../services/StickerPackService.js';
import Command from './Command.js';

class CreateStickerPackCommand extends Command {
    /**
     * Configures this command.
     *
     * @param {commander:Command} command
     */
    static configure(command){
        const commandInstance = command.command('create-sticker-pack');
        commandInstance.description('Creates a new sticker pack based on the given details.');
        commandInstance.requiredOption('-c, --cover <cover>', 'Path to the cover picture (must be a jpg).', null);
        commandInstance.requiredOption('-n, --name <name>', 'The sticker pack name.', null);
        commandInstance.action(CreateStickerPackCommand.getClosure());
    }

    /**
     * Implements the command logic.
     *
     * @returns {Promise<void>}
     */
    async handle(){
        const { name, cover } = this._commandContext;
        const stickerPack = await new StickerPackService().create(name, cover);
        console.log('Sticker pack created successfully, ID: ' + stickerPack.getID());
    }
}

export default CreateStickerPackCommand;
