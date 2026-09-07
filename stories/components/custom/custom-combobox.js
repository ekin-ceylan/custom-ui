import { ComboBox } from '../../../src/exports/custom-ui.js';
import { html, nothing } from '../../../src/exports/vendors/lit.js';

export class CustomCombobox extends ComboBox {
    renderSearchInput() {
        return nothing;
    }
    renderListContent() {
        return html`${super.renderSearchInput()} ${super.renderListContent()}`;
    }

    constructor() {
        super();
        this.classList.add('combo-box');
    }
}
