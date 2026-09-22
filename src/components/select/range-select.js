import { html } from 'lit';
import { ifDefined } from '../../modules/utilities.js';
import StandardControlBase from '../../base/standard-control-base.js';

/**
 * @extends StandardControlBase
 */
export default class RangeSelect extends StandardControlBase {
    static get properties() {
        return {
            ...super.properties,
            min: { type: Number },
            max: { type: Number },
            step: { type: Number },
        };
    }

    #cachedInput;

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
        this.min = 0;
        this.max = 100;
        /** @type {number} */
        this.step = 1;
        this.value = String(this.min || 0);
        this.label = '';
        this.required = false;
    }

    setupFirstInteraction() {
        this.addEventListener('input', _e => this.dispatchCustomEvent('first-interaction'), { once: true });
    }

    onInput(e) {
        this.value = e.target.value;
        // this.#checkValidity();
    }

    /**
     * @protected Handles the invalid event for the text box.
     * @param {Event & { target: HTMLInputElement }} event
     */
    onInvalid(event) {
        // e.preventDefault(); // mesaj baloncuğu çıkmaz
        // this.#checkValidity(true);
    }

    /** @override @protected @returns {import('lit').TemplateResult} */
    render() {
        return html`
            ${this.renderLabel()}
            <div>
                <data value=${this.min} aria-hidden="true">${this.min}</data>
                <input
                    id=${this.fieldId}
                    name=${ifDefined(this.name)}
                    .value=${this.value ?? ''}
                    ?required=${this.required}
                    ?disabled=${this.disabled}
                    aria-labelledby=${ifDefined(this.labelId)}
                    aria-label=${ifDefined(this.hideLabel ? this.label : undefined)}
                    aria-errormessage=${ifDefined(this.errorId)}
                    aria-required=${this.required ? 'true' : 'false'}
                    aria-invalid=${ifDefined(this.ariaInvalid)}
                    @input=${this.onInput}
                    @invalid=${this.onInvalid}
                    type="range"
                    min=${this.min}
                    max=${this.max}
                    step=${this.step}
                />
                <data value=${this.max} aria-hidden="true">${this.max}</data>
                <output for=${this.fieldId}>${this.value}</output>
            </div>
            ${this.renderErrorMessage()}
        `;
    }
}
