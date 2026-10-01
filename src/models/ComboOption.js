import { html } from 'lit';
import { spread } from '../modules/spread.js';
import { ifDefined, sanitizeHtml } from '../modules/utilities.js';
import ListboxItem from './ListboxItem.js';

/**
 * Represents a combo option model that can have child options (optgroup).
 * @extends ListboxItem
 */
export default class ComboOption extends ListboxItem {
    #safeInnerHTML = '';

    label = '';
    text = '';
    /** @type {string} */
    value = '';
    selected = false;

    get innerHTML() {
        return this.#safeInnerHTML;
    }
    set innerHTML(val) {
        this.#safeInnerHTML = sanitizeHtml(val);
    }

    /**
     * Gets the display text for rendering.
     * Prefers explicit text; falls back to label then value.
     * @returns {string}
     */
    get displayText() {
        return this.text || this.label || this.value;
    }

    /**
     * Gets the content to be displayed for the combo option.
     * @returns {string} The sanitized innerHTML if set, otherwise the displayText.
     */
    get displayContent() {
        return this.innerHTML || sanitizeHtml(this.displayText);
    }

    /**
     * @param {boolean} isActive
     * @override Converts the combo option model to an HTML template.
     */
    renderListboxItem(isActive) {
        return html`
            <div
                id=${ifDefined(this.id)}
                role="option"
                ?hidden=${this.hidden}
                ${spread(this.dataset, 'data-')}
                ${spread(this.ariaset, 'aria-')}
                ?data-active=${isActive}
                data-value=${this.value}
                ?aria-disabled=${!!this.disabled}
                ?aria-selected=${this.selected}
                .innerHTML=${this.displayContent}
            ></div>
        `;
    }

    constructor(data = {}) {
        super(data);

        this.innerHTML = data.innerHTML ?? '';
        this.label = data.label ?? '';
        this.text = data.text ?? '';
        this.value = data.value ?? '';
        this.selected = data.selected ?? false;
    }
}
