import { html, nothing } from 'lit';
import { spread } from '../modules/spread.js';
import Keys from '../enums/Keys.js';
import { times } from '../modules/icons.js';

/**
 * @typedef {import('./types.js').FormControl} FormControl
 * @typedef {import('./types.js').MixinBase} MixinBase
 */

/**
 * @template T
 * @typedef {import('./types.js').Constructor<T>} Constructor
 */

/**
 * @typedef {import('./types.js').StandardControl} StandardControl
 */

/**
 * @template {Constructor<FormControl & MixinBase>} TBase
 * @param {TBase} Base - The base class to extend
 * @category mixins
 * @returns {Constructor<StandardControl> & TBase}
 */
export default function StandardControlMixin(Base) {
    const Mixed = class StandardControl extends Base {
        /** @override */
        get labelId() {
            return this.hideLabel ? null : super.labelId;
        }

        constructor(...args) {
            super(...args);

            /** @type {boolean} Whether to hide the label visually */
            this.hideLabel = false;
            /** @type {string} Placeholder text for the input */
            this.placeholder = '';
            /** @type {boolean} Show clear button */
            this.clearable = false;
        }

        // #region EVENT LISTENERS

        /**
         * Clears the input value, dispatches a "clear" custom event, and focuses the input element.
         * @param {Event} event The event that triggered the clear action.
         * @fires clear - Dispatched when the clear button is clicked, after the input value has been cleared.
         * @protected
         */
        onClearClick(event) {
            this.clear();
            this.dispatchCustomEvent('clear');
            this.inputElement?.focus(); // select için nasıl çalışır?
        }

        /**
         * Handles keydown events on the clear button. Stops propagation for Enter and Space keys to prevent form submission or other default behaviors.
         * @param {KeyboardEvent} event The keyboard event triggered on the clear button.
         * @protected
         */
        onClearKeyDown(event) {
            /** @type {string[]} */
            const stopKeys = [Keys.ENTER, Keys.SPACE];
            if (stopKeys.includes(event.code)) event.stopPropagation();
        }

        // #endregion EVENT LISTENERS

        // #region RENDER HOOKS

        /**
         * Renders the label text for the input field. By default, it returns the value of the `label` property, but can be overridden to provide custom label rendering logic.
         *
         * Implementation example for a required field with an asterisk:
         * ```javascript
         * renderLabelContent() {
         *     return html`${this.label}${this.required ? html`<span>*</span>` : nothing}`;
         * }
         * ```
         * @category rendering
         * @return {import('lit').TemplateResult | string | typeof nothing}
         */
        renderLabelContent() {
            return this.label;
        }

        /**
         * Renders the label element for the input field. If `hideLabel` is true, it returns `nothing`, effectively hiding the label visually. Otherwise, it renders a `<label>` element with the appropriate `id` and `for` attributes, and includes the label text rendered by `renderLabelContent()`.
         * @protected
         * @category rendering
         * @return {import('lit').TemplateResult | typeof nothing}
         */
        renderLabel() {
            return this.hideLabel ? nothing : html`<label ${spread(this.getScopedAttrs('label'))} id=${this.labelId} for=${this.fieldId}>${this.renderLabelContent()}</label>`;
        }

        /**
         * Renders the text for the clear button. By default, it returns a multiplication sign (`&times;`), but can be overridden to provide custom clear button text or icons.
         * @example
         * renderClearButtonContent() {
         *     return html`<svg ...>...</svg>`; // Custom SVG icon for clear button
         * }
         *
         * @example
         * renderClearButtonContent() {
         *     return 'Clear'; // Custom text for clear button
         * }
         * @category rendering
         * @return {import('lit').TemplateResult | string | typeof nothing}
         */
        renderClearButtonContent() {
            return times();
        }

        /**
         * Renders the clear button for the input field. If `clearable` is false, or the input is `readonly` or `disabled`, it returns `nothing`. Otherwise, it renders a `<button>` element with the appropriate ARIA attributes and event listeners, and includes the clear button text rendered by `renderClearButtonContent()`.
         * @protected
         * @category rendering
         * @return {import('lit').TemplateResult | typeof nothing}
         */
        renderClearButton() {
            if (!this.clearable || this.readonly || this.disabled) return nothing;
            const ariaLabel = this.localeMessages.clearButtonAriaLabel;

            return html`
                <button type="button" data-clear ?disabled=${!this.value} @click=${this.onClearClick} @keydown=${this.onClearKeyDown} aria-label="${ariaLabel}">
                    ${this.renderClearButtonContent()}
                </button>
            `;
        }

        // #endregion RENDER HOOKS
    };

    return /** @type {Constructor<StandardControl> & TBase} */ (/** @type {unknown} */ (Mixed));
}
