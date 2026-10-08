import { html } from 'lit';
import TextControlBase from '../../base/text-control-base.js';
import { eye, eyeOff } from '../../modules/icons.js';

/**
 * Password input component. Extends the general purpose text input component to provide password-specific functionality, such as toggling visibility of the password.
 * - Can be used after defining like `defineElement('password-box', PasswordBox)` or `customElement.define('password-box', PasswordBox)`.
 * - The `required`, `pattern`, `maxlength`, `minlength`, `min`, `max` attributes can be used for validation.
 * - The `allow-pattern` attribute determines which characters are allowed to be entered. For example, if `allow-pattern="\d"` then only numeric input is allowed.
 * @example <password-box name="password" required allow-pattern="\S" minlength="8"></password-box>
 * @extends {TextControlBase}
 */
export default class PasswordBox extends TextControlBase {
    static get properties() {
        return {
            ...super.properties,
            pattern: { type: String, reflect: true },
            allowPattern: { type: String, attribute: 'allow-pattern' },
            maxlength: { type: Number },
            minlength: { type: Number },
            revealed: { type: Boolean, reflect: true }, // şifrenin görünür olup olmadığını tutar
        };
    }

    /**
     * Returns the aria label for the reveal password button.
     * @returns {String}
     */
    get revealPasswordAriaLabel() {
        return this.localeMessages.revealPasswordAriaLabel;
    }

    /**
     * Returns the aria label for the hide password button.
     * @returns {String}
     */
    get hidePasswordAriaLabel() {
        return this.localeMessages.hidePasswordAriaLabel;
    }

    constructor() {
        super();

        this.type = 'password';
        this.autocomplete = 'current-password';

        /** @type {Boolean} Whether the password is revealed or not */
        this.revealed = false;
    }

    /** @inheritdoc */
    updated(changedProperties) {
        super.updated(changedProperties);

        if (changedProperties.has('revealed') && this.inputElement) {
            this.inputElement.type = this.revealed ? 'text' : 'password';
        }
    }

    #toggleVisibility() {
        this.revealed = !this.revealed;
    }

    /**
     * Renders the toggle visibility button for the password input.
     * @protected
     * @returns {import('lit').TemplateResult}
     */
    renderToggleVisibilityButton() {
        return html`<button
            type="button"
            @click=${this.#toggleVisibility}
            aria-label=${this.revealed ? this.hidePasswordAriaLabel : this.revealPasswordAriaLabel}
            aria-pressed=${this.revealed}
            data-role="toggle-visibility"
        >
            <!-- açık ikon -->
            ${eyeOff()}

            <!-- kapalı ikon -->
            ${eye()}
        </button>`;
    }

    /**
     * @protected
     * @override The rendered container content including the toggle visibility button.
     * @returns {import('lit').TemplateResult}
     */
    renderContainerContent() {
        const superContent = super.renderContainerContent();
        return html`${superContent}${this.renderToggleVisibilityButton()}`;
    }
}
