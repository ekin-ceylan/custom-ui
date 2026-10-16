import { mixins } from '../modules/mixin-utils.js';
import LightComponentBase from './light-component-base.js';
import FormControlMixin from '../core/form-control-mixin.js';

const MixedBase = /** @type {typeof LightComponentBase & {
 * new <TValue extends string | boolean | number = string>(...args: any[]):
 * LightComponentBase & import('../core/types').FormControl<TValue>
 * }} */ (mixins(LightComponentBase, FormControlMixin));

/**
 * Base class for form control components providing common functionality for form inputs and selects.
 *
 * IMPLEMENTATION REQUIREMENTS:
 * * `get inputElement()`: MUST be overridden to return the native DOM element (e.g., using `@query('input')`).
 * * `setupFirstInteraction()`: MUST be overridden to define how the component detects user interaction and dispatches the 'first-interaction' event.
 * * `label`: The `label` property is inherently required by this base class and must be provided by the consumer.
 * @template {string | boolean | number}  [TValue=string]
 * @extends {MixedBase<TValue>}
 * @abstract Not intended to be used directly in component definitions (for example, with customElements.define). Extend this class to create concrete components.
 */
export default class FormControlBase extends MixedBase {
    // #region STATICS, FIELDS, GETTERS

    /** @type {import('lit').PropertyDeclarations} */
    static get properties() {
        return {
            ...super.properties,
            name: { type: String },
            value: { type: String },
            label: { type: String },
            ariaInvalid: { type: String, attribute: false, reflect: false },
            required: { type: Boolean, reflect: true },
            disabled: { type: Boolean, reflect: true },
            readonly: { type: Boolean, reflect: true },
        };
    }

    /**
     * This is used to reset the form control to its initial state when the form is reset.
     * Subclasses can override this getter to provide a different reset value if needed.
     * @returns {TValue}
     */
    get resetValue() {
        return /** @type {TValue} */ (this.getAttribute('value') || '');
    }

    /** @override */
    get requiredFields() {
        return [...super.requiredFields, 'label'];
    }

    // #endregion STATICS, FIELDS, GETTERS

    // #region LIFECYCLE HOOKS

    /**
     * @param {import('lit').PropertyValues} changedProperties Map of changed properties with old values
     * @protected
     * @override
     * - Calls `super.firstUpdated()` to ensure proper Lit lifecycle.
     * - Sets up a listener for the form's `reset` event to reset the component's value and validation state.
     * - Calls `setupFirstInteraction()` to set up the mechanism for detecting the user's first interaction with the component.
     */
    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);
        this.onFormControlFirstUpdate();
    }

    /**
     * @param {import('lit').PropertyValues} changedProperties Map of changed properties with old values
     * @protected
     * @override
     * - Calls `super.updated()` to ensure proper Lit lifecycle.
     * - Synchronizes the `value` property with the native input element's value when it changes.
     */
    updated(changedProperties) {
        super.updated(changedProperties);

        if (changedProperties.has('value') && this.valueUpdated()) {
            this.dispatchCustomEvent('update');
        }
    }

    // #endregion LIFECYCLE HOOKS
}

// reset davranışındaki bug'lar
// option selected üzerinden geliyorsa nasıl davranmalı
// çalışmayan caseleri yakalayan testler yazdır
