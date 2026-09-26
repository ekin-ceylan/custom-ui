import TextControlBase from '../../base/text-control-base.js';
import SlotCollectorMixin from '../../mixins/slot-collector-mixin.js';
import InputMaskMixin from '../../mixins/input-mask-mixin.js';
import Suggestion from '../../models/Suggestion.js';
import SuggestionOption from '../parts/suggestion-option.js';
import { ifDefined } from '../../modules/utilities.js';
import Keys from '../../enums/Keys.js';
import { lockAllScrolls, unlockAllScrolls } from '../../modules/scroll-lock-helper.js';
import { mixins } from '../../modules/mixin-utils';
import { html, nothing } from 'lit';

export default class Autocomplete extends mixins(TextControlBase, InputMaskMixin, SlotCollectorMixin) {
    // #region STATICS, FIELDS, GETTERS

    static get properties() {
        return {
            ...super.properties,
            filter: { type: String, state: true, attribute: false }, // Filtre metni
            filterThreshold: { type: Number, attribute: 'filter-threshold' }, // Filtrenin başlaması için gereken minimum karakter sayısı
            activeIndex: { type: Number, state: true, attribute: false },
            directionUp: { type: Boolean, attribute: false, reflect: false }, // açılır kutu yönü
            open: { type: Boolean, attribute: false }, // Açık / kapalı
            options: { type: Array, attribute: false, noAccessor: true }, // Options array, can contain Suggestion objects
            //
            pattern: { type: String, reflect: true },
            allowPattern: { type: String, attribute: 'allow-pattern' },
            maxlength: { type: Number },
            minlength: { type: Number },
            max: { type: Number, reflect: true },
            min: { type: Number, reflect: true },
            autounmask: { type: Boolean },
            spellcheck: { type: Boolean, reflect: true },
        };
    }

    /** @type {Suggestion[]} */
    #optionList = [];
    /** @type {Array<object|string>} */
    #options = [];

    get filterHasEnoughChars() {
        return this.filter?.length >= (Number(this.filterThreshold) || 1);
    }

    get filteredOptions() {
        if (!this.filterHasEnoughChars) return [];

        return this.#optionList?.filter(opt => {
            const searchValue = this.filter?.toLowerCase() || '';
            const optionText = opt.suggestionText.toLowerCase();

            return optionText.startsWith(searchValue);
        });
    }

    get options() {
        return this.#options; // SLOT ÜZERİNDEN GELİYORSA OPTIONS BOŞ OLUYOR !!
    }
    set options(val) {
        if (!Array.isArray(val)) {
            throw new TypeError('options must be an array');
        }

        this.#options = val;
        this.#optionList = this.options.map(this.#toListElement.bind(this));

        this.requestUpdate();
        if (this.open) this.#calcListSizeAndDirection();
    }

    get listId() {
        return `${this.componentName}-list-${this.uniqueId}`;
    }

    // #endregion STATICS, FIELDS, GETTERS

    // #region LIFECYCLE METHODS

    constructor() {
        super();

        /** @type {boolean} */
        this.open = false;
        /** @type {string} */
        /** @type {Object|string[]} */
        this.options = [];
        /** @type {string} */
        this.filter = '';
        /** @type {Number} */
        this.filterThreshold = 1;
        /** @type {Number} */
        this.activeIndex = -1;

        this.inputMask = '';
        this.autocomplete = 'off';
    }

    firstUpdated(changed) {
        super.firstUpdated(changed);

        this.comboboxDiv = /** @type {HTMLDivElement} */ (this.renderRoot.querySelector('div[data-role="container"]'));
        this.listboxDiv = /** @type {HTMLDivElement} */ (this.renderRoot.querySelector('div[role="listbox"]'));
        this.clearButton = /** @type {HTMLButtonElement} */ (this.renderRoot.querySelector('button[data-role="clear"]'));
        this.inputElement.addEventListener('input', this.#onInput.bind(this));

        if (globalThis.getComputedStyle(this.listboxDiv).overscrollBehavior != 'contain') {
            this.listboxDiv.style.overscrollBehavior = 'contain';
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        if (this.open) {
            this.#unlockBody();
        }
    }
    // #endregion LIFECYCLE METHODS

    // #region INTERNAL HOOKS
    /** @inheritdoc */
    validateNode(node, slotName) {
        if (slotName != 'default') return true;

        const hasOptions = this.options?.length > 0;
        const isAllowedType = node instanceof SuggestionOption;

        if (hasOptions) {
            console.warn('Options are already set via property. Ignoring slotted nodes.');
            return false;
        }

        if (!isAllowedType) {
            console.error(`Only \`SuggestionOption\` is allowed as children of \`${this.tagName.toLowerCase()}\`.`);
            return false;
        }

        const option = this.#parseOption(node);
        this.#optionList.push(option);

        return false; // abort default slotting process
    }

    // #endregion INTERNAL HOOKS

    // #region EVENT LISTENERS

    #onInput(e) {
        e.stopPropagation();
        this.filter = e.target.value;

        if (this.filterHasEnoughChars) {
            this.dispatchCustomEvent('search', e);
            this.#openList();
        }

        if (this.filteredOptions.length === 0) {
            this.#closeList();
            return;
        }

        this.activeIndex = 0;
        this.#scrollToActive();
    }

    /** @param {KeyboardEvent} e */
    #onKeydown(e) {
        if (e.target === this.clearButton) return;
        const keyCode = e.code;

        if (keyCode === Keys.ESCAPE) {
            this.#closeList();
        } else if (!this.open) {
            this.#closedKeyboardBehavior(e, keyCode);
        } else if (this.open) {
            this.#openKeyboardBehavior(e, keyCode);
        }
    }

    #onOptionClick(option) {
        this.#onSelect(option);
        this.#closeList();
    }

    #onListboxClick(e) {
        const optionId = this.#getOptionIdFromEvent(e);
        const option = this.filteredOptions.find(opt => opt.id === optionId);
        if (!option || option.disabled) return;

        this.#onOptionClick(option);
    }

    #onListboxMouseover(e) {
        const optionId = this.#getOptionIdFromEvent(e);
        const index = this.filteredOptions.findIndex(opt => opt.id === optionId);
        if (index < 0) return;

        this.activeIndex = index;
    }

    #onPointerDownOutside = e => {
        const path = e.composedPath();

        if (!path.includes(this.comboboxDiv)) {
            this.#closeList();
        }
    };

    // #endregion EVENT LISTENERS

    // #region PRIVATE METHODS

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

    /**
     * Handles option selection.
     * @param {Suggestion} selectedOption
     */
    #onSelect(selectedOption, emitEvents = true) {
        const value = selectedOption?.suggestionText;
        this.value = value ?? '';
        this.inputElement.value = this.value;

        if (emitEvents) {
            this.dispatchCustomEvent('input');
            this.dispatchCustomEvent('change');
        }
    }

    #openList() {
        if (this.open) return;
        if (this.filteredOptions.length === 0) return;
        if (!this.filterHasEnoughChars) return;
        this.open = true;
        this.listboxDiv?.showPopover();
        this.#lockBody();
        this.#calcListSizeAndDirection();
        this.dispatchCustomEvent('open');
        this.activeIndex = 0;
        this.#scrollToActive(true);
    }

    #closeList() {
        this.open = false;
        this.listboxDiv?.hidePopover();
        this.#unlockBody();
        this.activeIndex = -1;
        this.inputMask = '';
        this.dispatchCustomEvent('close');
    }

    #scrollToActive(instant = false) {
        requestAnimationFrame(() => {
            const listbox = this.renderRoot.querySelector('div[role="listbox"]');
            const option =
                this.renderRoot.querySelector('div[role="listbox"] div[role="option"][data-active]') ||
                this.renderRoot.querySelector('div[role="listbox"] div:nth-child(1 of [role="option"])');

            if (!option || !listbox) return;

            const optionRect = option.getBoundingClientRect();
            const listRect = listbox.getBoundingClientRect();
            const offset = optionRect.top - listRect.top;
            const scroll = listbox.scrollTop + (offset - listRect.height / 2 + optionRect.height / 2);
            listbox.scrollTo({ top: scroll, behavior: instant ? 'auto' : 'smooth' });
        });

        this.inputMask = this.filteredOptions[this.activeIndex]?.suggestionText || '';
    }

    #lockBody() {
        lockAllScrolls(this.listboxDiv, this.#closeList);
        globalThis.addEventListener('pointerdown', this.#onPointerDownOutside, { capture: true });
    }

    #unlockBody() {
        unlockAllScrolls(this.listboxDiv);
        globalThis.removeEventListener('pointerdown', this.#onPointerDownOutside, { capture: true });
    }

    #getAdjacentIndex(next) {
        const direction = next ? 1 : -1;
        const length = this.filteredOptions.length;
        let idx = (this.activeIndex + direction + length) % length;

        while (this.filteredOptions[idx]?.disabled) {
            idx += direction;
        }

        return this.filteredOptions[idx] ? idx : this.activeIndex;
    }

    #selectActiveOption() {
        const option = this.filteredOptions[this.activeIndex];
        if (option) this.#onSelect(option);
    }

    #openKeyboardBehavior(e, keyCode) {
        const isArrowKey = keyCode === Keys.ARROW_DOWN || keyCode === Keys.ARROW_UP;

        if (isArrowKey) {
            e.preventDefault();
            this.activeIndex = this.#getAdjacentIndex(keyCode === Keys.ARROW_DOWN);
            this.#scrollToActive();
        } else if (keyCode === Keys.TAB || keyCode === Keys.ENTER) {
            e.preventDefault();
            this.#selectActiveOption();
            this.#closeList();
        }
    }

    #closedKeyboardBehavior(e, keyCode) {
        const isArrowKey = keyCode === Keys.ARROW_DOWN || keyCode === Keys.ARROW_UP;

        // Listeyi aç
        if (isArrowKey) {
            e.preventDefault();
            this.#openList();
            this.#openKeyboardBehavior(e, keyCode);
        }
    }

    #calcListSizeAndDirection() {
        requestAnimationFrame(() => {
            const rect = this.comboboxDiv.getBoundingClientRect();
            const listbox = this.listboxDiv;
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

            this.directionUp = spaceBelow < listHeight && spaceAbove > spaceBelow;

            if (this.directionUp) {
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
            this.requestUpdate();
        });
    }

    /**
     * Converts a Suggestion into a div element.
     * @param {Suggestion} opt
     * @param {number} i
     * @returns {import('lit').TemplateResult}
     */
    #optToDiv(opt, i) {
        const isActive = this.activeIndex === i;

        return opt.toHtml(isActive);
    }

    /**
     * Parses an SuggestionOption into a Suggestion object.
     * @param { SuggestionOption } opt
     * @returns {Suggestion}
     */
    #parseOption(opt) {
        const suggestion = new Suggestion(opt);
        suggestion.id = `option-${this.generateUniqueId()}`;

        return suggestion;
    }

    #toListElement(raw) {
        if (raw instanceof SuggestionOption || typeof raw === 'object') {
            return this.#parseOption(raw);
        }

        if (typeof raw === 'string' || typeof raw === 'number') {
            const opt = /** @type {SuggestionOption} */ ({ suggestionText: String(raw) });
            return this.#parseOption(opt);
        }

        throw new TypeError(`Invalid option entry: ${String(raw)}`);
    }

    // #endregion PRIVATE METHODS

    // #region RENDER METHODS

    renderListContent() {
        return html`${this.filteredOptions.map(this.#optToDiv.bind(this))}`;
    }

    renderListBox() {
        return html`<div
            id=${this.listId}
            role="listbox"
            popover="manual"
            aria-expanded=${this.open ? 'true' : 'false'}
            @click=${this.#onListboxClick}
            @mouseover=${this.#onListboxMouseover}
        >
            ${this.renderListContent()}
        </div>`;
    }

    /**
     * @override Renders the container content including the input mask.
     * @category rendering
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderContainerContent() {
        const superContent = super.renderContainerContent();
        return html`${superContent}${this.renderListBox()}${this.renderInputMask()}`;
    }

    /**
     * @override
     * @protected
     * @category rendering
     * @returns {import('lit').TemplateResult}
     */
    render() {
        const activeDescendantId = this.filteredOptions[this.activeIndex]?.id;

        return html`${this.renderLabel()}
            <div
                role="combobox"
                data-role="container"
                aria-activedescendant=${ifDefined(activeDescendantId)}
                aria-disabled=${this.disabled ? 'true' : 'false'}
                ?data-open=${this.open}
                ?data-filtered=${!!this.filter}
                ?data-has-value=${this.inputElement?.value}
                ?data-up=${this.directionUp}
                @keydown=${this.#onKeydown}
            >
                ${this.renderContainerContent()}
            </div>
            ${this.renderErrorMessage()}`;
    }

    // #endregion RENDER METHODS
}

// allow yerine no-custom-input
// Eğer kullanıcı “contains” arama isterse, bunun bir ayrı davranış olarak matchMode/searchMode olarak eklenmesi daha doğru olur.
// kapalıyken aşağı tıklanır yeterince metin varsa combo açılır
// proramatik atama seçeneklerde yoksa?
// custom OPTION için yenisini yaz
// gruplama desteklenecek
