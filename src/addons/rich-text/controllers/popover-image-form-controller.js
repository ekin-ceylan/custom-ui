import { html } from 'lit';
import { generateUniqueId } from '../../../modules/unique-id-generator.js';
import PopoverFormBaseController from './popover-form-base-controller.js';
import UrlBoxController from './url-box-controller.js';
import TextBoxController from './text-box-controller.js';
import RichTextImage from '../models/RichTextImage.js';

export default class PopoverImageFormController extends PopoverFormBaseController {
    #value = new RichTextImage();
    #urlParentId = `rich-text-image-url-${generateUniqueId()}`;
    #textParentId = `rich-text-image-alt-${generateUniqueId()}`;

    /**
     * @param {ConstructorParameters<typeof PopoverFormBaseController>[0]} host
     * @param {ConstructorParameters<typeof PopoverFormBaseController>[1]} [options]
     */
    constructor(host, options = {}) {
        super(host, options);

        this.urlInput = new UrlBoxController(host, {
            componentName: 'rich-text-image-url',
            parentElement: `[id="${this.#urlParentId}"]`,
            allowedProtocols: 'http: https:',
            allowRelative: true,
        });
        this.urlInput.required = true;
        this.textInput = new TextBoxController(host, {
            componentName: 'rich-text-image-alt',
            parentElement: `[id="${this.#textParentId}"]`,
        });
        this.textInput.maxlength = 500;
        this.textInput.autocomplete = 'off';
        this.textInput.spellcheck = true;

        this.urlInput.addEventListener('input', () => {
            this.#value.url = this.urlInput.value;
            this.requestUpdate();
        });
        this.textInput.addEventListener('input', () => {
            this.#value.alt = this.textInput.value;
            this.requestUpdate();
        });
        this.urlInput.addEventListener('validate', () => this.requestUpdate());
        this.textInput.addEventListener('validate', () => this.requestUpdate());
    }

    /** @override @returns {RichTextImage} */
    get value() {
        return this.#value;
    }

    /** @param {RichTextImage} value */
    set value(value) {
        this.#value = value;
        this.urlInput.value = value.url;
        this.textInput.value = value.alt;
        this.requestUpdate();
    }

    /** @override */
    checkValidity() {
        const urlValid = this.urlInput.checkValidity();
        const textValid = this.textInput.checkValidity();
        if (!urlValid || !textValid) {
            (urlValid ? this.textInput : this.urlInput).inputElement.reportValidity();
        }
        return urlValid && textValid;
    }

    /** @override */
    reset() {
        if (this.formElement) {
            this.urlInput.reset();
            this.textInput.reset();
        }
        this.value = new RichTextImage();
    }

    #onCancel = (/** @type {MouseEvent} */ event) => {
        this.reset();
        this.dispatchCustomEvent('cancel', event);
    };

    /** @override */
    renderFormContent() {
        this.urlInput.label = this.localeMessages.imageUrlLabel;
        this.textInput.label = this.localeMessages.imageAltLabel;
        this.textInput.placeholder = this.localeMessages.imageAltPlaceholder;

        return html`
            <div id=${this.#urlParentId}>${this.urlInput.renderTemplate()}</div>
            <div id=${this.#textParentId}>${this.textInput.renderTemplate()}</div>
            <div>
                <button type="button" @click=${this.#onCancel}>${this.cancelButtonLabel}</button>
                <button type="submit">${this.saveButtonLabel}</button>
            </div>
        `;
    }
}
