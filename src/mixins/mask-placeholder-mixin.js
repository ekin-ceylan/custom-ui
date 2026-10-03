import { html, nothing } from 'lit';

/**
 * @typedef {import('../base/light-component-base.js').default} LightComponentBase
 */

/**
 * @template T
 * @typedef {import('./types.js').Constructor<T>} Constructor
 */

/**
 * @typedef {import('./types.js').MaskPlaceholder} MaskPlaceholder
 */

/** Adds overridable input-mask underlay rendering methods to text controls.
 * Apply this mixin to a `LightComponentBase` subclass, then call
 * `renderMaskPlaceholder(value, mask)` from that component's render method.
 * Nullish arguments are treated as empty strings; this mixin does not read the
 * component's `placeholder` property automatically.
 *
 * Override `renderMaskPlaceholderContent(currentValue, remainingPlaceholder)`
 * to customize the underlay content while preserving the default wrapper.
 *
 * @template {Constructor<LightComponentBase>} TBase
 * @param {TBase} Base - The text-control class to extend.
 * @category mixins
 * @returns {TBase & Constructor<MaskPlaceholder>}
 */
export default function MaskPlaceholderMixin(Base) {
    return class MaskPlaceholder extends Base {
        /**
         * Renders the entered-value prefix and the unmatched mask suffix.
         * Override this method to customize the underlay while keeping the
         * wrapper produced by `renderMaskPlaceholder()`.
         * @param {string} currentValue - The portion of the value already entered.
         * @param {string} remainingPlaceholder - The mask suffix after the entered value.
         * @returns {import('lit').TemplateResult | typeof nothing}
         */
        renderMaskPlaceholderContent(currentValue, remainingPlaceholder) {
            // prettier-ignore
            return html`<pre>${currentValue}</pre><pre>${remainingPlaceholder}</pre>`;
        }

        /**
         * Renders the mask (ghost text) as an aria-hidden underlay.
         * Returns `nothing` when both the entered value and remaining mask are empty.
         * This method does not add itself to the component render output; call it
         * from a render method or an overridable render hook.
         * @param {string | null | undefined} value - The current input value.
         * @param {string | null | undefined} placeholder - The mask pattern. Nullish values are treated as empty; the component's `placeholder` property is not read automatically.
         * @returns {import('lit').TemplateResult | typeof nothing}
         */
        renderMaskPlaceholder(value, placeholder) {
            const currentValue = value ?? '';
            const remainingPlaceholder = (placeholder ?? '').slice(currentValue.length);

            if (currentValue === '' && remainingPlaceholder === '') return nothing;

            return html`<div aria-hidden="true" data-role="underlay">${this.renderMaskPlaceholderContent(currentValue, remainingPlaceholder)}</div>`;
        }
    };
}
