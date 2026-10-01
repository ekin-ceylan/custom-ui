import WarningField from '../models/WarningField';
import ListboxItem from '../models/ListboxItem';
import type { nothing } from 'lit';

/** A generic type that represents any class constructor. */
export type Constructor<T> = new (...args: any[]) => T;

export interface SlotCollector {
    /**
     * Binds the collected nodes to their respective slot elements.
     * @param {(HTMLElement|Text)[]} collectedNodes - Collected nodes to bind to slots.
     * @protected
     */
    bindSlots(collectedNodes: (HTMLElement | Text)[]): void;

    /**
     * A hook that is called after slots have been bound.
     * Components can perform post-processing here (e.g., derive state from slot content).
     *
     * **Important:** If you modify reactive properties, you must call `requestUpdate()`
     * if Lit's reactivity doesn't automatically trigger it (e.g., direct assignments).
     * @param {boolean} hasProjectedContent Indicates if there is projected content in the slots.
     * @protected
     */
    afterSlotsBinded(hasProjectedContent: boolean): void;

    /**
     * A hook that validates nodes for slot binding.
     * Returns true if the node is valid and should be included in the slot, false otherwise.
     * @param {HTMLElement|Text} node The node to validate.
     * @param {string} slotName The name of the slot the node is intended for.
     * @protected
     */
    validateNode(node: HTMLElement | Text, slotName: string): boolean;
}

export interface PropValidator {
    /**
     * Gets the list of required field names.
     * Subclasses should override this to specify fields that must be set.
     * Throws an error if any required field is empty when validation runs.
     */
    get requiredFields(): string[];

    /**
     * Gets the list of warning field configurations.
     * Subclasses should override this to specify fields that trigger warnings.
     * A warning is logged if all fields in a configuration are empty or false.
     */
    get warningFields(): WarningField[];
}

export interface Listbox {
    /** Options currently displayed in the listbox. */
    options: ListboxItem[];
    /** Index of the active option, or -1 when no option is active. */
    activeIndex: number;
    /** Whether the listbox is positioned above its anchor. */
    directionUp: boolean;
    /** Current open state of the listbox. */
    open: boolean;
    /** Gets Listbox element's stable ID. */
    get listId(): string;
    /** Gets the listbox element within the component's render root. */
    get listboxElement(): HTMLElement | null;

    /** Opens the listbox, locks page scrolling, and positions it against its anchor. */
    openList(): void;
    /** Closes the listbox, unlocks page scrolling, and resets the active index. */
    closeList(): void;
    /** Positions the listbox against its anchor within the viewport. */
    setListPosition(): void;
    /** Scrolls the active item into view, falling back to the first option. */
    scrollToActive(instant?: boolean): void;
    /**
     * Handles the click event on a listbox option.
     * @abstract
     */
    onOptionClick(optionId: number | string): void;
    /**
     * Handles the hover event on a listbox option.
     * @abstract
     */
    onOptionHover(optionId: number | string): void;
    /** Calls the method to request the listbox to close. */
    onRequestClose(): void;

    /**
     * Renders the indicator icon for the control, typically a chevron or arrow, indicating that the control can be expanded or collapsed.
     * This method can be overridden in subclasses to provide a custom indicator.
     */
    renderIndicator(): import('lit').TemplateResult | typeof nothing;

    /** Renders the content of the listbox. */
    renderListContent(): import('lit').TemplateResult | typeof nothing;

    /** Renders the listbox and its items. */
    renderListBox(): import('lit').TemplateResult | typeof nothing;
}
