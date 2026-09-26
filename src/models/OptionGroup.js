import { html } from 'lit';
import Option from './Option.js';
import CustomOption from '../components/parts/custom-option.js';
import { spread } from '../modules/spread.js';
import HtmlBaseModel from './HtmlBaseModel.js';
import { findLastBy, isEmpty } from '../modules/utilities.js';

/** Represents an option group model. */
export default class OptionGroup extends HtmlBaseModel {
    label = '';
    /** @type {Option[]} */
    #options = [];

    /**
     * Gets or sets the child options of this option group.
     * @returns {Option[]}
     */
    get options() {
        return this.#options;
    }

    set options(value) {
        const isCollection =
            (typeof HTMLCollection !== 'undefined' && value instanceof HTMLCollection) ||
            (typeof HTMLOptionsCollection !== 'undefined' && value instanceof HTMLOptionsCollection) ||
            (typeof NodeList !== 'undefined' && value instanceof NodeList);

        const source = Array.isArray(value) || isCollection ? Array.from(value) : null;

        if (!source) {
            this.#options = [];
            return;
        }

        this.#options = source.map(child => (child instanceof Option ? child : new Option(child))).filter(c => !isEmpty(c.value));
    }

    /**
     * Native alias for optgroup children. Helps for mapping HTMLOptGroupElement.children.
     * @returns {Option[]}
     */
    get children() {
        return this.#options;
    }

    set children(value) {
        this.options = Array.from(value).filter(child => child instanceof CustomOption || child instanceof HTMLOptionElement);
    }

    /**
     * Checks if any option in the group is selected.
     * @returns {boolean} True if any option is selected, otherwise false.
     */
    get selected() {
        return this.#options.some(option => option.selected);
    }

    /**
     * Gets the value of the selected option in the group.
     * @return {string} The value of the selected option, or an empty string if none are selected.
     */
    get value() {
        return findLastBy(this.#options, option => option.selected)?.value || '';
    }

    get htmlElement() {
        return html`<optgroup label=${this.label} ?disabled=${this.disabled} ?hidden=${this.hidden} ${spread(this.dataset, 'data-')} ${spread(this.ariaset, 'aria-')}>
            ${this.#options.map(childOption => childOption.htmlElement)}
        </optgroup>`;
    }

    constructor(data = {}) {
        super(data);

        this.label = data.label ?? '';
        this.options = data.options ?? [];

        if (this.options.length === 0 && data.children != null) {
            this.children = data.children;
        }
    }
}
