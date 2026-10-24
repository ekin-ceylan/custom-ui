import { html, nothing } from 'lit';
import { generateUniqueId } from '../../../modules/unique-id-generator.js';
import PopoverFormBaseController from './popover-form-base-controller.js';
import CheckBoxController from './check-box-controller.js';
import RichTextEditorLink from '../models/RichTextEditorLink.js';

export default class PopoverLinkFormController extends PopoverFormBaseController {
    #value = new RichTextEditorLink();
    #checkParentId = `rich-text-link-blank-${generateUniqueId()}`;

    /**
     * @param {ConstructorParameters<typeof PopoverFormBaseController>[0]} host
     * @param {ConstructorParameters<typeof PopoverFormBaseController>[1]} [options]
     */
    constructor(host, options = {}) {
        super(host, options, {
            urlName: 'rich-text-link-url',
            textName: 'rich-text-link-text',
            allowedProtocols: 'http: https: mailto: tel:',
        });
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
    reset() {
        super.reset();
        if (this.formElement) {
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
            <div id=${this.urlParentId} data-role="link-url">${this.urlInput.renderTemplate()}</div>
            <div id=${this.textParentId} data-role="link-text" ?hidden=${this.value.isBlock}>${this.textInput.renderTemplate()}</div>
            <div id=${this.#checkParentId} data-role="link-blank">${this.checkInput.renderTemplate()}</div>
            <div>
                ${this.renderRemoveButton()}
                <button type="button" @click=${this.#onCancel}>${this.cancelButtonLabel}</button>
                <button type="submit">${this.saveButtonLabel}</button>
            </div>
        `;
    }
}
