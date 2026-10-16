import { mixins } from '../modules/mixin-utils.js';
import ControllerBase from '../core/controller-base.js';
import FormControlMixin from '../core/form-control-mixin.js';
import CheckBoxMixin from '../core/check-box-mixin.js';

export default class CheckBoxController extends mixins(ControllerBase, CheckBoxMixin, FormControlMixin) {
    #formControlInitialized = false;
    /** @type {HTMLInputElement | null} */
    #cachedInput;

    /** @override @returns {HTMLInputElement} */
    get inputElement() {
        if (!this.#cachedInput) {
            this.#cachedInput = this.parentElement?.querySelector('input[type="checkbox"]');
        }

        return this.#cachedInput;
    }

    // hostUpdate() {
    //     this.onBeforeValueUpdate();
    // }

    hostUpdated() {
        if (!this.#formControlInitialized) {
            this.onFormControlFirstUpdate();
            this.#formControlInitialized = true;
        }
    }

    renderDescriptionContent() {
        return this.options.description;
    }

    renderTemplate() {
        return this.render();
    }
}
