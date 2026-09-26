import { html } from 'lit';
import { spread } from '../modules/spread.js';
import { ifDefined, sanitizeHtml } from '../modules/utilities.js';
import HtmlBaseModel from './HtmlBaseModel.js';

/**
 * Represents a suggestion model that can have child options (optgroup).
 * @extends HtmlBaseModel
 */
export default class Suggestion extends HtmlBaseModel {
    #safeInnerHTML = '';
    id = '';
    /**
     * The text to be used as the suggestion.
     * @type {string}
     */
    suggestionText = '';

    /** The sanitized innerHTML content for the suggestion option. */
    get innerHTML() {
        return this.#safeInnerHTML;
    }
    set innerHTML(val) {
        this.#safeInnerHTML = sanitizeHtml(val);
    }

    /**
     * Gets the content to be displayed for the suggestion option.
     * @returns {string}
     */
    get displayContent() {
        return this.innerHTML || sanitizeHtml(this.suggestionText);
    }

    /**
     * Converts the suggestion option model to an HTML template.
     * @param {boolean} isActive
     * @returns {import('lit').TemplateResult}
     */
    toHtml(isActive) {
        return html`
            <div
                id=${ifDefined(this.id)}
                role="option"
                ?hidden=${this.hidden}
                ${spread(this.dataset, 'data-')}
                ${spread(this.ariaset, 'aria-')}
                ?data-active=${isActive}
                ?aria-disabled=${!!this.disabled}
                .innerHTML=${this.displayContent}
            ></div>
        `;
    }

    constructor(data = {}) {
        super(data);

        this.innerHTML = data.innerHTML ?? '';
        this.id = data.id ?? '';
        this.suggestionText = data.suggestionText ?? data.textContent ?? '';
    }
}
