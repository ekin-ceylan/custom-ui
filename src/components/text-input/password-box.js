import { html } from 'lit';
import TextControlBase from '../../base/text-control-base.js';

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
            <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                    d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"
                />
                <path
                    d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299l.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"
                />
                <path
                    d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709z"
                />
                <path d="M13.646 14.354l-12-12 .708-.708 12 12-.708.708z" fill-rule="evenodd" />
            </svg>

            <!-- kapalı ikon -->
            <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                    fill-rule="evenodd"
                    d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.134 13.134 0 0 0 1.66 2.043C4.12 11.332 5.88 12.5 8 12.5c2.12 0 3.879-1.168 5.168-2.457A13.134 13.134 0 0 0 14.828 8a13.133 13.133 0 0 0-1.66-2.043C11.879 4.668 10.119 3.5 8 3.5c-2.12 0-3.879 1.168-5.168 2.457A13.133 13.133 0 0 0 1.172 8z"
                />
                <path fill-rule="evenodd" d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
            </svg>
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
