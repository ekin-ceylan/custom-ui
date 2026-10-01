import { html, nothing } from 'lit';

/**
 * The rendered input mask content.
 * @returns {import('lit').TemplateResult | typeof nothing}
 */
function renderMaskPlaceholderContent(currentValue, remainingMask) {
    // prettier-ignore
    return html`<pre>${currentValue}</pre><pre>${remainingMask}</pre>`;
}

/**
 * Renders the input mask (ghost text) as an underlay behind the actual input value.
 * @param {string} value - The current input value.
 * @param {string} mask - The input mask pattern.
 * @returns {import('lit').TemplateResult | typeof nothing}
 */
export function renderMaskPlaceholder(value, mask) {
    const currentValue = value ?? '';
    const remainingMask = (mask ?? '').slice(currentValue.length);

    if (currentValue === '' && remainingMask === '') return nothing;

    return html`<div aria-hidden="true" data-role="underlay">${renderMaskPlaceholderContent(currentValue, remainingMask)}</div>`;
}
