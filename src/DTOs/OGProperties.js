'use strict';

/**
 * @typedef OGPropertiesParameters
 *
 * @property {?string} [description]
 * @property {?string} [locale]
 * @property {?string} [image]
 * @property {?string} [title]
 * @property {?string} [type]
 * @property {?string} [url]
 */

class OGProperties {
    /**
     * Generates an instance of this class based on the given success result.
     *
     * @param {open-graph-scraper:SuccessResult} result
     *
     * @returns {OGProperties}
     */
    static makeFromOpenGraphScraperResult(result){
        let image = null;
        if ( Array.isArray(result.result.ogImage) && result.result.ogImage.length > 0 ){
            image = result.result.ogImage[0].url;
        }
        return new OGProperties({
            description: ( result.result.ogDescription ?? null ),
            locale: ( result.result.ogLocale ?? null ),
            title: ( result.result.ogTitle ?? null ),
            type: ( result.result.ogType ?? null ),
            url: ( result.result.ogUrl ?? null ),
            image: image
        });
    }

    /**
     * @type {?string}
     */
    #description;

    /**
     * @type {?string}
     */
    #locale;

    /**
     * @type {?string}
     */
    #image;

    /**
     * @type {?string}
     */
    #title;

    /**
     * @type {?string}
     */
    #type;

    /**
     * @type {?string}
     */
    #url;

    /**
     * The class constructor.
     *
     * @param {OGPropertiesParameters} properties
     */
    constructor(properties){
        this.#description = properties.description ?? null;
        this.#locale = properties.locale ?? null;
        this.#image = properties.image ?? null;
        this.#title = properties.title ?? null;
        this.#type = properties.type ?? null;
        this.#url = properties.url ?? null;
    }

    /**
     * Returns Open Graph description.
     *
     * @returns {?string}
     */
    getDescription(){
        return this.#description;
    }

    /**
     * Returns Open Graph locale.
     *
     * @returns {?string}
     */
    getLocale(){
        return this.#locale;
    }

    /**
     * Returns Open Graph image URL.
     *
     * @returns {?string}
     */
    getImage(){
        return this.#image;
    }

    /**
     * Returns Open Graph title.
     *
     * @returns {?string}
     */
    getTitle(){
        return this.#title;
    }

    /**
     * Returns Open Graph type.
     *
     * @returns {?string}
     */
    getType(){
        return this.#type;
    }

    /**
     * Returns Open Graph URL.
     *
     * @returns {?string}
     */
    getURL(){
        return this.#url;
    }

    /**
     * Returns a JSON representation of this class.
     *
     * @returns {OGPropertiesParameters}
     */
    toJSON(){
        return {
            description: this.#description,
            locale: this.#locale,
            image: this.#image,
            title: this.#title,
            type: this.#type,
            url: this.#url
        };
    }
}

export default OGProperties;
