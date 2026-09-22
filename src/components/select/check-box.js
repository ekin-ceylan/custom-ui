import { html } from 'lit';
import { ifDefined } from '../../modules/utilities.js';
import SlotCollectorMixin from '../../mixins/slot-collector-mixin.js';
import FormControlBase from '../../base/form-control-base.js';
import { mixins } from '../../modules/mixin-utils.js';

/**
 * A custom checkbox component that extends the FormControlBase and SlotCollectorMixin.
 * @extends {FormControlBase<string | boolean | number>}
 */
export default class CheckBox extends mixins(FormControlBase, SlotCollectorMixin) {
    static get properties() {
        return {
            ...super.properties,
            checked: { type: Boolean, noAccessor: true },
            checkedValue: { type: String, noAccessor: true, attribute: 'checked-value' },
            uncheckedValue: { type: String, noAccessor: true, attribute: 'unchecked-value' },
            indeterminate: { type: Boolean, noAccessor: true, reflect: true },
        };
    }

    #cachedInput;
    /** @type {string | boolean | number} */
    #checkedValue = 'on';
    /** @type {string | boolean | number} */
    #uncheckedValue = null;
    #indeterminate = false;

    get checked() {
        return this.value === this.checkedValue;
    }
    set checked(value) {
        this.#setValue(value);
        this.#indeterminate = false;
        this.requestUpdate('checked');
    }

    /** @returns {string | boolean | number} */
    get checkedValue() {
        return this.#checkedValue;
    }
    set checkedValue(value) {
        if (value === this.#uncheckedValue) {
            throw new Error(`${this.componentName}: 'checkedValue' and 'uncheckedValue' must be different.`);
        }

        const isChecked = this.checked;
        this.#checkedValue = value;
        this.#setValue(isChecked);
        this.requestUpdate('checkedValue');
    }

    /** @returns {string | boolean | number} */
    get uncheckedValue() {
        return this.#uncheckedValue;
    }
    set uncheckedValue(value) {
        if (value === this.#checkedValue) {
            throw new Error(`${this.componentName}: 'checkedValue' and 'uncheckedValue' must be different.`);
        }

        this.#uncheckedValue = value;
        this.#setValue(this.checked);
        this.requestUpdate('uncheckedValue');
    }

    get indeterminate() {
        return this.#indeterminate;
    }
    set indeterminate(value) {
        this.#indeterminate = Boolean(value);
        if (this.#indeterminate) this.#setValue(false);
        this.requestUpdate('indeterminate');
    }

    get descriptionId() {
        return `${this.componentName}-description-${this.uniqueId}`;
    }

    /**
     * Returns the reference to the native input element within the component. Caches the reference after the first query for performance optimization.
     * @returns {HTMLInputElement | null}
     */
    get inputElement() {
        if (this.#cachedInput == undefined) {
            this.#cachedInput = this.renderRoot.querySelector('input');
        }

        return this.#cachedInput;
    }

    constructor() {
        super();

        this.checked = undefined;
        this.indeterminate = false;
        this.checkedValue = 'on';
        this.uncheckedValue = null;
        /** @type {string | boolean | number} */
        this.value = this.uncheckedValue;
    }

    willUpdate(changedProperties) {
        if (changedProperties.has('value') && this.value !== this.checkedValue && this.value !== this.uncheckedValue) {
            this.#setValue(false);
        }
    }

    setupFirstInteraction() {
        this.addEventListener('input', _e => this.dispatchCustomEvent('first-interaction'), { once: true });
    }

    /**
     * Overrides the valueUpdated method from the base class to prevent sending the value to inputElement.
     * @override
     */
    valueUpdated() {
        return true;
    }

    /** @param {InputEvent} e */
    #onInput(e) {
        const input = /** @type {HTMLInputElement} */ (e.target);
        this.#setValue(input.checked);
        this.#checkValidity();
    }

    /** @param {MouseEvent} e */
    #onClick(e) {
        if (this.readonly) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    }

    #checkValidity() {
        const el = this.inputElement;
        const v = el.validity;

        el.setCustomValidity('');
        this.invalid = !v?.valid;
        this.validationMessage = v?.valueMissing ? this.requiredValidationMessage : '';
        el.setCustomValidity(this.validationMessage);
    }

    /** @param {boolean} checked */
    #setValue(checked) {
        this.value = checked ? this.checkedValue : this.uncheckedValue;
        if (checked) this.#indeterminate = false;
    }

    /** @override @protected @returns {import('lit').TemplateResult} */
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
                <span id=${this.descriptionId}><slot></slot></span>
            </label>
            ${this.renderErrorMessage()}
        `;
    }
}
