import { html } from 'lit';
import { ifDefined } from '../modules/utilities.js';

/** @typedef {import('./types.ts').CheckBox} CheckBox */
/** @typedef {string | boolean | number} CheckboxValue */

/**
 * @template T
 * @typedef {import('./types.ts').Constructor<T>} Constructor
 */

/**
 * @template {Constructor<import('./types.ts').FormControl<CheckboxValue> & import('./types.ts').MixinBase>} TBase
 * @param {TBase} Base
 * @returns {Constructor<CheckBox> & TBase}
 */
export default function CheckBoxMixin(Base) {
    const Mixed = class CheckBox extends Base {
        /** @type {CheckboxValue} */
        #checkedValue = 'on';
        /** @type {CheckboxValue} */
        #uncheckedValue = /** @type {CheckboxValue} */ (null);
        #indeterminate = false;

        get checked() {
            return this.value === this.checkedValue;
        }

        /** @param {boolean} value */
        set checked(value) {
            this.#setValue(value);
            this.#indeterminate = false;
            this.requestUpdate('checked');
        }

        /** @returns {CheckboxValue} */
        get checkedValue() {
            return this.#checkedValue;
        }

        /** @param {CheckboxValue} value */
        set checkedValue(value) {
            if (value === this.#uncheckedValue) {
                throw new Error(`${this.componentName}: 'checkedValue' and 'uncheckedValue' must be different.`);
            }

            const isChecked = this.checked;
            this.#checkedValue = value;
            this.#setValue(isChecked);
            this.requestUpdate('checkedValue');
        }

        /** @returns {CheckboxValue} */
        get uncheckedValue() {
            return this.#uncheckedValue;
        }

        /** @param {CheckboxValue} value */
        set uncheckedValue(value) {
            if (value === this.#checkedValue) {
                throw new Error(`${this.componentName}: 'checkedValue' and 'uncheckedValue' must be different.`);
            }

            const isChecked = this.checked;
            this.#uncheckedValue = value;
            this.#setValue(isChecked);
            this.requestUpdate('uncheckedValue');
        }

        get indeterminate() {
            return this.#indeterminate;
        }

        /** @param {boolean} value */
        set indeterminate(value) {
            this.#indeterminate = Boolean(value);
            if (this.#indeterminate) this.#setValue(false);
            this.requestUpdate('indeterminate');
        }

        get descriptionId() {
            return `${this.componentName}-description-${this.uniqueId}`;
        }

        constructor(...args) {
            super(...args);

            this.checked = undefined;
            this.indeterminate = false;
            this.checkedValue = 'on';
            this.uncheckedValue = /** @type {CheckboxValue} */ (null);
            this.value = this.uncheckedValue;
        }

        /**
         * Normalizes values that cannot represent either checkbox state.
         * Call before rendering after external value changes.
         * @protected
         */
        onBeforeValueUpdate() {
            if (this.value !== this.checkedValue && this.value !== this.uncheckedValue) {
                this.#setValue(false);
            }
        }

        /**
         * Checkbox state is reflected through `checked`, not the input's string value.
         * @override
         */
        valueUpdated() {
            return true;
        }

        /** @override */
        setupFirstInteraction() {
            this.addEventListener('input', event => this.dispatchCustomEvent('first-interaction', event), { once: true });
        }

        /**
         * @param {InputEvent & { target: HTMLInputElement }} event
         */
        #onInput = event => {
            event.stopPropagation();
            this.#setValue(event.target.checked);
            this.#checkValidity();
            this.dispatchCustomEvent('input', event);
        };

        /**
         * @param {MouseEvent} event
         */
        #onClick = event => {
            if (!this.readonly) return;
            event.preventDefault();
            event.stopImmediatePropagation();
        };

        #checkValidity = () => {
            const input = this.inputElement;
            const validity = input.validity;

            input.setCustomValidity('');
            this.invalid = !validity?.valid;
            this.validationMessage = validity?.valueMissing ? this.requiredValidationMessage : '';
            input.setCustomValidity(this.validationMessage);
        };

        /** @param {boolean} checked */
        #setValue(checked) {
            this.value = checked ? this.checkedValue : this.uncheckedValue;
            if (checked) this.#indeterminate = false;
        }

        renderDescriptionContent() {
            return html`<slot></slot>`;
        }

        /** @protected @returns {import('lit').TemplateResult} */
        render() {
            return html`
                <label id=${this.labelId} for=${this.fieldId}>
                    <input
                        id=${this.fieldId}
                        name=${ifDefined(this.name)}
                        type="checkbox"
                        value=${ifDefined(this.checkedValue)}
                        .indeterminate=${ifDefined(this.indeterminate)}
                        ?checked=${this.checked}
                        aria-describedby=${this.descriptionId}
                        aria-errormessage=${ifDefined(this.errorId)}
                        aria-required=${this.required ? 'true' : 'false'}
                        aria-invalid=${ifDefined(this.ariaInvalid)}
                        ?aria-readonly=${this.readonly}
                        ?required=${this.required}
                        ?disabled=${this.disabled}
                        @input=${this.#onInput}
                        @click=${this.#onClick}
                        @invalid=${this.#checkValidity}
                    />
                    <span id=${this.descriptionId}>${this.renderDescriptionContent()}</span>
                </label>
                ${this.renderErrorMessage()}
            `;
        }
    };

    return /** @type {Constructor<CheckBox> & TBase} */ (/** @type {unknown} */ (Mixed));
}
