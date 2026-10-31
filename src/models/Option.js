import { html, nothing } from 'lit';
import { spread } from '../modules/spread.js';
import HtmlBaseModel from './HtmlBaseModel.js';

/**
 * Represents an option model for select elements, encapsulating properties such as `label`, `text`, `value`, `selected`, and `disabled`.
 * - This model extends `HtmlBaseModel` to inherit common HTML-related properties and behaviors, including handling of ARIA attributes and custom data attributes.
 * - The `displayText` getter provides a convenient way to determine the text to be displayed for the option, prioritizing `label`, then `text`, and finally `value`.
 * - The `htmlElement` getter generates the corresponding HTML template for rendering the option element, applying all relevant attributes and properties.
 * @extends HtmlBaseModel
 */
export default class Option extends HtmlBaseModel {
    /**
     * Gets the display text for rendering.
     * Prefers explicit text; falls back to label then value.
     * @returns {string}
     */
    get displayText() {
        return this.text || this.label || this.value;
    }

    get labelAttr() {
        return this.label && this.text && this.label != this.text ? this.label : nothing;
    }

    get htmlElement() {
        return html`<option
            label=${this.labelAttr}
            value=${this.value}
            ?selected=${this.selected}
            ?disabled=${this.disabled}
            ?hidden=${this.hidden}
            ${spread(this.dataset, 'data-')}
            ${spread(this.ariaset, 'aria-')}
            .innerText=${this.displayText}
        ></option>`;
    }

    constructor(data = {}) {
        if (typeof data === 'string' || typeof data === 'number') {
            data = { value: String(data) };
        }
        super(data);

        /** Label used for display when text is empty, or as the native option label. @type {string} */
        this.label = data.label ?? '';
        /** Display text, taking precedence over label and value. @type {string} */
        this.text = data.text ?? '';
        /** Option value used for selection and form submission. @type {string} */
        this.value = data.value ?? '';
        /** Whether the option is marked as selected. @type {boolean} */
        this.selected = data.selected ?? false;
    }
}
