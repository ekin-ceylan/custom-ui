import FormControlBase from './form-control-base.js';
import StandardControlMixin from '../core/standard-control-mixin.js';
import { mixins } from '../modules/mixin-utils.js';

/**
 * Base class for standard form control components that have `<label>` + `<input>` + `<error>` structure, providing common functionality for inputs, selects, and other form controls.
 * - Provides `hideLabel`, `clearable`, and `placeholder` properties for common form control features.
 * - Provides `renderLabel()` and `renderClearButton()` methods for rendering the label and clear button, respectively.
 * - Exposes underscore-based protected hooks for handling clear button interactions.
 *
 * Subclass override example:
 * ```js
 * import StandardControlBase from './standard-control-base.js';
 *
 * export default class MyControl extends StandardControlBase {
 *     onClearClick(event) {
 *         this.clear();
 *         this.dispatchCustomEvent('clear');
 *         this.inputElement?.focus();
 *     }
 * }
 * ```
 * @abstract Not intended to be used directly in component definitions (for example, with customElements.define). Extend this class to create concrete components.
 */
export default class StandardControlBase extends mixins(FormControlBase, StandardControlMixin) {
    static get properties() {
        return {
            ...super.properties,
            hideLabel: { type: Boolean, attribute: 'hide-label' },
            clearable: { type: Boolean, attribute: 'clearable' },
            placeholder: { type: String },
        };
    }
}
