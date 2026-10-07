import { html, nothing } from 'lit';
import { LightComponentBase, TextControlBase, defineComponent, CheckBox } from 'custom-ui';
import RichTextImage from './models/RichTextImage.js';
import RichTextEditorLink from './models/RichTextEditorLink.js';

/** @extends {LightComponentBase} */
class RichTextPopoverFormBase extends LightComponentBase {
    static get properties() {
        return {
            ...super.properties,
            value: { type: Object, state: true },
        };
    }

    /** Default label for the cancel button in the popover form */
    get cancelButtonLabel() {
        return this.localeMessages.cancelButtonLabel;
    }
    /** Default label for the save button in the popover form */
    get saveButtonLabel() {
        return this.localeMessages.saveButtonLabel;
    }
    /** Default label for the image URL input in the popover form */
    get imageUrlLabel() {
        return this.localeMessages.imageUrlLabel;
    }
    /** Default label for the image alt input in the popover form */
    get imageAltLabel() {
        return this.localeMessages.imageAltLabel;
    }
    /** Default placeholder for the image alt input in the popover form */
    get imageAltPlaceholder() {
        return this.localeMessages.imageAltPlaceholder;
    }
    /** Default label for the remove link button in the popover form */
    get removeLinkButtonLabel() {
        return this.localeMessages.removeLinkButtonLabel;
    }
    /** Default label for the open link in new tab checkbox in the popover form */
    get openLinkInNewTabLabel() {
        return this.localeMessages.openLinkInNewTabLabel;
    }
    /** Default label for the link URL input in the popover form */
    get linkUrlLabel() {
        return this.localeMessages.linkUrlLabel;
    }
    /** Default label for the open link in new tab checkbox in the popover form */
    get linkTextLabel() {
        return this.localeMessages.linkTextLabel;
    }
    /** Default placeholder for the link text input in the popover form */
    get linkTextPlaceholder() {
        return this.localeMessages.linkTextPlaceholder;
    }

    /**
     * @returns {RichTextPopoverUrlBox}
     * @protected
     */
    get urlInput() {
        return this.renderRoot.querySelector('rtp-url-box');
    }
    /**
     * @returns {RichTextPopoverTextBox}
     * @protected
     */
    get textInput() {
        return this.renderRoot.querySelector('rtp-text-box');
    }

    /**
     * @returns {HTMLFormElement}
     * @protected
     */
    get formElement() {
        return this.renderRoot.querySelector('form');
    }

    /**
     * @param {SubmitEvent} event
     * @protected
     */
    onSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        this.dispatchCustomEvent('submit');
    }

    reset() {
        this.formElement?.reset();
    }
}

/** @extends {TextControlBase} */
class RichTextPopoverUrlBox extends TextControlBase {
    static get properties() {
        return {
            ...super.properties,
            allowedProtocols: { type: String, attribute: 'allowed-protocols' },
            allowRelative: { type: Boolean, attribute: 'allow-relative' },
            pattern: { type: String, attribute: false },
            allowPattern: { type: String, attribute: false },
        };
    }

    constructor() {
        super();

        this.allowedProtocols = 'http: https:';
        this.allowRelative = false;
        this.placeholder = 'https://...';
        this.pattern = createUrlPattern(this.allowedProtocols, this.allowRelative);
        this.maxlength = 500;
        this.autocomplete = 'off';
        this.spellcheck = false;
        this.allowPattern = String.raw`\S+`;
    }

    willUpdate(changedProperties) {
        if (changedProperties.has('allowedProtocols') || changedProperties.has('allowRelative')) {
            this.pattern = createUrlPattern(this.allowedProtocols, this.allowRelative);
        }

        super.willUpdate(changedProperties);
    }
}

class RichTextPopoverTextBox extends TextControlBase {
    constructor() {
        super();

        this.maxlength = 500;
        this.autocomplete = 'off';
        this.spellcheck = true;
    }
}

/** @extends {CheckBox} */
class RichTextPopoverCheckbox extends CheckBox {
    constructor() {
        super();

        this.checkedValue = true;
        this.uncheckedValue = false;
    }
}

/**
 * Creates a URL pattern based on allowed protocols and relative URL allowance.
 * @param {string} allowedProtocols
 * @param {boolean} allowRelative
 * @returns {string}
 */
function createUrlPattern(allowedProtocols, allowRelative) {
    const protocols = new Set(allowedProtocols.trim().toLowerCase().split(/\s+/).filter(Boolean));
    const alternatives = [];

    if (protocols.has('http:')) alternatives.push(String.raw`http:\/\/[^\s]+`);
    if (protocols.has('https:')) alternatives.push(String.raw`https:\/\/[^\s]+`);
    if (protocols.has('mailto:')) alternatives.push(String.raw`mailto:[^\s@]+@[^\s@]+\.[^\s@]+`);
    if (protocols.has('tel:')) alternatives.push(String.raw`tel:\+?(?:[0-9]|\(|\)|\.|-)+`);
    if (protocols.has('http:') || protocols.has('https:')) {
        alternatives.push(String.raw`(?:(?:[a-zA-Z0-9]|-)+\.)+[a-zA-Z]{2,}(?:(?:\/|\?|#)[^\s]*)?`);
    }
    if (allowRelative) {
        alternatives.push(String.raw`(?:\/(?!\/)|\.\.?\/|\?|#)[^\s]*`);
    }

    return alternatives.length > 0 ? `^(?:${alternatives.join('|')})$` : '(?!)';
}

export class RichTextImageForm extends RichTextPopoverFormBase {
    constructor() {
        super();

        /** @type {RichTextImage} */
        this.value = new RichTextImage();
    }

    updated(changedProperties) {
        super.updated(changedProperties);

        if (changedProperties.has('value')) {
            this.urlInput.value = this.value.url;
            this.textInput.value = this.value.alt;
        }
    }

    #onCancel() {
        this.value = new RichTextImage();
        this.dispatchCustomEvent('cancel');
    }

    render() {
        const onInputUrl = event => (this.value.url = event.target.value);
        const onInputAlt = event => (this.value.alt = event.target.value);

        return html`
            <form @submit=${this.onSubmit}>
                <rtp-url-box label=${this.imageUrlLabel} allowed-protocols="http: https:" allow-relative @input=${onInputUrl} required></rtp-url-box>
                <rtp-text-box label=${this.imageAltLabel} placeholder=${this.imageAltPlaceholder} @input=${onInputAlt}></rtp-text-box>

                <div>
                    <button type="button" @click=${this.#onCancel}>${this.cancelButtonLabel}</button>
                    <button type="submit">${this.saveButtonLabel}</button>
                </div>
            </form>
        `;
    }
}

export class RichTextLinkForm extends RichTextPopoverFormBase {
    constructor() {
        super();

        /** @type {RichTextEditorLink} */
        this.value = new RichTextEditorLink();
    }

    /**
     * @returns {RichTextPopoverCheckbox}
     * @protected
     */
    get checkInput() {
        return this.renderRoot.querySelector('rtp-checkbox');
    }

    updated(changedProperties) {
        super.updated(changedProperties);

        if (changedProperties.has('value')) {
            this.urlInput.value = this.value.url;
            this.textInput.value = this.value.text;
            this.checkInput.checked = this.value.blank;
        }
    }

    #onCancel(event) {
        this.value = new RichTextEditorLink();
        this.dispatchCustomEvent('cancel');
    }

    #removeLink() {
        this.value = new RichTextEditorLink(); // Reset the value
        this.dispatchCustomEvent('remove');
    }

    /** @returns {import('lit').TemplateResult | typeof nothing} */
    renderRemoveButton() {
        if (this.value.isActive) {
            return html`<button type="button" @click=${this.#removeLink}>${this.removeLinkButtonLabel}</button>`;
        }
        return nothing;
    }

    render() {
        const onInputUrl = event => (this.value.url = event.target.value);
        const onInputText = event => (this.value.text = event.target.value);
        const onInputBlank = event => (this.value.blank = event.target.checked);

        return html`
            <form @submit=${this.onSubmit}>
                <rtp-url-box label=${this.linkUrlLabel} allowed-protocols="http: https: mailto: tel:" allow-relative @input=${onInputUrl} required></rtp-url-box>
                <rtp-text-box label=${this.linkTextLabel} placeholder=${this.linkTextPlaceholder} @input=${onInputText} ?hidden=${this.value.isBlock}></rtp-text-box>
                <rtp-checkbox label=${this.openLinkInNewTabLabel} @change=${onInputBlank}>${this.openLinkInNewTabLabel}</rtp-checkbox>

                <div>
                    ${this.renderRemoveButton()}
                    <button type="button" @click=${this.#onCancel}>${this.cancelButtonLabel}</button>
                    <button type="submit">${this.saveButtonLabel}</button>
                </div>
            </form>
        `;
    }
}

defineComponent('rtp-checkbox', RichTextPopoverCheckbox);
defineComponent('rtp-url-box', RichTextPopoverUrlBox);
defineComponent('rtp-text-box', RichTextPopoverTextBox);
