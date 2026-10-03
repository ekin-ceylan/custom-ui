import { html, nothing } from 'lit';
import TextControlBase from '../../base/text-control-base.js';
import SlotCollectorMixin from '../../mixins/slot-collector-mixin.js';
import ListboxMixin from '../../mixins/listbox-mixin.js';
import Suggestion from '../../models/Suggestion.js';
import SuggestionOption from '../parts/suggestion-option.js';
import Keys from '../../enums/Keys.js';
import { ifDefined } from '../../modules/utilities.js';
import { mixins } from '../../modules/mixin-utils.js';
import { generateUniqueId } from '../../modules/unique-id-generator.js';
import MaskPlaceholderMixin from '../../mixins/mask-placeholder-mixin.js';

export default class Autocomplete extends mixins(TextControlBase, SlotCollectorMixin, ListboxMixin, MaskPlaceholderMixin) {
    // #region STATICS, FIELDS, GETTERS

    static get properties() {
        return {
            ...super.properties,
            filter: { type: String, state: true, attribute: false }, // Filtre metni
            filterThreshold: { type: Number, attribute: 'filter-threshold' }, // Filtrenin başlaması için gereken minimum karakter sayısı
            inputMask: { type: String, state: true, attribute: false }, // Input mask value
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
        return this.#options.length ? this.#options : this.#optionList; // SLOT ÜZERİNDEN GELİYORSA OPTIONS BOŞ OLUYOR !!
    }
    set options(val) {
        if (!Array.isArray(val)) {
            throw new TypeError('options must be an array');
        }

        this.#options = val;
        this.#optionList = this.options.map(this.#toListElement.bind(this));

        this.requestUpdate();
        if (this.open) this.setListPosition();
    }

    // #endregion STATICS, FIELDS, GETTERS

    // #region LIFECYCLE METHODS

    constructor() {
        super();

        /** @type {string} */
        this.filter = '';
        /** @type {Number} */
        this.filterThreshold = 1;

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
    // #endregion LIFECYCLE METHODS

    // #region INTERNAL HOOKS
    /** @inheritdoc */
    validateNode(node, slotName) {
        if (slotName != 'default') return true;

        const hasOptions = this.#options?.length > 0;
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

    /** @override */
    openList() {
        if (this.filteredOptions.length === 0) return;
        if (!this.filterHasEnoughChars) return;
        super.openList();
    }

    closeList() {
        super.closeList();
        this.inputMask = '';
    }

    // #region EVENT LISTENERS

    #onInput(e) {
        e.stopPropagation();
        this.filter = e.target.value;

        if (this.filterHasEnoughChars) {
            this.dispatchCustomEvent('search', e);
            this.openList();
        }

        if (this.filteredOptions.length === 0) {
            this.closeList();
            return;
        }

        this.setListPosition();
        this.activeIndex = 0;
        this.scrollToActive();
    }

    /** @param {KeyboardEvent} e */
    #onKeydown(e) {
        if (e.target === this.clearButton) return;
        const keyCode = e.code;

        if (keyCode === Keys.ESCAPE) {
            this.closeList();
        } else if (!this.open) {
            this.#closedKeyboardBehavior(e, keyCode);
        } else if (this.open) {
            this.#openKeyboardBehavior(e, keyCode);
        }
    }

    /** @override Handles the click event on an option. */
    onOptionClick(optionId) {
        const option = this.#optionList.find(opt => opt.id === optionId);
        if (!option || option.disabled) return;

        this.#onSelect(option);
        this.closeList();
    }

    /** @override Handles the hover event on a listbox option. */
    onOptionHover(optionId) {
        const index = this.filteredOptions.findIndex(opt => opt.id === optionId);
        if (index < 0) return;

        this.activeIndex = index;
    }

    // #endregion EVENT LISTENERS

    // #region PRIVATE METHODS

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
            this.scrollToActive();
        } else if (keyCode === Keys.TAB || keyCode === Keys.ENTER) {
            e.preventDefault();
            this.#selectActiveOption();
            this.closeList();
        }
    }

    #closedKeyboardBehavior(e, keyCode) {
        const isArrowKey = keyCode === Keys.ARROW_DOWN || keyCode === Keys.ARROW_UP;

        // Listeyi aç
        if (isArrowKey) {
            e.preventDefault();
            this.openList();
            this.#openKeyboardBehavior(e, keyCode);
        }
    }

    /**
     * Converts a Suggestion into a div element.
     * @param {Suggestion} opt
     * @param {number} i
     * @returns {import('lit').TemplateResult}
     */
    #optToDiv(opt, i) {
        const isActive = this.activeIndex === i;

        return opt.renderListboxItem(isActive);
    }

    /**
     * Parses an SuggestionOption into a Suggestion object.
     * @param { SuggestionOption } opt
     * @returns {Suggestion}
     */
    #parseOption(opt) {
        const suggestion = new Suggestion(opt);
        suggestion.id = `option-${generateUniqueId()}`;

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

    /** @override Renders the content of the list, including the "no options" item and the list of options. */
    renderListContent() {
        return html`${this.filteredOptions.map(this.#optToDiv.bind(this))}`;
    }

    /**
     * @override Renders the container content including the input mask.
     * @category rendering
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderContainerContent() {
        const superContent = super.renderContainerContent();
        return html`${superContent}${this.renderListBox()}${this.renderMaskPlaceholder(this.value, this.inputMask)}`;
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
                aria-controls=${this.listId}
                aria-expanded=${this.open}
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
