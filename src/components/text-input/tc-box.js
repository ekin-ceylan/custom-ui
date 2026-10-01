import { checkTcNo } from '../../modules/utilities.js';
import TextControlBase from '../../base/text-control-base.js';
import { renderMaskPlaceholder } from '../../modules/mask-placeholder.js';
import { html } from 'lit';

/**
 * Turkish Identification Number Input Box Component
 * @extends {TextControlBase}
 */
export default class TcBox extends TextControlBase {
    static get properties() {
        return {
            ...super.properties,
            autocomplete: { type: String },
            maskPlaceholder: { type: String, attribute: 'mask-placeholder', noAccessor: true },
        };
    }

    #digits = 11;
    #maskPlaceholder;

    /**
     * Gets the mask placeholder for the phone input.
     * If a custom mask placeholder is set, it returns that value; otherwise, it falls back to the input's placeholder.
     * @returns {string}
     */
    get maskPlaceholder() {
        return this.#maskPlaceholder || this.placeholder;
    }
    set maskPlaceholder(value) {
        this.#maskPlaceholder = value;
    }

    constructor() {
        super();

        this.inputmode = 'numeric';
        this.minlength = this.#digits;
        this.maxlength = this.#digits;
        this.allowPattern = `[0-9]{1,${this.#digits}}`;
        this.pattern = String.raw`\d{${this.#digits}}`;
        this.placeholder = '_'.repeat(this.#digits);
    }

    isComplete() {
        return this.value.length === this.#digits;
    }

    validate(value) {
        const validationMessage = super.validate(value);

        if (validationMessage) {
            return validationMessage;
        }

        if (value && !checkTcNo(value)) {
            return this.patternValidationMessage || 'Geçersiz TC Kimlik Numarası';
        }
    }

    renderContainerContent() {
        const superContent = super.renderContainerContent();
        return html`${superContent}${renderMaskPlaceholder(this.maskedValue, this.maskPlaceholder)}`;
    }
}
