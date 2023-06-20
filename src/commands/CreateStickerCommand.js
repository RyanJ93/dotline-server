'use strict';

import StickerPackService from '../services/StickerPackService.js';
import StickerService from '../services/StickerService.js';
import Command from './Command.js';

class CreateStickerCommand extends Command {
    /**
     * Configures this command.
     *
     * @param {commander:Command} command
     */
    static configure(command){
        const commandInstance = command.command('create-sticker');
        commandInstance.description('Creates a new sticker based on the given details.');
        commandInstance.requiredOption('-s, --sticker-pack-id <stickerPackId>', 'The ID of the sticker pack the created sticker will be added into.', null);
        commandInstance.requiredOption('-e, --emoji <emoji>', 'An emoji representing the sticker subject.', null);
        commandInstance.requiredOption('-c, --content <content>', 'Path to the sticker content file.', null);
        commandInstance.option('-a, --animated', 'Marks the sticker as animated.');
        commandInstance.action(CreateStickerCommand.getClosure());
    }

    /**
     * Implements the command logic.
     *
     * @returns {Promise<void>}
     */
    async handle(){
        const { stickerPackId, emoji, content, animated } = this._commandContext;console.log(emoji);
        const stickerPack = await new StickerPackService().getStickerPackByID(stickerPackId);
        const sticker = await new StickerService(stickerPack).create(content, emoji, animated);
        console.log('Sticker created successfully, ID: ' + sticker.getID());
    }
}

export default CreateStickerCommand;
