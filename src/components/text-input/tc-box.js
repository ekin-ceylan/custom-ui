import { checkTcNo } from '../../modules/utilities.js';
import TextControlBase from '../../base/text-control-base.js';
import InputMaskMixin from '../../mixins/input-mask-mixin.js';
import { mixins } from '../../modules/mixin-utils.js';
import { html } from 'lit';

/** @extends TextControlBase */
export default class TcBox extends mixins(TextControlBase, InputMaskMixin) {
    static get properties() {
        return {
            ...super.properties,
            autocomplete: { type: String },
        };
    }

    #digits = 11;

    constructor() {
        super();

        this.inputmode = 'numeric';
        this.minlength = this.#digits;
        this.maxlength = this.#digits;
        this.allowPattern = `[0-9]{1,${this.#digits}}`;
        this.pattern = String.raw`\d{${this.#digits}}`;
        this.placeholder = '_'.repeat(this.#digits);
        this.inputMask = '_'.repeat(this.#digits);
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
        return html`${superContent}${this.renderInputMask()}`;
    }
}
