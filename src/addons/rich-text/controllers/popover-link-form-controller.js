import { html, nothing } from 'lit';
import { generateUniqueId } from '../../../modules/unique-id-generator.js';
import PopoverFormBaseController from './popover-form-base-controller.js';
import UrlBoxController from './url-box-controller.js';
import TextBoxController from './text-box-controller.js';
import CheckBoxController from './check-box-controller.js';
import RichTextEditorLink from '../models/RichTextEditorLink.js';

export default class PopoverLinkFormController extends PopoverFormBaseController {
    #value = new RichTextEditorLink();
    #urlParentId = `rich-text-link-url-${generateUniqueId()}`;
    #textParentId = `rich-text-link-text-${generateUniqueId()}`;
    #checkParentId = `rich-text-link-blank-${generateUniqueId()}`;

    /**
     * @param {ConstructorParameters<typeof PopoverFormBaseController>[0]} host
     * @param {ConstructorParameters<typeof PopoverFormBaseController>[1]} [options]
     */
    constructor(host, options = {}) {
        super(host, options);

        this.urlInput = new UrlBoxController(host, {
            componentName: 'rich-text-link-url',
            parentElement: `[id="${this.#urlParentId}"]`,
            allowedProtocols: 'http: https: mailto: tel:',
            allowRelative: true,
        });
        this.urlInput.required = true;
        this.textInput = new TextBoxController(host, {
            componentName: 'rich-text-link-text',
            parentElement: `[id="${this.#textParentId}"]`,
        });
        this.textInput.maxlength = 500;
        this.textInput.autocomplete = 'off';
        this.textInput.spellcheck = true;
        this.checkInput = new CheckBoxController(host, {
            componentName: 'rich-text-link-blank',
            parentElement: `[id="${this.#checkParentId}"]`,
            description: this.localeMessages.openLinkInNewTabLabel,
        });
        this.checkInput.checkedValue = true;
        this.checkInput.uncheckedValue = false;

        this.urlInput.addEventListener('input', () => {
            this.#value.url = this.urlInput.value;
            this.requestUpdate();
        });
        this.textInput.addEventListener('input', () => {
            this.#value.text = this.textInput.value;
            this.requestUpdate();
        });
        this.checkInput.addEventListener('input', () => {
            this.#value.blank = this.checkInput.checked;
            this.requestUpdate();
        });
        this.urlInput.addEventListener('validate', () => this.requestUpdate());
        this.textInput.addEventListener('validate', () => this.requestUpdate());
    }

    /** @override @returns {RichTextEditorLink} */
    get value() {
        return this.#value;
    }

    /** @param {RichTextEditorLink} value */
    set value(value) {
        this.#value = value;
        this.urlInput.value = value.url;
        this.textInput.value = value.text;
        this.checkInput.checked = value.blank;
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
            this.checkInput.reset();
        }
        this.checkInput.indeterminate = false;
        this.value = new RichTextEditorLink();
    }

    #onCancel = (/** @type {MouseEvent} */ event) => {
        this.reset();
        this.dispatchCustomEvent('cancel', event);
    };

    #onRemove = (/** @type {MouseEvent} */ event) => {
        this.reset();
        this.dispatchCustomEvent('remove', event);
    };

    /** @returns {import('lit').TemplateResult | typeof nothing} */
    renderRemoveButton() {
        return this.value.isActive ? html`<button type="button" @click=${this.#onRemove}>${this.localeMessages.removeLinkButtonLabel}</button>` : nothing;
    }

    /** @override */
    renderFormContent() {
        this.urlInput.label = this.localeMessages.linkUrlLabel;
        this.textInput.label = this.localeMessages.linkTextLabel;
        this.textInput.placeholder = this.localeMessages.linkTextPlaceholder;
        this.checkInput.label = this.localeMessages.openLinkInNewTabLabel;
        this.checkInput.options.description = this.localeMessages.openLinkInNewTabLabel;

        return html`
            <div id=${this.#urlParentId}>${this.urlInput.renderTemplate()}</div>
            <div id=${this.#textParentId} ?hidden=${this.value.isBlock}>${this.textInput.renderTemplate()}</div>
            <div id=${this.#checkParentId}>${this.checkInput.renderTemplate()}</div>
            <div>
                ${this.renderRemoveButton()}
                <button type="button" @click=${this.#onCancel}>${this.cancelButtonLabel}</button>
                <button type="submit">${this.saveButtonLabel}</button>
            </div>
        `;
    }
}
