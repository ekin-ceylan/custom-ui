import FormControlBase from '../../base/form-control-base.js';
import CheckBoxMixin from '../../core/check-box-mixin.js';
import { mixins } from '../../modules/mixin-utils.js';

/**
 * A custom checkbox component that extends the FormControlBase.
 */
export default class CheckBox extends mixins(FormControlBase, CheckBoxMixin) {
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

    willUpdate(changedProperties) {
        if (changedProperties.has('value') && this.value !== this.checkedValue && this.value !== this.uncheckedValue) {
            this.onBeforeValueUpdate();
        }
    }
}
