import { nothing } from 'lit';

export function injectStyles(styleId, styleText) {
    if (!styleId || !styleText || document.getElementById(styleId)) {
        return;
    }

    const clean = cleanupStyles(styleText);
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = clean;
    document.head.appendChild(style);
}

/**
 * Cleans up CSS style text by removing unnecessary whitespace and formatting.
 * Removes newlines, leading/trailing spaces, and normalizes spacing around CSS syntax characters.
 *
 * @param {string} styleText - The CSS style text to clean up.
 * @returns {string} The cleaned and minified CSS style text.
 */
export function cleanupStyles(styleText) {
    return styleText
        .replaceAll(/(^\s+)|\n|(\s+$)/gm, '') // Remove newlines and leading/trailing spaces
        .replaceAll(/\s*;?\s*}\s*/g, '}') // Remove any unnecessary spaces around '}' and the last ';'
        .replaceAll(/\s*{\s*/g, '{') // Remove unnecessary spaces around '{'
        .replaceAll(/\s*:\s*/g, ':') // Remove unnecessary spaces around ':'
        .trim();
}

/**
 * Returns `undefined` if the value is `null` or `undefined`, otherwise returns the value itself.
 *
 * @template T
 * @param {T|null|undefined} val - The value to check.
 * @returns {T|typeof nothing} The original value or `undefined`.
 */
export function ifDefined(val) {
    return val === null || val === undefined ? nothing : val;
}

/**
 * Combines class names conditionally.
 * Accepts any number of arguments, which can be strings or objects.
 * - Strings are always included.
 * - Objects include keys with truthy values.
 *
 * @param {...(string|Object<string, boolean>)} args - Class names as strings or objects.
 * @returns {string} A space-separated string of class names.
 *
 * @example
 * classMap('foo', { bar: true, baz: false }) // "foo bar"
 */
export function classMap(...args) {
    return args
        .flatMap(arg =>
            typeof arg === 'string'
                ? [arg]
                : Object.entries(arg)
                      .filter(([_, val]) => val)
                      .map(([key]) => key)
        )
        .join(' ');
}

/**
 * Finds the last item in an array that matches the given predicate without creating a reversed copy.
 * Returns `undefined` if no item matches.
 *
 * @template T
 * @param {T[]} array
 * @param {(item: T, index: number, array: T[]) => boolean} predicate
 * @returns {T|undefined}
 */
export function findLastBy(array, predicate) {
    if (!Array.isArray(array) || typeof predicate !== 'function') return undefined;

    for (let index = array.length - 1; index >= 0; index--) {
        const item = array[index];
        if (predicate(item, index, array)) return item;
    }

    return undefined;
}

/**
 * Checks if a string is empty, `undefined`, or `null`.
 * @param {string|null|undefined} value The string to check.
 * @returns {boolean}
 */
export function isEmpty(value) {
    return value === '' || value === undefined || value === null;
}

/**
 * Defines a custom element if it is not already defined.
 * @param {string} name The name of the custom element.
 * @param {CustomElementConstructor} constructor The constructor of the custom element.
 */
export function defineComponent(name, constructor) {
    if (customElements.get(name) === constructor) return;
    customElements.define(name, constructor);
}

/**
 * Validates a Turkish Identification Number (TC Kimlik No).
 * The TC Kimlik No must be 11 digits long, cannot start with 0, and must satisfy specific checksum rules.
 * @param {string|number} value - The TC Kimlik No to validate.
 * @returns {boolean} True if the TC Kimlik No is valid, otherwise false.
 */
export function checkTcNo(value) {
    const valueStr = value.toString();
    const valueArr = Array.from(valueStr.split(''), x => Number(x));

    // sıfırla başlayamaz
    if (valueArr[0] === 0) {
        return false;
    }

    // 11 basamaklı olmalı, rakamlardan oluşmalı
    if (!/^\d{11}$/.test(valueStr)) {
        return false;
    }

    const totalOdd = valueArr.slice(0, 9).reduce((acc, item, i) => (i % 2 === 0 ? acc + item : acc), 0); // 1, 3, 5, 7 ve 9. rakamın toplamı
    const totalEven = valueArr.slice(1, 8).reduce((acc, item, i) => (i % 2 === 0 ? acc + item : acc), 0); // 2, 4, 6 ve 8. rakamın toplamı

    // 1, 3, 5, 7 ve 9. rakamın toplamının 7 katı ile 2, 4, 6 ve 8. rakamın toplamının 9 katının toplamının birler basamağı 10. rakamı vermeli
    if ((totalOdd * 7 + totalEven * 9) % 10 !== valueArr[9]) {
        return false;
    }

    // 1, 3, 5, 7 ve 9. rakamın toplamının 8 katının birler basamağı 11. rakamı vermektedir.
    return (totalOdd * 8) % 10 === valueArr[10];
}

/**
 * Formats a string by replacing placeholders with corresponding argument values.
 * Placeholders are in the format {0}, {1}, etc., where the number corresponds to the index of the argument.
 * If an argument is undefined or null, it will be replaced with an empty string.
 * @param {string} template - The string template containing placeholders.
 * @param {...any} args - The values to replace the placeholders with.
 * @returns {string} The formatted string with placeholders replaced by argument values.
 *
 * @example
 * stringFormat('Hello, {0}!', 'World') // "Hello, World!"
 * stringFormat('The value of {0} is {1}.', 'x', 10) // "The value of x is 10."
 */
export function stringFormat(template, ...args) {
    return String(template).replaceAll(/{(\d+)}/g, (_m, index) => {
        const value = args[Number(index)];
        return value === undefined || value === null ? '' : String(value).trim();
    });
}

/**
 * Extracts ARIA attributes and their values from a given HTML element and returns them as an object.
 * ARIA attributes are identified by the 'aria-' prefix. The returned object will have keys without the 'aria-' prefix and their corresponding values.
 * @param {HTMLElement} element
 * @returns {Record<string, string>}
 */
export function getAriaAttributesWithValues(element) {
    if (!element || !(element instanceof HTMLElement)) return {};

    return element
        .getAttributeNames()
        .filter(attr => attr.startsWith('aria-'))
        .reduce((obj, attr) => {
            obj[attr.replace('aria-', '')] = element.getAttribute(attr);
            return obj;
        }, {});
}

/**
 * Converts attribute-like names to kebab-case.
 * Examples: `ariaLabel` -> `aria-label`, `DataTestId` -> `data-test-id`.
 * @param {string} name
 * @returns {string}
 */
export function toKebabCase(name) {
    return String(name)
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

/**
 * Sanitizes HTML by removing potentially dangerous elements and attributes.
 * @param {string} raw - The raw HTML string to sanitize.
 * @returns {string} The sanitized HTML string.
 */
export function sanitizeHtml(raw) {
    const t = document.createElement('template');
    t.innerHTML = String(raw ?? '');

    const blockedTags = ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'];
    blockedTags.forEach(tag => t.content.querySelectorAll(tag).forEach(el => el.remove()));

    t.content.querySelectorAll('*').forEach(el => {
        [...el.attributes].forEach(attr => {
            const n = attr.name.toLowerCase();
            const v = String(attr.value || '')
                .trim()
                .toLowerCase();

            if (n.startsWith('on')) {
                el.removeAttribute(attr.name);
                return;
            }

            if (n === 'style') {
                el.removeAttribute('style');
                return;
            }

            if ((n === 'href' || n === 'src') && (v.startsWith('javascript:') || v.startsWith('data:text/html'))) {
                el.removeAttribute(attr.name);
            }
        });
    });

    return t.innerHTML;
}

const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

/**
 * Serializes a node like native textarea content: text is kept decoded, markup is rebuilt.
 * Comments are dropped to match slot semantics (only Element and Text are slottable).
 * @param {Node} node
 * @returns {string}
 */
export function nodeToString(node) {
    if (node instanceof Text) return node.data;
    if (!(node instanceof Element)) return '';

    const tag = node.localName;
    const attrs = Array.from(node.attributes, a => ` ${a.name}="${a.value}"`).join('');
    if (VOID_ELEMENTS.has(tag)) return `<${tag}${attrs}>`;

    const children = node instanceof HTMLTemplateElement ? node.content.childNodes : node.childNodes;
    return `<${tag}${attrs}>${Array.from(children, nodeToString).join('')}</${tag}>`;
}
