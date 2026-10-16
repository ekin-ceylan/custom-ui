/** A generic type that represents any class constructor. */
export type Constructor<T> = new (...args: any[]) => T;

type RenderContent = import('lit').TemplateResult | typeof import('lit').nothing | string;

export interface MixinBase extends EventTarget {
    get localeMessages(): Readonly<import('../i18n/types').LocaleMessages>;
    get componentName(): string;

    requestUpdate(name?: PropertyKey, oldValue?: unknown): void;
    dispatchCustomEvent(eventName: string, originalEvent?: Event | null, data?: Record<string, unknown> | null): void;

    /**
     * Collects host attributes that carry the given `prefix:` scope, strips
     * the prefix, and returns a plain object ready for the `spread` directive.
     *
     * Convention: write `prefix:attr-name="value"` on the custom element to
     * forward an attribute to a specific inner element without touching the host.
     */
    getScopedAttrs(prefix: string): Record<string, string>;
}

/** Type contract implemented by the form-control mixin.
 * @template {string | boolean | number} [TValue=string] The value type used by the form control.
 */
export declare class FormControl<TValue> {
    /** Gets the unique ID of the component. */
    get uniqueId(): string;

    /** Validation message to show for the form control. */
    validationMessage: string;

    /**
     * This is used to reset the form control to its initial state when the form is reset.
     * Subclasses can override this getter to provide a different reset value if needed.
     */
    get resetValue(): TValue;

    /**
     * Represents the native form control element (e.g., input, select) within the component.
     * MUST be overridden by subclasses to provide a reference to the native form control element.
     * This is required for value synchronization and native form validation to work correctly.
     */
    get inputElement(): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;

    /**
     * Indicates whether the input has been interacted with by the user.
     * This can be used to determine when to show validation messages.
     */
    get interacted(): boolean;

    /**
     * Convenience boolean API for generic "invalid" state. `true` maps to `ariaInvalid='true'`, `false` clears `ariaInvalid`.
     * Note: grammar/spelling should be set via ariaInvalid directly.
     */
    get invalid(): boolean;
    set invalid(value: boolean);

    /** Returns the unique ID for the form control element. */
    get fieldId(): string;

    /** Returns the unique ID for the label element. */
    get labelId(): string;

    /** Returns the unique ID for the error message element. */
    get errorId(): string | null;

    /**
     * Validation message to show when a required field is empty. By default, it uses a localized message based on the component's label.
     * Subclasses can override this getter to provide a custom message.
     */
    get requiredValidationMessage(): string;

    /** The name attribute of the form control. */
    name: string | undefined;

    /** The label associated with the form control. */
    label: string;

    /** The current value of the form control. */
    value: TValue;

    /** ARIA invalid state passed to the underlying control. */
    ariaInvalid: 'true' | 'grammar' | 'spelling' | undefined;

    /** Whether the form control is required. */
    required: boolean;

    /** Whether the form control is disabled. */
    disabled: boolean;

    /** Whether the form control is read-only. */
    readonly: boolean;

    /**
     * Runs after the component's first update to register first-interaction and form-reset handling.
     * @protected
     */
    protected onFormControlFirstUpdate(): void;

    /**
     * Sets up a mechanism to detect the user's first interaction with the component and dispatches a `first-interaction` custom event.
     * Subclasses MUST override this method to provide the logic for detecting the first user interaction with the component.
     * This is necessary for proper validation behavior, as the component should only show validation messages after the user has interacted with it.
     * @protected
     */
    protected setupFirstInteraction(): void;

    /**
     * Called when the `value` property or attribute of the component is updated.
     * Sets the native input element's value to match the component's `value` property.
     * Returns `true` if the value was updated, `false` if the native input element's value already matched the component's `value`.
     * Subclasses can override this method to react to value changes (e.g., for validation or side effects).
     * @protected
     */
    protected valueUpdated(): boolean;

    /** Clears the input value. */
    clear(): void;

    /** Clears the validation message and resets the `invalid` state. */
    clearValidation(): void;

    /** Resets the input value to its initial state, clears any validation messages, and resets the `interacted` state. */
    reset(): void;

    /**
     * Validates the input value. Updates the Validation Message and `invalid` state based on the validation result, and dispatches a `validate` custom event with the validation message.
     * @fires validate - Dispatched after validation is performed, with the `validationMessage` in the event detail.
     * @returns {boolean}
     */
    checkValidity(): boolean;

    /**
     * Validates the given value and returns a validation message if invalid.
     * Subclasses can override this method to provide custom validation logic.
     * @protected
     */
    protected validate(value: TValue): string;

    /**
     * Returns the HTML template for displaying validation error messages.
     * The span element includes ARIA attributes for accessibility and is hidden when no validation message exists.
     * @protected
     */
    protected renderErrorMessage(): import('lit').TemplateResult | typeof import('lit').nothing;
}

/** Type contract implemented by `CheckBoxMixin`. */
export declare class CheckBox {
    /** Whether the checkbox represents its checked value. */
    checked: boolean;

    /** Value assigned when the checkbox is checked. */
    checkedValue: string | boolean | number;

    /** Value assigned when the checkbox is unchecked. */
    uncheckedValue: string | boolean | number;

    /** Whether the checkbox is in its indeterminate state. */
    indeterminate: boolean;

    /** ID for the checkbox's descriptive content. */
    get descriptionId(): string;

    /** Normalizes an external value that matches neither checkbox state. */
    protected onBeforeValueUpdate(): void;

    /**
     * Checkbox state is synchronized separately from the native input's string value.
     * @protected
     */
    protected valueUpdated(): boolean;

    /** Configures first-interaction detection for checkbox input. */
    protected setupFirstInteraction(): void;

    /** Renders the content for the checkbox's descriptive slot. */
    protected renderDescriptionContent(): RenderContent;

    /** Renders the checkbox and its validation message. */
    protected render(): import('lit').TemplateResult;
}

export declare class StandardControl {
    /** Whether to hide the label visually. */
    hideLabel: boolean;

    /** Placeholder text for the input. */
    placeholder: string;

    /** Whether to show the clear button. */
    clearable: boolean;

    /** Label ID, or null when the label is hidden. */
    get labelId(): string | null;

    /** Clears the value and focuses the native input. */
    protected onClearClick(event: Event): void;

    /** Stops propagation for Enter and Space. */
    protected onClearKeyDown(event: KeyboardEvent): void;

    /** Returns the label content. */
    renderLabelContent(): RenderContent;

    /** Renders the label unless hideLabel is true. */
    protected renderLabel(): import('lit').TemplateResult | typeof import('lit').nothing;

    /** Returns the clear button content. */
    renderClearButtonContent(): RenderContent;

    /** Renders the clear button when enabled and editable. */
    protected renderClearButton(): import('lit').TemplateResult | typeof import('lit').nothing;
}

/** Type contract implemented by `TextControlMixin`. */
export declare class TextControl {
    /** The masked value displayed by the native input. */
    get maskedValue(): string | null;

    /** The raw value with masking removed. */
    get unmaskedValue(): string | null;

    /** The most recent key pressed in the input. */
    get lastKey(): string | null;

    /** Localized validation message for the minimum length constraint. */
    get minLengthValidationMessage(): string;

    /** Localized validation message for the maximum length constraint. */
    get maxLengthValidationMessage(): string;

    /** Localized validation message for the maximum value constraint. */
    get maxValueValidationMessage(): string;

    /** Localized validation message for the minimum value constraint. */
    get minValueValidationMessage(): string;

    /** Localized validation message for the pattern constraint. */
    get patternValidationMessage(): string;

    /** The native input element rendered by the text control. */
    get inputElement(): HTMLInputElement | null;

    /** The native input type, such as `text`, `email`, or `tel`. */
    type: string;

    /** The input mode hint, such as `numeric`, `decimal`, or `tel`. */
    inputmode: string | undefined;

    /** Regex source used to filter characters accepted by the input. */
    allowPattern: string | undefined;

    /** Regex source used to validate the complete input value. */
    pattern: string | undefined;

    /** The maximum number of characters allowed. */
    maxlength: number | undefined;

    /** The minimum number of characters required. */
    minlength: number | undefined;

    /** The maximum numeric value allowed. */
    max: number | undefined;

    /** The minimum numeric value allowed. */
    min: number | undefined;

    /** Whether the component exposes its unmasked value for form submission. */
    autounmask: boolean;

    /** The autocomplete hint for the native input. */
    autocomplete: string | undefined;

    /** Whether spellchecking is enabled on the native input. */
    spellcheck: boolean | undefined;

    /** Checks whether the current value satisfies the control's completion rules. */
    isComplete(): boolean;

    /**
     * Call after the component's first update
     * @protected
     */
    protected onTextControlFirstUpdate(): void;

    /**
     * Call before the value will update
     * @protected
     */
    protected onBeforeValueUpdate(): void;

    /**
     * Call when the allow pattern is updated
     * @protected
     */
    protected onAllowPatternUpdate(): void;

    /** Applies the control's mask and character filtering to a value. */
    protected mask(value: string): string;

    /** Removes the control's mask from a value. */
    protected unmask(maskedValue: string): string;

    /** Calculates the caret position after the input value is formatted. */
    protected replaceCaret(caretPosition: number, snapshotValue: string): number;

    /** Validates the most recently entered character against the allow-pattern. */
    protected validateLastChar(keyDownEvent: KeyboardEvent & { target: HTMLInputElement }): boolean;

    /** Validates the value against the text control's constraints. */
    protected validate(value: string): string;

    /** Synchronizes the native input with the masked value and updates validation state. */
    protected valueUpdated(): boolean;

    /** Configures detection of the user's first interaction with the input. */
    protected setupFirstInteraction(): void;

    /** Renders the native input element. */
    protected renderInput(): import('lit').TemplateResult | typeof import('lit').nothing;

    /** Renders the input and its clear button. */
    protected renderContainerContent(): import('lit').TemplateResult | typeof import('lit').nothing;

    /** Renders the complete text control. */
    protected render(): import('lit').TemplateResult;
}
