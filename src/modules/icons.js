import { spread } from '../modules/spread.js';
import { html, svg } from 'lit';

export const chevronDown = (strokeWidth = 2, attr = {}) => renderIcon(['M6 9l6 6l6 -6'], strokeWidth, attr);
export const eye = (strokeWidth = 2, attr = {}) =>
    renderIcon(['M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0', 'M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6'], strokeWidth, attr);
export const eyeOff = (strokeWidth = 2, attr = {}) =>
    renderIcon(
        [
            'M10.585 10.587a2 2 0 0 0 2.829 2.828',
            'M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87',
            'M3 3l18 18',
        ],
        strokeWidth,
        attr
    );
export const times = (strokeWidth = 2, attr = {}) => renderIcon(['M18 6l-12 12', 'M6 6l12 12'], strokeWidth, attr);

const icons = { chevronDown, eye, eyeOff, times };

/**
 * Renders an SVG icon with the given paths and stroke width.
 * @param {string[]} paths
 * @param {number} strokeWidth
 * @returns {import('lit').TemplateResult}
 */
function renderIcon(paths, strokeWidth = 2, attr = {}) {
    return html`<svg
        width="16"
        height="16"
        ${spread(attr)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width=${strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        ${paths.map(path => svg`<path d=${path}></path>`)}
    </svg>`;
}

export { renderIcon };
export default icons;
