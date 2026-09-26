import LightComponentBase from '../../base/light-component-base.js';

export default class CustomOption extends LightComponentBase {
    static get properties() {
        return {
            ...super.properties,
            label: { type: String },
            text: { type: String, noaccessor: true },
            value: { type: String },
            selected: { type: Boolean },
            disabled: { type: Boolean },
            hidden: { type: Boolean },
        };
    }

    get text() {
        return this.textContent.trim();
    }

    constructor() {
        super();

        /** @type {string} */
        this.label = '';
        /** @type {string} */
        this.value = '';
        /** @type {boolean} */
        this.selected = false;
        /** @type {boolean} */
        this.disabled = false;
        /** @type {boolean} */
        this.hidden = false;
    }
}
