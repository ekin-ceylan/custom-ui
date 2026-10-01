import { nothing } from 'lit';
import HtmlBaseModel from './HtmlBaseModel.js';

/**
 * Represents a listbox item model.
 * @extends HtmlBaseModel
 */
export default class ListboxItem extends HtmlBaseModel {
    /** The unique identifier for the listbox item. */
    id = '';

    /**
     * Converts the listbox option model to an HTML template.
     * @param {boolean} isActive Indicates whether the listbox item is currently active.
     * @abstract
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderListboxItem(isActive) {
        throw new Error(`'renderListboxItem' getter MUST be overridden. Subclasses must provide a reference to the native DOM element.`);
    }

    constructor(data = {}) {
        super(data);

        this.id = data.id ?? '';
    }
}
