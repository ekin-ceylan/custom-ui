import { mixins } from 'custom-ui';
import ControllerBase from '../core/controller-base.js';
import TextControlMixin from '../core/text-control-mixin.js';
import StandardControlMixin from '../core/standard-control-mixin.js';
import FormControlMixin from '../core/form-control-mixin.js';

export default class TextBoxController extends mixins(ControllerBase, TextControlMixin, StandardControlMixin, FormControlMixin) {
    #textControlInitialized = false;
    #formControlInitialized = false;
    #hasProcessedValue = false;
    #processedValue;
    #cachedInput;

    /**
     * @override
     * @returns {HTMLInputElement}
     */
    get inputElement() {
        if (!this.#cachedInput) {
            this.#cachedInput = this.parentElement?.querySelector('input');
        }

        return this.#cachedInput;
    }

    hostUpdate() {
        if (!this.#textControlInitialized) {
            this.onTextControlFirstUpdate();
            this.#textControlInitialized = true;
        }

        if (!this.#hasProcessedValue || this.value !== this.#processedValue) {
            this.onBeforeValueUpdate();
            this.#processedValue = this.value;
            this.#hasProcessedValue = true;
        }
    }

    hostUpdated() {
        if (!this.#formControlInitialized) {
            this.onFormControlFirstUpdate();
            this.#formControlInitialized = true;
        }

        if (this.valueUpdated()) {
            this.dispatchCustomEvent('update');
        }
    }

    renderTemplate() {
        return this.render();
    }
}
