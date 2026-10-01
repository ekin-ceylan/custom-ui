import { html, nothing } from 'lit';
import { findLastBy, ifDefined } from '../../modules/utilities.js';
import ComboOption from '../../models/ComboOption.js';
import CustomOption from '../parts/custom-option.js';
import Keys from '../../enums/Keys.js';
import { generateUniqueId } from '../../modules/unique-id-generator.js';
import { mixins } from '../../modules/mixin-utils.js';
import StandardControlBase from '../../base/standard-control-base.js';
import SlotCollectorMixin from '../../mixins/slot-collector-mixin.js';
import ListboxMixin from '../../mixins/listbox-mixin.js';

/**
 * Custom lookup component that extends OptionControlBase to provide a searchable dropdown list of options. It supports both native and custom behaviors, allowing for flexible usage in various contexts.
 * - Can be used after defining like `defineElement('lookup', Lookup)` or `customElement.define('lookup', Lookup)`.
 * - The `options` property accepts an array of option objects or HTMLOptionElements to populate the dropdown list.
 * - The `value` property reflects the currently selected option's value, and the `selectedOption` property provides the full option object.
 * - The component includes built-in filtering functionality, allowing users to search through options by typing in the input field.
 */
export default class Lookup extends mixins(StandardControlBase, ListboxMixin, SlotCollectorMixin) {
    // #region STATICS, FIELDS, GETTERS

    static get properties() {
        return {
            ...super.properties,
            selectedOption: { type: Object, state: true, attribute: false }, // internal
            filter: { type: String, state: true, attribute: false }, // Filtre metni
            filterThreshold: { type: Number, attribute: 'filter-threshold' }, // Filtrenin başlaması için gereken minimum karakter sayısı
            noOptionsLabel: { type: String, attribute: 'no-options-label' },
        };
    }

    /** @type {ComboOption[]} */
    #optionList = [];
    /** @type {ComboOption | null} */
    #selectedOption = null;
    /** @type {Array<object|string>} */
    #options = [];
    #focused = false;

    #cachedInput = undefined;
    #initialValue = undefined;

    get filterHasEnoughChars() {
        return this.filter?.length >= (Number(this.filterThreshold) || 1);
    }

    get filteredOptions() {
        if (!this.filterHasEnoughChars) {
            return [];
        }

        return this.#optionList?.filter(opt => {
            const searchValue = this.filter?.toLocaleLowerCase(this.lang) || '';
            const optionText = opt.label.toLocaleLowerCase(this.lang);

            return optionText.includes(searchValue);
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

        const opt = findLastBy(this.#optionList, opt => opt.selected);
        this.#onSelect(opt || null, false, !this.#focused);

        if (this.open) this.setListPosition();
        this.requestUpdate();
    }

    get searchId() {
        return `${this.componentName}-search-${this.uniqueId}`;
    }

    /**
     * Returns the reference to the native input element within the component. Caches the reference after the first query for performance optimization.
     * @returns {HTMLInputElement | null}
     */
    get inputElement() {
        if (this.#cachedInput == undefined) {
            this.#cachedInput = this.renderRoot.querySelector('input[data-role="value"]');
        }

        return this.#cachedInput;
    }

    get resetValue() {
        return this.getAttribute('value') || this.#initialValue || '';
    }

    // #endregion STATICS, FIELDS, GETTERS

    // #region LIFECYCLE METHODS

    constructor() {
        super();

        /**
         * Stores the currently selected option info, which includes both the value and label. This property is updated whenever a new option is selected, providing easy access to the full details of the selected option for use in event handlers or other logic.
         * @type {{ value: string, label: string } | null}
         */
        this.selectedOption = null;
        /** @type {string} */
        this.filter = '';
        /** @type {Number} */
        this.filterThreshold = 1;
        /** @type {string} */
        this.noOptionsLabel = this.localeMessages?.noOptionsLabel;
    }

    firstUpdated(changed) {
        super.firstUpdated(changed);

        this.searchElement = /** @type {HTMLInputElement} */ (this.renderRoot.querySelector('input[data-role="search"]'));
        this.containerDiv = /** @type {HTMLDivElement} */ (this.renderRoot.querySelector('div[data-role="container"]'));
        this.listboxDiv = /** @type {HTMLDivElement} */ (this.renderRoot.querySelector('div[role="listbox"]'));
        this.clearButton = /** @type {HTMLButtonElement} */ (this.renderRoot.querySelector('button[data-role="clear"]'));

        // this.#setInputAndDisplay(this.#selectedOption);
        this.inputElement.value = this.#selectedOption?.value || '';
        this.filter = this.#selectedOption?.displayText || '';

        if (globalThis.getComputedStyle(this.listboxDiv).overscrollBehavior != 'contain') {
            this.listboxDiv.style.overscrollBehavior = 'contain';
        }
    }

    willUpdate(changed) {
        super.willUpdate(changed);

        const matchedOption = this.#optionList.find(o => o.value == this.value) || null;

        if (this.#optionList.length && !matchedOption) {
            this.value = '';
        }
    }

    // #endregion LIFECYCLE METHODS

    /** @inheritdoc */
    validateNode(node, slotName) {
        if (slotName != 'default') return true;

        const hasOptions = this.#options?.length > 0;
        const isAllowedType = node instanceof HTMLOptionElement || node instanceof CustomOption;

        if (hasOptions) {
            console.warn('Options are already set via property. Ignoring slotted nodes.');
            return false;
        }

        if (!isAllowedType) {
            console.error(`Only \`HTMLOptionElement\` and \`CustomOption\` are allowed as children of \`${this.tagName.toLowerCase()}\`.`);
            return false;
        }

        const option = this.#parseOption(node);
        this.#optionList.push(option);

        if (option.selected) {
            this.#initialValue = option.value;
            this.#onSelect(option, false);
        }

        return false; // abort default slotting process
    }

    /** @override @protected */
    setupFirstInteraction() {
        // programatik atama etkiler mi native ile dene
        this.addEventListener('open', _e => this.dispatchCustomEvent('first-interaction'), { once: true });
    }

    /** @override @protected */
    valueUpdated() {
        const matchedOption = this.#optionList.find(o => o.value == this.value) || null;
        this.#onSelect(matchedOption, false);
        this.#checkValidity();

        return true;
    }

    /** @override */
    openList() {
        if (!this.filterHasEnoughChars) return;
        super.openList();
        this.activeIndex = this.filteredOptions.indexOf(this.#selectedOption);
        this.scrollToActive(true);
    }

    // #region EVENT LISTENERS

    #onBlurSearch(_e) {
        this.#focused = false;
        this.filter = this.#selectedOption?.displayText || '';
        this.#checkValidity(true);
    }

    // options değişirse value
    // selected

    #onFocusValue(e) {
        this.searchElement.focus();
    }

    #onInputSearch(e) {
        e.stopPropagation();
        this.filter = e.target.value;

        if (this.filterHasEnoughChars) {
            this.dispatchCustomEvent('search', e, { query: this.filter });
            this.openList();
        } else {
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
            e.preventDefault();
            this.closeList();
        } else if (!this.open) {
            this.#closedKeyboardBehavior(e, keyCode);
        } else if (this.open) {
            this.#openKeyboardBehavior(e, keyCode);
        }

        // yazmaya başladığımızda arama yapılır
    }

    #onInvalid(_e) {
        // e.preventDefault(); // mesaj baloncuğu çıkmaz
        this.#checkValidity(true);
    }

    /** @override Clears the current selection. */
    onClearClick(event) {
        super.onClearClick(event);
        this.#onSelect(null);
        this.containerDiv.focus();
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
     * @param {ComboOption} selectedOption
     */
    #onSelect(selectedOption, emitEvents = true, setFilter = true) {
        if (this.#selectedOption === selectedOption) {
            this.inputElement.value = selectedOption?.value || '';
            if (setFilter) this.filter = this.#selectedOption?.displayText || '';
            return;
        }

        if (this.#selectedOption) this.#selectedOption.selected = false;
        this.#selectedOption = selectedOption;

        if (this.#selectedOption) this.#selectedOption.selected = true;
        this.selectedOption = { value: selectedOption?.value, label: selectedOption?.displayText };
        this.inputElement.value = selectedOption?.value || '';
        if (setFilter) this.filter = this.#selectedOption?.displayText || '';
        this.value = selectedOption?.value ?? '';

        if (emitEvents) {
            this.dispatchCustomEvent('input');
            this.dispatchCustomEvent('change');
        }
    }

    /**
     * Checks the validity of the input and updates the validation message accordingly.
     * @param {boolean} force
     * @returns {boolean}
     */
    #checkValidity(force = false) {
        if (!this.interacted && !force) return true; // etkileşime girilmediyse

        const el = this.inputElement;
        const v = el.validity;

        el.setCustomValidity('');
        this.invalid = !v?.valid;
        this.validationMessage = v?.valueMissing ? this.requiredValidationMessage : '';
        el.setCustomValidity(this.validationMessage);
        this.dispatchCustomEvent('validate', null, { validationMessage: this.validationMessage });

        return !this.validationMessage;
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

    #selectActiveOption() {
        const option = this.filteredOptions[this.activeIndex];
        if (option) this.#onSelect(option);
    }

    /**
     * Gets the adjacent index based on the current active index.
     * @param {Boolean} next
     * @returns {number} The adjacent index.
     */
    #getAdjacentIndex(next) {
        const direction = next ? 1 : -1;
        let idx = this.activeIndex + direction;
        while (this.filteredOptions[idx]?.disabled) idx += direction;

        return this.filteredOptions[idx] ? idx : this.activeIndex;
    }

    /**
     * Parses an HTMLOptionElement or ComboOption into a plain object.
     * @param { HTMLOptionElement | CustomOption } opt
     * @returns {ComboOption}
     */
    #parseOption(opt) {
        const option = new ComboOption(opt);
        option.id = `option-${generateUniqueId()}`;
        if (this.value === opt.value) option.selected = true;

        return option;
    }

    /**
     * Converts a ComboOption into a div element.
     * @param {ComboOption} opt
     * @param {number} i
     * @returns {import('lit').TemplateResult}
     */
    #optToDiv(opt, i) {
        const isActive = this.activeIndex === -1 ? opt.selected : this.activeIndex === i;

        return opt.renderListboxItem(isActive);
    }

    #toListElement(raw) {
        if (raw instanceof HTMLOptionElement || raw instanceof CustomOption || typeof raw === 'object') {
            return this.#parseOption(raw);
        }

        if (typeof raw === 'string' || typeof raw === 'number') {
            const opt = /** @type {CustomOption} */ ({ value: String(raw) });
            return this.#parseOption(opt);
        }

        throw new TypeError(`Invalid option entry: ${String(raw)}`);
    }

    // #endregion PRIVATE METHODS

    /**
     * Renders the hidden value input field that holds the selected value.
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderValueInput() {
        return html`<input
            id=${this.fieldId}
            name=${ifDefined(this.name)}
            type="text"
            ?required=${this.required}
            ?disabled=${this.disabled}
            aria-labelledby=${ifDefined(this.labelId)}
            aria-label=${ifDefined(this.hideLabel ? this.label : undefined)}
            aria-errormessage=${ifDefined(this.errorId)}
            aria-required=${this.required ? 'true' : 'false'}
            aria-invalid=${ifDefined(this.ariaInvalid)}
            aria-readonly="true"
            @invalid=${this.#onInvalid}
            @focus=${this.#onFocusValue}
            data-role="value"
            tabindex="-1"
        />`;
    }

    /**
     * Renders the search input field for filtering options.
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderSearchInput() {
        const activeDescendantId = this.filteredOptions[this.activeIndex]?.id;

        return html`<input
            id=${this.searchId}
            type="search"
            ?disabled=${this.disabled}
            .value=${this.filter}
            .placeholder=${this.placeholder}
            autocomplete="off"
            spellcheck="false"
            data-role="search"
            role="combobox"
            aria-labelledby=${ifDefined(this.labelId)}
            aria-activedescendant=${ifDefined(activeDescendantId)}
            aria-controls=${this.listId}
            aria-expanded=${this.open}
            @blur=${this.#onBlurSearch}
            @input=${this.#onInputSearch}
            @focus=${() => (this.#focused = true)}
            @change=${e => e.stopPropagation()}
        />`;
    }

    /**
     * @override Renders the indicator icon for the control, typically a chevron or arrow, indicating that the control can be expanded or collapsed.
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderIndicator() {
        return nothing;
    }

    /**
     * Renders the content of the container element that wraps the value input, display element, search input, and other controls.
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderContainerContent() {
        return html`${this.renderValueInput()} ${this.renderSearchInput()} ${this.renderClearButton()} ${this.renderIndicator()} ${this.renderListBox()}`;
    }

    /**
     * Renders the "no options" item that is displayed when there are no filtered options available.
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderNoOptionsItem() {
        return html`<div aria-disabled ?hidden=${this.filteredOptions?.length > 0}>
            <slot name="no-options">${this.noOptionsLabel}</slot>
        </div>`;
    }

    /** @override Renders the content of the list, including the "no options" item and the list of options. */
    renderListContent() {
        return html`${this.renderNoOptionsItem()}${this.filteredOptions.map(this.#optToDiv.bind(this))}`;
    }

    /** @override @protected @returns {import('lit').TemplateResult} */
    render() {
        // prettier-ignore
        return html`
            ${this.renderLabel()}
            <div
                data-role="container"
                aria-disabled=${this.disabled ? 'true' : 'false'}
                ?data-open=${this.open}
                ?data-filtered=${!!this.filter}
                ?data-has-value=${this.inputElement?.value}
                ?data-up=${this.directionUp}
                tabindex="-1"
                @keydown=${this.#onKeydown}
            >
                ${this.renderContainerContent()}
            </div>
            ${this.renderErrorMessage()}
        `;
    }
}

// search forma dahil edilmemeli
// aria-activedescendant="opt-3"
// aria-controls
// value var ama seçeneklerde yok -> seçenekler güncellendiğinde vlaue eşleşmeli

// options güncellendiğinde, açık ise listbox calcListSizeAndDirection çağrılmalı
// readonly ekle

// reset için yeni case -> selected

// popover mekaniğini elden geçir: https://karlkoch.me/writing/on-anchored-interfaces/
