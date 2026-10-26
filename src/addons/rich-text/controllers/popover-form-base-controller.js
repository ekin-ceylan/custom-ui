import { ControllerBase, lockAllScrolls, unlockAllScrolls, generateUniqueId } from 'custom-ui';
import { html } from 'lit';
import UrlBoxController from './url-box-controller.js';
import TextBoxController from './text-box-controller.js';

/** Common popover and URL/text control lifecycle for rich-text forms. */
export default class PopoverFormBaseController extends ControllerBase {
    #formId = `rich-text-popover-form-${generateUniqueId()}`;

    /**
     * @param {ConstructorParameters<typeof ControllerBase>[0]} host
     * @param {ConstructorParameters<typeof ControllerBase>[1]} options
     * @param {{ urlName: string; textName: string; allowedProtocols: string }} controls
     */
    constructor(host, options, { urlName, textName, allowedProtocols }) {
        super(host, options);

        /** @protected */
        this.urlParentId = `${urlName}-${generateUniqueId()}`;
        /** @protected */
        this.textParentId = `${textName}-${generateUniqueId()}`;
        this.urlInput = new UrlBoxController(host, {
            componentName: urlName,
            parentElement: `[id="${this.urlParentId}"]`,
            allowedProtocols,
            allowRelative: true,
        });
        this.urlInput.required = true;
        this.textInput = new TextBoxController(host, {
            componentName: textName,
            parentElement: `[id="${this.textParentId}"]`,
        });
        this.textInput.maxlength = 500;
        this.textInput.autocomplete = 'off';
        this.textInput.spellcheck = true;

        this.urlInput.addEventListener('validate', () => this.requestUpdate());
        this.textInput.addEventListener('validate', () => this.requestUpdate());
    }

    /** @returns {HTMLFormElement | null} */
    get formElement() {
        return this.host.querySelector(`form[id="${this.#formId}"]`);
    }

    /** Default label for the cancel button in the popover form */
    get cancelButtonLabel() {
        return this.localeMessages.cancelButtonLabel;
    }
    /** Default label for the save button in the popover form */
    get saveButtonLabel() {
        return this.localeMessages.saveButtonLabel;
    }

    /** @param {SubmitEvent} event */
    onSubmit = event => {
        event.preventDefault();
        event.stopPropagation();
        if (this.checkValidity()) this.dispatchCustomEvent('submit', event, { value: this.value });
    };

    /** @param {ToggleEvent} event */
    onToggle = event => {
        if (event.newState === 'closed') {
            unlockAllScrolls(this.formElement);
        }
        this.dispatchCustomEvent('toggle', event);
    };

    hostDisconnected() {
        const form = this.formElement;
        if (form) unlockAllScrolls(form);
    }

    /**
     * Opens and positions the rendered popover, locking background scroll until
     * native dismissal or host disconnection. Await host rendering before calling.
     * @param {{ top: number; bottom: number; left: number }} coords
     */
    showPopover(coords) {
        const form = this.formElement;

        if (!form) {
            throw new Error(`[${this.componentName}]: Form must be rendered before opening.`);
        }

        form.showPopover();
        lockAllScrolls(form, () => this.hidePopover());
        this.positionPopover(coords);
    }

    hidePopover() {
        const form = this.formElement;
        if (!form) throw new Error(`[${this.componentName}]: Form must be rendered before closing.`);
        form.hidePopover();
    }

    checkValidity() {
        const urlValid = this.urlInput.checkValidity();
        const textValid = this.textInput.checkValidity();

        if (!urlValid || !textValid) {
            (urlValid ? this.textInput : this.urlInput).inputElement.reportValidity();
        }

        return urlValid && textValid;
    }

    /** @returns {object} */
    get value() {
        throw new Error(`[${this.componentName}]: 'value' getter MUST be overridden.`);
    }

    reset() {
        if (this.formElement) {
            this.urlInput.reset();
            this.textInput.reset();
        }
    }

    /**
     * Positions the open popover using viewport-relative anchor coordinates.
     * Call after rendering and showing the popover so its dimensions are available.
     * @param {{ top: number; bottom: number; left: number }} coords
     */
    positionPopover(coords) {
        const popover = this.formElement;
        if (!popover) throw new Error(`[${this.componentName}]: Form must be rendered before positioning.`);

        const gap = 10;
        const viewportPadding = 20;

        popover.style.margin = '0';
        popover.style.right = 'auto';
        popover.style.bottom = 'auto';
        popover.style.maxHeight = `${window.innerHeight - viewportPadding * 2}px`;
        popover.style.overflowY = 'auto';

        const popoverRect = popover.getBoundingClientRect();
        const spaceAbove = coords.top - viewportPadding - gap;
        const spaceBelow = window.innerHeight - coords.bottom - viewportPadding - gap;

        const openAbove = spaceBelow < popoverRect.height && spaceAbove > spaceBelow;
        const preferredTop = openAbove ? coords.top - gap - popoverRect.height : coords.bottom + gap;
        const maxTop = window.innerHeight - popoverRect.height - viewportPadding;
        const maxLeft = window.innerWidth - popoverRect.width - viewportPadding;

        popover.style.top = `${Math.max(viewportPadding, Math.min(preferredTop, maxTop))}px`;
        popover.style.left = `${Math.max(viewportPadding, Math.min(coords.left, maxLeft))}px`;
        popover.dataset.placement = openAbove ? 'top' : 'bottom';
    }

    /** @returns {import('lit').TemplateResult} */
    renderFormContent() {
        throw new Error(`[${this.componentName}]: 'renderFormContent' MUST be overridden.`);
    }

    renderTemplate() {
        return html`<form id=${this.#formId} data-role=${this.componentName} popover="auto" @submit=${this.onSubmit} @toggle=${this.onToggle}>${this.renderFormContent()}</form>`;
    }
}
