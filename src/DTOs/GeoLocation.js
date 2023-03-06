'use strict';

import UDTImplementation from './UDTImplementation.js';

class GeoLocation extends UDTImplementation {
    static makeFromUDT(properties){
        return new GeoLocation(properties);
    }

    #longitude;
    #latitude;
    #text;

    constructor(properties){
        super(properties);

        this.#longitude = properties.longitude;
        this.#latitude = properties.latitude;
        this.#text = properties.text;
    }

    getLongitude(){
        return this.#longitude;
    }

    getLatitude(){
        return this.#latitude;
    }

    getText(){
        return this.#text;
    }

    toJSON(){
        return {
            longitude: this.#longitude,
            latitude: this.#latitude,
            text: this.#text
        };
    }

    toUDT(){
        return this.toJSON();
    }
}

export default GeoLocation;
