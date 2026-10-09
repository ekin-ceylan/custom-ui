import { nothing } from 'lit';
import { chevronDown } from '../modules/icons.js';
import SlotCollectorMixin from '../mixins/slot-collector-mixin.js';
import { mixins } from '../modules/mixin-utils.js';
import StandardControlBase from './standard-control-base.js';

/**
 * @typedef {import('../models/Option.js').default} Option
 * @typedef {import('../models/OptionGroup.js').default} OptionGroup
 * @typedef {import('../models/ComboOption.js').default} ComboOption
 */

/**
 * Base class for form controls that have options, such as ... .
 * Extends `StandardControlBase` to inherit common form control functionality.
 * @abstract Not intended to be used directly in component definitions. Extend this class to create concrete components.
 */
export default class OptionsControlBase extends mixins(StandardControlBase, SlotCollectorMixin) {
    // #region STATICS, FIELDS, GETTERS

    static get properties() {
        return {
            ...super.properties,
            open: { type: Boolean, attribute: false }, // Açık / kapalı
            noOptionsLabel: { type: String, attribute: 'no-options-label' },
            options: { type: Array, attribute: false, noAccessor: true }, // Options array, can contain Option, OptionGroup, or ComboOption objects
        };
    }

    // #endregion STATICS, FIELDS, GETTERS

    constructor() {
        super();

        /** @type {boolean} */
        this.open = false;
        /** @type {string} */
        this.noOptionsLabel = this.localeMessages?.noOptionsLabel;
    }

    /**
     * Renders the indicator icon for the control, typically a chevron or arrow, indicating that the control can be expanded or collapsed.
     * This method can be overridden in subclasses to provide a custom indicator.
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderIndicator() {
        return chevronDown(2, { role: 'presentation', 'data-chevron': true });
    }

    /**
     * Renders a disabled option element with the noOptionsLabel if there are no options available and a label is provided. Otherwise, returns an empty template.
     * @abstract
     * @return {import('lit').TemplateResult | typeof nothing}
     */
    renderNoOptions() {
        throw new Error(`[${this.componentName}]: 'renderNoOptions' method MUST be overridden. Subclasses must provide a custom implementation.`);
    }
}
