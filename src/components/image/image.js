import { html } from 'lit';
import { ifDefined } from '../../modules/utilities';
import { spread } from '../../modules/spread';
import PropValidatorMixin from '../../mixins/prop-validator-mixin';
import LightComponentBase from '../../base/light-component-base.js';
import { mixins } from '../../modules/mixin-utils.js';

/**
 * Custom image component that extends LightComponentBase to render an image with enhanced features such as error handling, decorative mode, and accessibility improvements.
 * - Can be used after defining like `defineElement('custom-image', Image)` or `customElement.define('custom-image', Image)`.
 * - The `src` attribute is required to specify the image source URL.
 * - The `alt` attribute provides alternative text for accessibility, and is required unless the image is marked as decorative.
 * - The `decorative` attribute indicates that the image is purely decorative and should have an empty alt text.
 * - The `fallback-text` attribute specifies the text to display if the image fails to load.
 * - Supports responsive images through `srcset` and `sizes` attributes.
 * @example <custom-image src="image.jpg" alt="Description of the image" fallback-text="Image failed to load"></custom-image>
 */
export default class Image extends mixins(LightComponentBase, PropValidatorMixin) {
    static get properties() {
        return {
            src: { type: String },
            srcset: { type: String },
            sizes: { type: String },
            decorative: { type: Boolean },
            fallbackText: { type: String, attribute: 'fallback-text' },
            alt: { type: String },
            width: { type: [Number, String] },
            height: { type: [Number, String] },
            loading: { type: String },
            decoding: { type: String },
            fetchpriority: { type: String },
            hasError: { type: Boolean, attribute: false },
        };
    }

    get requiredFields() {
        return [...super.requiredFields, 'src'];
    }

    get warningFields() {
        return [
            ...super.warningFields,
            {
                fields: ['decorative', 'alt'],
                message: "'alt' attribute is missing. Provide descriptive text, or set 'decorative' to indicate the image is intentionally presentation-only.",
            },
        ];
    }

    constructor() {
        super();

        /** @type {string} Source URL of the image */
        this.src = '';
        /** @type {string} Responsive image candidates */
        this.srcset = '';
        /** @type {string} Slot size hints for srcset selection */
        this.sizes = '';
        /** @type {boolean} Whether the image is decorative and should render with empty alt text */
        this.decorative = false;
        /** @type {string} Text rendered when the image falls back after a load failure */
        this.fallbackText = '';
        /** @type {string} Alternative text for the image */
        this.alt = '';
        /** @type {number|string|null} Width of the image */
        this.width = null;
        /** @type {number|string|null} Height of the image */
        this.height = null;
        /** @type {'lazy'|'eager'} Loading behavior of the image */
        this.loading = 'lazy';
        /** @type {'async'|'sync'} Decoding behavior of the image */
        this.decoding = 'async';
        /** @type {'high'|'low'|'auto'|undefined} Fetch priority hint for the image request */
        this.fetchpriority = undefined;
        /** @type {boolean} Whether the image is currently showing its error fallback */
        this.hasError = false;
    }

    willUpdate(changedProperties) {
        super.willUpdate(changedProperties);

        if (changedProperties.has('src')) {
            this.hasError = false;
        }
    }

    onLoad(event) {
        this.hasError = false;
        this.dispatchCustomEvent('load', event);
    }

    onError(event) {
        this.hasError = Boolean(this.fallbackText);
        this.dispatchCustomEvent('error', event);
    }

    render() {
        const altText = this.decorative ? '' : this.alt;

        if (this.hasError && this.fallbackText) {
            return html`<span data-role="image-fallback-text">${this.fallbackText}</span>`;
        }

        return html`<img
            ${spread(this.getScopedAttrs('img'))}
            src=${this.src}
            srcset=${ifDefined(this.srcset)}
            sizes=${ifDefined(this.sizes)}
            alt=${altText}
            width=${ifDefined(this.width)}
            height=${ifDefined(this.height)}
            loading=${ifDefined(this.loading)}
            decoding=${ifDefined(this.decoding)}
            fetchpriority=${ifDefined(this.fetchpriority)}
            @load=${this.onLoad}
            @error=${this.onError}
        />`;
    }
}
