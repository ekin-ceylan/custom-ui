import { isEmpty } from '../../modules/utilities.js';
import LightComponentBase from '../../base/light-component-base.js';

export default class SuggestionOption extends LightComponentBase {
    static get properties() {
        return {
            ...super.properties,
            suggestionText: { type: String, noAccessor: true },
            disabled: { type: Boolean },
            hidden: { type: Boolean },
        };
    }

    #suggestionText = '';

    get suggestionText() {
        return isEmpty(this.#suggestionText) ? this.textContent : this.#suggestionText;
    }
    set suggestionText(value) {
        this.#suggestionText = value;
    }

    constructor() {
        super();

        /** @type {string} */
        this.suggestionText = '';
        /** @type {boolean} */
        this.disabled = false;
        /** @type {boolean} */
        this.hidden = false;
    }
}
