import { getMessages } from '../i18n/locale.js';

/**
 * @typedef {keyof import('../i18n/types.js').LocaleRegistry} LocaleKey
 * @typedef {import('./types.ts').MixinBase} MixinBase
 */

/**
 * @implements {MixinBase}
 */
export default class ControllerBase extends EventTarget {
    /**
     * DOM sorguları için yetkili referans düğüm.
     * @returns {HTMLElement | null}
     */
    get parentElement() {
        if (typeof this.options.parentElement === 'string') {
            const parent = this.host.querySelector(this.options.parentElement);
            if (!(parent instanceof HTMLElement)) {
                throw new Error(`[${this.componentName}]: Parent element '${this.options.parentElement}' was not found in the host.`);
            }
            return parent;
        }

        return this.options.parentElement || this.host || null;
    }

    /**
     * Stable component identifier for logs/errors (minify-safe).
     * @returns {string}
     */
    get componentName() {
        return this.options.componentName || this.host.localName || this.host.constructor.name;
    }

    /**
     * Current locale of the component, derived from the closest ancestor with a `lang` attribute. Updates automatically on `locale-change` events.
     */
    get lang() {
        return this.host.lang;
    }

    /**
     * Messages for the current locale, derived from the closest ancestor with a `lang` attribute.
     * @returns {Readonly<import('../i18n/types.js').LocaleMessages>}
     */
    get localeMessages() {
        return getMessages(/** @type {LocaleKey} */ (this.lang));
    }

    /**
     * @param {import('lit').ReactiveControllerHost & HTMLElement} host
     * @param {Object} [options]
     * @param {HTMLElement | string} [options.parentElement] DOM anchor or CSS selector resolved within the host on access.
     * @param {string} [options.componentName] Stable component identifier for logs/errors (minify-safe).
     * @param {string | import('lit').TemplateResult} [options.description] Description for the component, used for accessibility or informational purposes.
     */
    constructor(host, options = {}) {
        super();
        this.host = host;
        this.options = options;
        this.host?.addController?.(this);
    }

    hostConnected() {
        this.dispatchCustomEvent('connected');
    }

    /**
     * @param {PropertyKey} [name]
     * @param {unknown} [oldValue]
     */
    requestUpdate(name, oldValue) {
        this.host?.requestUpdate?.();
    }

    /**
     * Helper to dispatch custom events with consistent options and detail structure.
     * @param {string} eventName
     * @param {Event | null} [originalEvent]
     * @param {Record<string, unknown> | null} [data] - Additional data to include in event.detail
     */
    dispatchCustomEvent(eventName, originalEvent = null, data = null) {
        this.dispatchEvent(new CustomEvent(eventName, this.#eventInitDict(originalEvent, data)));
    }

    /**
     * @param {string} _prefix
     * @returns {Record<string, string>}
     */
    getScopedAttrs = _prefix => ({});

    #eventInitDict(originalEvent, data) {
        return {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: {
                ...data,
                originalEvent,
                synthetic: !(originalEvent && originalEvent instanceof Event),
            },
        };
    }
}
