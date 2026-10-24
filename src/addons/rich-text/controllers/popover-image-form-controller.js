import { html } from 'lit';
import PopoverFormBaseController from './popover-form-base-controller.js';
import RichTextImage from '../models/RichTextImage.js';

export default class PopoverImageFormController extends PopoverFormBaseController {
    #value = new RichTextImage();

    /**
     * @param {ConstructorParameters<typeof PopoverFormBaseController>[0]} host
     * @param {ConstructorParameters<typeof PopoverFormBaseController>[1]} [options]
     */
    constructor(host, options = {}) {
        super(host, options, {
            urlName: 'rich-text-image-url',
            textName: 'rich-text-image-alt',
            allowedProtocols: 'http: https:',
        });

        this.urlInput.addEventListener('input', () => {
            this.#value.url = this.urlInput.value;
            this.requestUpdate();
        });
        this.textInput.addEventListener('input', () => {
            this.#value.alt = this.textInput.value;
            this.requestUpdate();
        });
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
    reset() {
        super.reset();
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
            <div id=${this.urlParentId} data-role="image-url">${this.urlInput.renderTemplate()}</div>
            <div id=${this.textParentId} data-role="image-text">${this.textInput.renderTemplate()}</div>
            <div>
                <button type="button" @click=${this.#onCancel}>${this.cancelButtonLabel}</button>
                <button type="submit">${this.saveButtonLabel}</button>
            </div>
        `;
    }
}
