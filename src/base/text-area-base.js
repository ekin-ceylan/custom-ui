import { html, nothing } from 'lit';
import StandardControlBase from '../base/standard-control-base.js';
import SlotCollectorMixin from '../mixins/slot-collector-mixin.js';
import { mixins } from '../modules/mixin-utils.js';
import { isEmpty } from '../modules/utilities.js';

/**
 * Base class for text area components. Provides common functionality for multi-line text input components.
 * - Extends `StandardControlBase` and mixes in `SlotCollectorMixin`.
 * - Handles properties like `maxlength`, `minlength`, `rows`, `cols`, and `wrap`.
 * - Provides methods for validation, rendering adornments, counters, and descriptions.
 * @abstract Not intended to be used directly in component definitions (for example, with customElements.define). Extend this class to create concrete components.
 * @mixes SlotCollectorMixin
 * @category base
 */
export default class TextAreaBase extends mixins(StandardControlBase, SlotCollectorMixin) {
    // #region STATICS, FIELDS, GETTERS

    static get properties() {
        return {
            ...super.properties,
            showCounter: { type: Boolean, reflect: true, attribute: 'show-counter' },
            description: { type: Object, attribute: false },
            maxlength: { type: Number },
            minlength: { type: Number },
            // rows: { type: Number, reflect: true },
            // cols: { type: Number, reflect: true },
            // wrap: { type: String, reflect: true },
        };
    }

    #slotContent = '';
    #cachedInput = undefined;

    get resetValue() {
        return this.getAttribute('value') || this.#slotContent || '';
    }

    /**
     * Returns the reference to the native input element within the component. Caches the reference after the first query for performance optimization.
     * @returns {HTMLTextAreaElement | null}
     */
    get inputElement() {
        if (this.#cachedInput === undefined) {
            this.#cachedInput = this.renderRoot?.querySelector('textarea');
        }

        return this.#cachedInput;
    }

    /**
     * The text to be displayed in the character counter, based on the current value length and the maxlength attribute.
     * By default, if maxlength is set, it shows the remaining characters; otherwise, it shows the current length.
     * It can be overridden by subclasses to provide custom counter text logic.
     * @returns {string}
     */
    get counterText() {
        const valueLength = this.value?.length ?? 0;
        const counter = this.maxlength > 0 ? this.maxlength - valueLength : valueLength;

        return `${counter}`;
    }

    get descriptionId() {
        return `${this.componentName}-description-${this.uniqueId}`;
    }

    /**
     * Returns the validation message for the minlength constraint.
     * @returns {string}
     */
    get minLengthValidationMessage() {
        return this.localeMessages.minlength(this.label, this.minlength);
    }

    /**
     * Returns the validation message for the maxlength constraint.
     * @returns {string}
     */
    get maxLengthValidationMessage() {
        return this.localeMessages.maxlength(this.label, this.maxlength);
    }

    // #endregion STATICS, FIELDS, GETTERS

    constructor() {
        super();

        /** @type {boolean} Whether the character counter is shown when maxlength is set */
        this.showCounter = false;
        /** @type {string | HTMLElement | Text | undefined} The description text or HTML element for the textarea */
        this.description = undefined;
        /** @type {number | undefined} The maximum length of the input value */
        this.maxlength = undefined;
        /** @type {number | undefined} The minimum length of the input value */
        this.minlength = undefined;
    }

    // #region INTERNAL HOOKS

    /**
     * @param {HTMLElement|Text} node
     * @param {string} slotName
     * @returns {boolean}
     * @override
     */
    validateNode(node, slotName) {
        if (slotName === 'default') {
            return this.#validateDefaultNode(node);
        }
        if (slotName === 'description') {
            return this.#validateDescriptionNode(node);
        }
        return true;
    }

    afterSlotsBinded(hasProjectedContent) {
        if (hasProjectedContent && isEmpty(this.value)) {
            this.value = this.#slotContent;
        }
    }

    /** @override @protected */
    setupFirstInteraction() {
        // programatik atama etkiler mi native ile dene
        this.inputElement?.addEventListener('input', _e => this.dispatchCustomEvent('first-interaction'), { once: true });
    }

    /** @override */
    validate(value) {
        if (this.required && !value) return this.requiredValidationMessage;
        if (value?.length > 0 && value?.length < this.minlength) return this.minLengthValidationMessage;
        if (value?.length > this.maxlength) return this.maxLengthValidationMessage;

        return '';
    }

    // #endregion INTERNAL HOOKS

    // #region PRIVATE METHODS

    /**
     * Validates the content of a default slot node and updates the internal slot content accordingly.
     * @param {HTMLElement|Text} node The node to validate.
     * @returns {boolean}
     */
    #validateDefaultNode(node) {
        if (!isEmpty(this.value)) {
            console.warn('Value is already set via property. Ignoring slotted nodes.');
            return false;
        }

        if (node.nodeType === Node.TEXT_NODE) {
            this.#slotContent += node.textContent.trim() ?? '';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            this.#slotContent += /** @type {HTMLElement} */ (node).outerHTML ?? '';
        }

        return false;
    }

    /**
     * Validates the content of a description slot node and updates the internal description accordingly.
     * @param {HTMLElement|Text} node The node to validate.
     * @returns {boolean}
     */
    #validateDescriptionNode(node) {
        this.description = node;
        return false;
    }

    // #endregion PRIVATE METHODS

    // #region RENDER HOOKS

    /**
     * Renders the adornment element for the textarea.
     * By default, it returns `nothing`, but can be overridden by subclasses to provide custom adornment rendering logic.
     *
     * @example
     * renderAdornment() {
     *     return html`<span class="adornment">%</span>`;
     * }
     * @protected
     * @category rendering
     * @return {import('lit').TemplateResult | typeof nothing}
     */
    renderAdornment() {
        return nothing;
    }

    /**
     * Renders the counter element for the textarea.
     * It can be overridden by subclasses to provide custom counter rendering logic.
     * @protected
     * @category rendering
     * @return {import('lit').TemplateResult | typeof nothing}
     */
    renderCounter() {
        if (!this.showCounter) return nothing;
        return html`<span data-role="counter" aria-live="polite">${this.counterText}</span>`;
    }

    /**
     * Renders the description element for the textarea.
     * It can be overridden by subclasses to provide custom description rendering logic.
     * @protected
     * @category rendering
     * @return {import('lit').TemplateResult | typeof nothing}
     */
    renderDescription() {
        if (!this.description) return nothing;
        return html`<div data-role="description" id=${this.descriptionId}>${this.description}</div>`;
    }

    // #endregion RENDER HOOKS
}
