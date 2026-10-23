import { CheckBoxMixin, FormControlMixin, ControllerBase, mixins } from 'custom-ui';

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
