import { html, nothing } from 'lit';
import { isEmpty } from '../modules/utilities.js';

/**
 * @typedef {import('../base/text-control-base.js').default} TextControlBase
 */

/**
 * @template T
 * @typedef {import('./types.js').Constructor<T>} Constructor
 */

/**
 * @typedef {import('./types.js').InputMask} InputMask
 */

/**
 * Mixin that provides an input mask functionality for text input components.
 * The input mask is rendered as an underlay behind the actual input value, providing a visual cue to users.
 * When the input value is being edited, an input mask (ghost text) is displayed to indicate the expected format or content.
 *
 * **Usage:** Extend your text input component with this mixin to enable input mask functionality.
 * The input mask can be set via the `inputMask` property. If not set, it defaults to the value of the `placeholder` property.
 *
 * **Caution:** It overrides the `renderContainerContent` method to render the input mask. Ensure that your component's `renderContainerContent` method is available when using this mixin.
 *
 * **Constraint:** Can only be applied to classes extending `TextControlBase`.
 *
 * @template {Constructor<TextControlBase>} TBase
 * @param {TBase} Base - The base class to extend
 * @category mixins
 * @returns {TBase & Constructor<InputMask>}
 */
export default function InputMaskMixin(Base) {
    return class InputMask extends Base {
        #ghostMask1 = '';
        #ghostMask2 = '';
        #inputMask = '';

        get inputMask() {
            return this.#inputMask || this.placeholder;
        }

        set inputMask(value) {
            this.#inputMask = value;
        }

        willUpdate(changed) {
            super.willUpdate(changed);

            if (changed.has('value') || changed.has('placeholder') || changed.has('inputMask')) {
                const len = this.maskedValue.length;
                this.#ghostMask1 = this.maskedValue;
                this.#ghostMask2 = this.inputMask.slice(len);
            }
        }

        /**
         * The rendered input mask content.
         * @returns {import('lit').TemplateResult | typeof nothing}
         */
        renderInputMaskContent() {
            // prettier-ignore
            return html`<pre>${this.#ghostMask1}</pre><pre>${this.#ghostMask2}</pre>`;
        }

        /**
         * Renders the input mask (ghost text) as an underlay behind the actual input value.
         * @returns {import('lit').TemplateResult | typeof nothing}
         */
        renderInputMask() {
            if (isEmpty(this.#ghostMask1) && isEmpty(this.#ghostMask2)) return nothing;

            // prettier-ignore
            return html`<div aria-hidden="true" data-role="underlay">${this.renderInputMaskContent()}</div>`;
        }

        /**
         * @override Renders the container content including the input mask.
         * @category rendering
         * @returns {import('lit').TemplateResult | typeof nothing}
         */
        renderContainerContent() {
            const superContent = super.renderContainerContent();
            return html`${superContent}${this.renderInputMask()}`;
        }
    };
}
