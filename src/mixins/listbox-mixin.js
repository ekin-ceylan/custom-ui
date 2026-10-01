import { html, nothing } from 'lit';
import { lockAllScrolls, unlockAllScrolls } from '../modules/scroll-lock-helper.js';
import ListboxItem from '../models/ListboxItem.js';
import { generateUniqueId } from '../modules/unique-id-generator.js';

/**
 * @typedef {import('../base/light-component-base.js').default} LightComponentBase
 */

/**
 * @template T
 * @typedef {import('./types.js').Constructor<T>} Constructor
 */

/**
 * @typedef {Constructor<LightComponentBase> & { properties: import('lit').PropertyDeclarations }} LightComponentBaseConstructor
 */

/**
 * @typedef {import('./types.js').Listbox} Listbox
 */

/**
 * Mixin that adds listbox functionality to a component, including managing options, active index, and open/close state.
 *
 * @template {LightComponentBaseConstructor} TBase
 * @param {TBase} Base - The base class to extend
 * @category mixins
 * @returns {TBase & Constructor<Listbox>}
 */
export default function ListboxMixin(Base) {
    return class Listbox extends Base {
        static get properties() {
            return {
                ...super.properties,
                open: { type: Boolean, attribute: false }, // Açık / kapalı
                options: { type: Array, attribute: false, noAccessor: true },
                activeIndex: { type: Number, state: true, attribute: false },
                directionUp: { type: Boolean, attribute: false, reflect: false }, // açılır kutu yönü
            };
        }

        /** @type {Array<ListboxItem>} */
        #options = [];
        #uniqueId = generateUniqueId();

        get options() {
            return this.#options;
        }
        set options(value) {
            this.#options = value;
            this.requestUpdate('options', value);
            if (this.open) this.setListPosition();
        }

        get listId() {
            return `${this.componentName}-list-${this.#uniqueId}`;
        }

        /**
         * Gets the listbox element within the component's render root.
         * @returns {HTMLElement | null}
         */
        get listboxElement() {
            return this.renderRoot?.querySelector(`#${this.listId}`) || null;
        }

        constructor(...args) {
            super(...args);

            /** @type {boolean} */
            this.open = false;
            /** @type {Number} */
            this.activeIndex = -1;
            /** @type {boolean} */
            this.directionUp = false;
        }

        disconnectedCallback() {
            super.disconnectedCallback?.();
            this.#unlockBody();
        }

        /** Opens the listbox, locks page scrolling, and positions it against its anchor. */
        openList() {
            if (this.open) return;
            this.open = true;
            this.listboxElement?.showPopover();
            this.#lockBody();
            this.setListPosition();
            this.dispatchCustomEvent('open');
            this.activeIndex = 0;
            this.scrollToActive(true);
        }

        /** Closes the listbox, unlocks page scrolling, and resets the active index. */
        closeList() {
            this.open = false;
            this.listboxElement?.hidePopover();
            this.#unlockBody();
            this.activeIndex = -1;
            this.dispatchCustomEvent('close');
        }

        /** Positions the listbox against its anchor within the viewport. */
        setListPosition() {
            requestAnimationFrame(() => {
                const listbox = this.listboxElement;
                const anchor = listbox.parentElement;

                const rect = anchor.getBoundingClientRect();
                listbox.style.removeProperty('max-height');

                const style = globalThis.getComputedStyle(listbox);
                const maxHeight = Number.parseFloat(style.maxHeight) || window.innerHeight;
                const borderTop = Number.parseFloat(style.borderTopWidth) || 0;
                const borderBottom = Number.parseFloat(style.borderBottomWidth) || 0;

                const topEdge = rect.top;
                const bottomEdge = rect.bottom;
                const leftEdge = Math.max(0, rect.x);
                const minWidth = Math.min(0, rect.x) + rect.width;
                const borderY = borderTop + borderBottom;
                const spaceBelow = window.innerHeight - bottomEdge;
                const spaceAbove = topEdge;
                const listHeight = Math.min(listbox.scrollHeight + borderY, maxHeight);
                const directionUp = spaceBelow < listHeight && spaceAbove > spaceBelow;

                if (directionUp) {
                    const effectiveHeight = Math.min(listHeight, spaceAbove);
                    listbox.style.maxHeight = `${effectiveHeight}px`;
                    listbox.style.bottom = `${window.innerHeight - topEdge}px`;
                    listbox.style.removeProperty('top');
                } else {
                    const effectiveHeight = Math.min(listHeight, spaceBelow);
                    listbox.style.maxHeight = `${effectiveHeight}px`;
                    listbox.style.top = `${bottomEdge}px`;
                    listbox.style.removeProperty('bottom');
                }

                listbox.style.minWidth = `${minWidth}px`;
                listbox.style.left = `${leftEdge}px`;

                if (this.directionUp !== directionUp) {
                    this.directionUp = directionUp;
                }

                this.requestUpdate();
            });
        }

        /**
         * Scrolls the active item into view, falling back to the first option.
         * @param {boolean} [instant=false]
         */
        scrollToActive(instant = false) {
            requestAnimationFrame(() => {
                const listbox = this.listboxElement;
                if (!listbox?.isConnected) return;

                const option = listbox.querySelector('[role="option"][data-active]') || listbox.querySelector('div:nth-child(1 of [role="option"])');

                if (!option) return;

                const optionRect = option.getBoundingClientRect();
                const listRect = listbox.getBoundingClientRect();
                const offset = optionRect.top - listRect.top;
                const scroll = listbox.scrollTop + (offset - listRect.height / 2 + optionRect.height / 2);
                listbox.scrollTo({ top: scroll, behavior: instant ? 'auto' : 'smooth' });
            });
        }

        // #region EVENT LISTENERS

        /**
         * Handles the click event on a listbox option.
         * @param {number|string} optionId
         * @abstract
         */
        onOptionClick(optionId) {
            throw new Error('onOptionClick method must be implemented by the subclass.');
        }

        /**
         * Handles the hover event on a listbox option.
         * @param {number|string} optionId
         * @abstract
         */
        onOptionHover(optionId) {
            throw new Error('onOptionHover method must be implemented by the subclass.');
        }

        onRequestClose() {
            this.closeList();
        }

        #onListboxMouseover(e) {
            const optionId = this.#getOptionIdFromEvent(e);
            this.onOptionHover(optionId);
        }

        /**
         * Handles the click event on the listbox.
         * @param {MouseEvent} e
         */
        #onListboxClick(e) {
            const optionId = this.#getOptionIdFromEvent(e);
            this.onOptionClick(optionId);
        }

        #onPointerDownOutside(e) {
            const path = e.composedPath();

            if (!path.includes(this.listboxElement.parentElement)) {
                this.onRequestClose();
            }
        }

        // #endregion EVENT LISTENERS

        // #region PRIVATE METHODS
        #lockBody() {
            lockAllScrolls(this.listboxElement, this.onRequestClose.bind(this));
            globalThis.addEventListener('pointerdown', this.#onPointerDownOutside.bind(this), { capture: true });
        }

        #unlockBody() {
            unlockAllScrolls(this.listboxElement);
            globalThis.removeEventListener('pointerdown', this.#onPointerDownOutside.bind(this), { capture: true });
        }

        /**
         * Resolves option and index from a delegated listbox event.
         * @param {Event} event
         * @returns {string} The ID of the option element that was interacted with.
         */
        #getOptionIdFromEvent(event) {
            const target = /** @type {HTMLElement} */ (event.target);
            const optionElement = target?.closest('[role="option"]');

            return optionElement?.id || '';
        }

        // #endregion PRIVATE METHODS

        /**
         * Renders the indicator icon for the control, typically a chevron or arrow, indicating that the control can be expanded or collapsed.
         * This method can be overridden in subclasses to provide a custom indicator.
         * @returns {import('lit').TemplateResult | typeof nothing}
         */
        renderIndicator() {
            return html`<svg role="presentation" data-chevron width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>`;
        }

        /**
         * Renders the content of the listbox.
         * @category rendering
         * @returns {import('lit').TemplateResult | typeof nothing}
         */
        renderListContent() {
            return html`${this.options.map((o, i) => o.renderListboxItem(i === this.activeIndex))}`;
        }

        /**
         * Renders the listbox and its items.
         * @returns {import('lit').TemplateResult | typeof nothing}
         */
        renderListBox() {
            return html`<div
                id=${this.listId}
                role="listbox"
                popover="manual"
                aria-expanded=${this.open ? 'true' : 'false'}
                @click=${this.#onListboxClick}
                @mousedown=${e => e.preventDefault()}
                @mouseover=${this.#onListboxMouseover}
            >
                ${this.renderListContent()}
            </div>`;
        }
    };
}

// field, condition, message, warntype
