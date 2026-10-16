import WarningField from '../models/WarningField.js';
import { isEmpty } from '../modules/utilities.js';

/**
 * @typedef {import('lit').LitElement} LitElement
 */

/**
 * @template T
 * @typedef {import('./types').Constructor<T>} Constructor
 */

/**
 * @typedef {import('./types').PropValidator} PropValidator
 */

/**
 * Property validator mixin that provides a mechanism for validating required and warning fields in a component.
 * - Components can specify required fields by overriding the `requiredFields` getter, which should return an array of property names that must be set. If any of these fields are empty when the component is connected to the DOM, an error will be thrown.
 * - Components can specify warning fields by overriding the `warningFields` getter, which should return an array of configurations. Each configuration includes a list of fields and a message. If all fields in a configuration are empty or false, a console warning will be logged with the provided message.
 * - Validation runs when the component is connected to the DOM and also when properties are updated (only for relevant fields).
 * - **Constraint:** Can only be applied to classes extending `LitElement` (ensures LitElement APIs like `updateComplete` / `requestUpdate` exist).
 *
 * @template {Constructor<LitElement>} TBase
 * @param {TBase} Base - The base class to extend
 * @category mixins
 * @returns {TBase & Constructor<PropValidator>}
 */
export default function PropValidatorMixin(Base) {
    return class PropValidator extends Base {
        /**
         * Stable component identifier for logs/errors (minify-safe).
         * Falls back to `constructor.name` when not connected/upgraded.
         * @returns {string}
         */
        get componentName() {
            return this.localName || (this.tagName ? this.tagName.toLowerCase() : '') || this.constructor.name;
        }

        /**
         * Gets the list of required field names.
         * Subclasses should override this to specify fields that must be set.
         * Throws an error if any required field is empty when validation runs.
         *
         * @returns {string[]} Array of required field names
         */
        get requiredFields() {
            return [];
        }

        /**
         * Gets the list of warning field configurations.
         * Subclasses should override this to specify fields that trigger warnings.
         * A warning is logged if all fields in a configuration are empty or false.
         *
         * @returns {WarningField[]} Array of warning field configurations
         */
        get warningFields() {
            return [];
        }

        /**
         * Lifecycle hook that runs when the component connects to the DOM.
         * Validates all required and warning fields.
         *
         * @override
         * @returns {void}
         */
        connectedCallback() {
            super.connectedCallback();
            this.#validateRequiredFields();
            this.#validateWarningFields();
        }

        /**
         * Lifecycle hook that runs before properties are updated.
         * Re-validates required fields if any of them have changed.
         *
         * @override
         * @param {Map<string, any>} changedProperties - Properties that have changed
         * @returns {void}
         */
        willUpdate(changedProperties) {
            super.willUpdate(changedProperties);

            if (this.requiredFields.some(fieldName => changedProperties.has(fieldName))) {
                this.#validateRequiredFields();
            }
        }

        /**
         * Lifecycle hook that runs after properties and DOM have been updated.
         * Re-validates warning fields if any of their watched properties have changed.
         *
         * @override
         * @param {Map<string, any>} changedProperties - Properties that have changed
         * @returns {void}
         */
        updated(changedProperties) {
            super.updated(changedProperties);

            if (this.warningFields.some(w => w.fields.some(f => changedProperties.has(f)))) {
                this.#validateWarningFields();
            }
        }

        /**
         * Validates all required fields and throws an error if any are empty.
         * @throws {Error} If any required field is empty
         * @returns {void}
         */
        #validateRequiredFields() {
            for (const fieldName of this.requiredFields) {
                if (isEmpty(this[fieldName])) {
                    throw new Error(`${this.componentName}: '${fieldName}' attribute must be set.`);
                }
            }
        }

        /**
         * Validates all warning fields and logs console warnings if conditions are met.
         * A warning is logged if all fields in a warning configuration are empty or false.
         * @returns {void}
         */
        #validateWarningFields() {
            for (const { fields, message } of this.warningFields) {
                if (fields.every(fieldName => isEmpty(this[fieldName]) || this[fieldName] === false)) {
                    console.warn(`${this.componentName}: ${message}`);
                }
            }
        }
    };
}

// field, condition, message, warntype
