'use strict';

import CreateStickerPackCommand from '../commands/CreateStickerPackCommand.js';
import CreateStickerCommand from '../commands/CreateStickerCommand.js';
import Provider from './Provider.js';

class CommandProvider extends Provider {
    /**
     * @type {commander:Command}
     */
    #command = null;

    /**
     * The class constructor.
     *
     * @param {commander:Command} command
     */
    constructor(command){
        super();

        this.#command = command;
    }

    /**
     * Register supported commands.
     *
     * @returns {Promise<void>}
     */
    async run(){
        CreateStickerPackCommand.configure(this.#command);
        CreateStickerCommand.configure(this.#command);
    }
}

export default CommandProvider;
