import StandardControlBase from './standard-control-base.js';
import TextControlMixin from '../core/text-control-mixin.js';
import { mixins } from '../modules/mixin-utils.js';

/**
 * Base class for text-based input components, providing common functionality for masking, unmasking, validation, and event handling.
 * - Provides `mask()` and `unmask()` methods for formatting input values.
 * - Provides `validateLastChar()` for character-level validation based on an allow-pattern regex.
 * - Provides `replaceCaret()` for calculating caret position after formatting.
 *
 * **Promotable Properties**
 *
 * The following fields are set as plain (non-reactive) values in this base class and wired into
 * the render template. Concrete subclasses may promote any of them to **Lit reactive properties**
 * by declaring them in `static get properties()`.
 *
 * Subclasses that want to **seal** a property (fix its value, disallow attribute binding) should
 * simply not include it in `static get properties()` and set the desired value in the constructor.
 *
 * **Promotable fields:** `type: string`, `inputmode: string`, `pattern: string`, `allowPattern: string`,
 * `maxlength: number`, `minlength: number`, `max: number`, `min: number`,
 * `autounmask: boolean`, `autocomplete: string`, `spellcheck: boolean`.
 *
 * Attribute mapping is intentionally left to concrete subclasses. Each subclass decides whether a
 * promoted property should reflect to an attribute and, if so, which attribute name it uses.
 *
 * @abstract Not intended to be used directly in component definitions (for example, with customElements.define). Extend this class to create concrete components.
 */
export default class TextControlBase extends mixins(StandardControlBase, TextControlMixin) {
    #cachedInput = undefined;

    /**
     * Returns the reference to the native input element within the component. Caches the reference after the first query for performance optimization.
     * @returns {HTMLInputElement | null}
     */
    get inputElement() {
        if (this.#cachedInput == undefined) {
            this.#cachedInput = this.renderRoot?.querySelector('input');
        }

        return this.#cachedInput;
    }

    // #region LIFECYCLE

    /**
     * @param {import('lit').PropertyValues} changedProperties Map of changed properties with old values
     * @protected
     * @override
     * - Calls `super.firstUpdated()` to ensure proper Lit lifecycle.
     * - Sets up a listener for the form's `formdata` event to handle form data submission.
     * - Calls `#createRegexPatterns()` to compile regex patterns for validation and character filtering.
     */
    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);
        this.inputElement?.form?.addEventListener('formdata', this.#handleFormData.bind(this));
        this.onTextControlFirstUpdate();
    }

    /**
     * @param {import('lit').PropertyValues} changedProperties Map of changed properties with old values
     * @protected
     * @override
     * - Calls `super.willUpdate()` to ensure proper Lit lifecycle.
     * - If the `value` property has changed, it updates the masked and unmasked values accordingly, and applies masking if `autounmask` is not enabled.
     */
    willUpdate(changedProperties) {
        super.willUpdate(changedProperties);

        if (changedProperties.has('value')) {
            this.onBeforeValueUpdate();
        }
    }

    /**
     * @param {import('lit').PropertyValues} changedProperties Map of changed properties with old values
     * @protected
     * @override
     * - Calls `super.updated()` to ensure proper Lit lifecycle.
     * - If the `allowPattern` or `pattern` properties have changed, it recompiles the regex patterns used for validation and character filtering.
     */
    updated(changedProperties) {
        super.updated(changedProperties);

        // Recompile patterns when they change at runtime (attribute or property update).
        if (changedProperties.has('allowPattern') || changedProperties.has('pattern')) {
            this.onAllowPatternUpdate();
        }
    }

    // #endregion LIFECYCLE

    // #region EVENT HANDLERS

    /**
     * If `autounmask` is enabled, handles the formdata event for the input element by setting the unmasked value.
     * @param {FormDataEvent} event - The formdata event triggered on the input element.
     */
    #handleFormData(event) {
        const inputName = this.inputElement?.name;

        if (!inputName || !this.autounmask) return;
        if (event.formData.get(inputName) === undefined) return;

        event.formData.set(inputName, this.unmaskedValue);
    }

    // #endregion EVENT HANDLERS
}
