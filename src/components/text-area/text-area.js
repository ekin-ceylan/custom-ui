import { html } from 'lit';
import { spread } from '../../modules/spread.js';
import { ifDefined, isEmpty } from '../../modules/utilities.js';
import TextAreaBase from '../../base/text-area-base.js';

/**
 * General purpose text area component. Can be used for multi-line text input.
 * - Can be used after defining like `defineElement('text-area', TextArea)` or `customElement.define('text-area', TextArea)`.
 * - The `required`, `maxlength`, `minlength`, `rows`, `cols`, and `wrap` attributes can be used for validation and configuration.
 * @example <text-area name="description" required minlength="10" maxlength="500" rows="5" cols="40"></text-area>
 * @extends TextAreaBase
 */
export default class TextArea extends TextAreaBase {
    // #region STATICS, FIELDS, GETTERS

    static get properties() {
        return {
            ...super.properties,
            autocomplete: { type: String },
            spellcheck: { type: Boolean, reflect: true },
            inputmode: { type: String, reflect: true },
            rows: { type: Number, reflect: true },
            cols: { type: Number, reflect: true },
            wrap: { type: String, reflect: true },
        };
    }

    // #endregion STATICS, FIELDS, GETTERS

    constructor() {
        super();

        /** @type {string | undefined} The autocomplete attribute for the input element */
        this.autocomplete = undefined;
        /** @type {boolean} Whether spellcheck is enabled for the input element */
        this.spellcheck = true;
        /** @type {string | undefined} The inputmode attribute for the input element (e.g., 'numeric', 'decimal', 'tel'). Will be 'text' if not specified */
        this.inputmode = undefined;
        /** @type {number | undefined} The number of rows for the textarea */
        this.rows = undefined;
        /** @type {number | undefined} The number of columns for the textarea */
        this.cols = undefined;
        /** @type {string | undefined} The wrap attribute for the textarea */
        this.wrap = undefined;
    }

    // #region INTERNAL HOOKS

    /** @override @protected */
    valueUpdated() {
        if (!super.valueUpdated()) return false;

        this.#checkValidity(false);
        return true;
    }

    // #endregion INTERNAL HOOKS

    // #region EVENT HANDLERS

    /**
     * Handles input event for textarea: syncs value and re-dispatches as component event.
     * @param {InputEvent & { target: HTMLTextAreaElement }} event
     */
    #onInput(event) {
        event.stopPropagation();
        this.value = event.target.value;
        this.#checkValidity(false);
        this.dispatchCustomEvent('input', event);
    }

    /**
     * Handles change event for textarea.
     * @param {Event & { target: HTMLTextAreaElement }} event
     */
    #onChange(event) {
        event.stopPropagation();
        this.value = event.target.value;
        this.dispatchCustomEvent('change', event);
    }

    /**
     * Handles blur event for textarea.
     * @param {Event} _event
     */
    #onBlur(_event) {
        this.#checkValidity(this.interacted);
    }

    /**
     * Handles native invalid event from textarea.
     * @param {Event} _event
     */
    #onInvalid(_event) {
        this.#checkValidity(true);
    }

    // #endregion EVENT HANDLERS

    // #region PRIVATE

    #checkValidity(force = false) {
        const valueMissing = this.required && isEmpty(this.value);
        const isDeleted = this.interacted && valueMissing;

        // Validate eagerly only when forced, already invalid, or cleared after interaction.
        if (!force && !this.invalid && !isDeleted) return true;

        return this.checkValidity();
    }

    // #endregion PRIVATE

    render() {
        return html`${this.renderLabel()}
            <div data-role="container">
                <textarea
                    ${spread(this.getScopedAttrs('textarea'))}
                    id=${this.fieldId}
                    name=${ifDefined(this.name)}
                    ?disabled=${this.disabled}
                    ?readonly=${this.readonly}
                    aria-labelledby=${ifDefined(this.labelId)}
                    aria-label=${ifDefined(this.hideLabel ? this.label : undefined)}
                    aria-errormessage=${ifDefined(this.errorId)}
                    aria-describedby=${ifDefined(this.description ? this.descriptionId : undefined)}
                    aria-required=${this.required ? 'true' : 'false'}
                    aria-invalid=${ifDefined(this.ariaInvalid)}
                    .placeholder=${this.placeholder}
                    autocomplete=${ifDefined(this.autocomplete)}
                    ?required=${this.required}
                    spellcheck=${ifDefined(this.spellcheck)}
                    inputmode=${ifDefined(this.inputmode)}
                    maxlength=${ifDefined(this.maxlength)}
                    minlength=${ifDefined(this.minlength)}
                    rows=${ifDefined(this.rows)}
                    cols=${ifDefined(this.cols)}
                    wrap=${ifDefined(this.wrap)}
                    ?data-has-value=${this.value}
                    @input=${this.#onInput}
                    @change=${this.#onChange}
                    @blur=${this.#onBlur}
                    @invalid=${this.#onInvalid}
                ></textarea>
                ${this.renderAdornment()} ${this.renderCounter()} ${this.renderClearButton()} ${this.renderDescription()}
            </div>
            ${this.renderErrorMessage()}`;
    }
}

/*
 - Auto-resize: içerik arttıkça yüksekliğin otomatik büyümesi
 - Min/max rows: satır sayısına göre daha kontrollü büyüme
 - Disabled/read-only görsel ayrımı: sadece davranış değil stil olarak da farklı görünüm

 Benim öncelik sıram şu olurdu:
 - Auto-resize
 - Min/max rows
*/
