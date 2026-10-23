import { ControllerBase } from 'custom-ui';
import { html } from 'lit';
import { generateUniqueId } from '../../../modules/unique-id-generator.js';

export default class PopoverFormBaseController extends ControllerBase {
    #formId = `rich-text-popover-form-${generateUniqueId()}`;

    /**
     * @param {ConstructorParameters<typeof ControllerBase>[0]} host
     * @param {ConstructorParameters<typeof ControllerBase>[1]} [options]
     */
    constructor(host, options = {}) {
        super(host, options);

        /** @type {string} Default label for the cancel button in the popover form */
        this.cancelButtonLabel = this.localeMessages.cancelButtonLabel;
        /** @type {string} Default label for the save button in the popover form */
        this.saveButtonLabel = this.localeMessages.saveButtonLabel;
    }

    /** @returns {HTMLFormElement | null} */
    get formElement() {
        return this.host.querySelector(`form[id="${this.#formId}"]`);
    }

    /** @param {SubmitEvent} event */
    onSubmit = event => {
        event.preventDefault();
        event.stopPropagation();
        if (this.checkValidity()) this.dispatchCustomEvent('submit', event, { value: this.value });
    };

    checkValidity() {
        const form = this.formElement;
        if (!form) throw new Error(`[${this.componentName}]: Form must be rendered before validation.`);
        return form.reportValidity();
    }

    /** @returns {object} */
    get value() {
        throw new Error(`[${this.componentName}]: 'value' getter MUST be overridden.`);
    }

    reset() {
        const form = this.formElement;
        if (!form) throw new Error(`[${this.componentName}]: Form must be rendered before reset.`);
        form.reset();
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
        const openAbove = spaceAbove > spaceBelow;
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
        return html`<form id=${this.#formId} popover="auto" @submit=${this.onSubmit}>${this.renderFormContent()}</form>`;
    }
}
