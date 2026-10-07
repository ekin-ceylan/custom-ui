/**
 * Signature for all validation message factories.
 *
 * Ensures consistency across validation messages while maintaining flexibility
 * for optional parameters. All validation messages follow this pattern:
 * - `label` is optional (consumer decides whether to pass it)
 * - Additional arguments vary by validation type (min, max, etc.)
 *
 * @example
 * // Usage is flexible - label can be omitted
 * getMessage('required') // Uses default label
 * getMessage('required', 'Email') // Uses provided label
 * getMessage('minlength', 'Password', 8) // With validation-specific args
 */
export type ValidationMessageFactory = (label?: string, ...args: any[]) => string;

/**
 * All localization messages for a specific locale.
 *
 * Messages are organized into categories:
 * - **Validation messages**: Consistent signature, optional label parameter
 * - **Simple strings**: Static text for UI elements
 * - **Complex messages**: Special logic (e.g., array-based strength levels)
 */
export interface LocaleMessages {
    // #region VALIDATION MESSAGES (Consistent Signature)

    /**
     * Message factory for required field validation.
     * Signature: `(label?: string) => string`
     */
    required: ValidationMessageFactory;

    /**
     * Message factory for pattern/regex validation.
     * Signature: `(label?: string) => string`
     */
    pattern: ValidationMessageFactory;

    /**
     * Message factory for minimum length validation.
     * Signature: `(label?: string, min?: number) => string`
     */
    minlength: ValidationMessageFactory;

    /**
     * Message factory for maximum length validation.
     * Signature: `(label?: string, max?: number) => string`
     */
    maxlength: ValidationMessageFactory;

    /**
     * Message factory for minimum value validation.
     * Signature: `(label?: string, min?: number) => string`
     */
    min: ValidationMessageFactory;

    /**
     * Message factory for maximum value validation.
     * Signature: `(label?: string, max?: number) => string`
     */
    max: ValidationMessageFactory;

    /**
     * Message factory for range validation (both min and max).
     * Signature: `(label?: string, min?: number, max?: number) => string`
     */
    range: ValidationMessageFactory;

    /**
     * Message factory for password mismatch validation.
     * Signature: `(label?: string) => string`
     */
    passwordMismatch: ValidationMessageFactory;

    // #endregion VALIDATION MESSAGES (Consistent Signature)

    // #region SIMPLE STRINGS

    /**
     * Aria label for the clear button in input components.
     * Example: "Clear value"
     */
    clearButtonAriaLabel: string;

    /**
     * Aria label for the password strength indicator.
     * Example: "Password strength"
     */
    passwordStrengthAriaLabel: string;

    /**
     * Aria label for the reveal password button when password is hidden.
     * Example: "Show password"
     */
    revealPasswordAriaLabel: string;

    /**
     * Aria label for the reveal password button when password is visible.
     * Example: "Hide password"
     */
    hidePasswordAriaLabel: string;

    /**
     * Label displayed when no options are available in a select box or dropdown.
     * Example: "No Records Found"
     */
    noOptionsLabel: string;

    /**
     * Title for the undo button in rich text editor components.
     * Example: "Undo"
     */
    undoButtonTitle: string;

    /**
     * Title for the redo button in rich text editor components.
     * Example: "Redo"
     */
    redoButtonTitle: string;

    /** Title and accessible label for the bold-formatting button. */
    boldButtonTitle: string;

    /** Title and accessible label for the italic-formatting button. */
    italicButtonTitle: string;

    /** Title and accessible label for the strikethrough-formatting button. */
    strikeButtonTitle: string;

    /** Visible text and accessible label for the skip-to-editor control. */
    skipToEditorLabel: string;

    /** Accessible label for the block-style selection control. */
    textStyleLabel: string;

    /** Tooltip for the paragraph option in the block-style selector. */
    paragraphOptionTitle: string;

    /** Tooltip for the level-one heading option. */
    heading1OptionTitle: string;

    /** Tooltip for the level-two heading option. */
    heading2OptionTitle: string;

    /** Tooltip for the level-three heading option. */
    heading3OptionTitle: string;

    /** Tooltip for the level-four heading option. */
    heading4OptionTitle: string;

    /** Tooltip for the level-five heading option. */
    heading5OptionTitle: string;

    /** Tooltip for the level-six heading option. */
    heading6OptionTitle: string;

    /** Tooltip for the blockquote option in the block-style selector. */
    blockquoteOptionTitle: string;

    /** Tooltip for the code-block option in the block-style selector. */
    codeBlockOptionTitle: string;

    /** Title and accessible label for the bulleted-list button. */
    bulletListButtonTitle: string;

    /** Title and accessible label for the ordered-list button. */
    orderedListButtonTitle: string;

    /** Title and accessible label for the source-code toggle button. */
    sourceCodeButtonTitle: string;

    /** Title and accessible label for the add-link button. */
    linkButtonTitle: string;

    /** Title and accessible label for the add-image button. */
    imageButtonTitle: string;

    /** Field label for the link URL input. */
    linkUrlLabel: string;

    /** Field label for the link text input. */
    linkTextLabel: string;

    /** Placeholder for the link text input. */
    linkTextPlaceholder: string;

    /** Label for the option to open a link in a new tab. */
    openLinkInNewTabLabel: string;

    /** Field label for the image URL input. */
    imageUrlLabel: string;

    /** Field label for the image alternative-text input. */
    imageAltLabel: string;

    /** Placeholder for the image alternative-text input. */
    imageAltPlaceholder: string;

    /** Visible text for the remove-link action. */
    removeLinkButtonLabel: string;

    /** Visible text for cancel actions in rich-text popovers. */
    cancelButtonLabel: string;

    /** Visible text for submit actions in rich-text popovers. */
    saveButtonLabel: string;

    // #endregion SIMPLE STRINGS

    // #region COMPLEX MESSAGES WITH SPECIAL LOGIC

    /**
     * Message factory for password strength validation failure.
     * Allows optional label context for more specific messaging.
     * Signature: `(label?: string) => string`
     * Example: "Please choose a stronger password" or "Email password must be stronger"
     */
    passwordStrengthValidationMessage: ValidationMessageFactory;

    /**
     * Label describing the current password strength level.
     * Typically uses an array or mapping indexed by strength level (0-4).
     * Signature: `(strength?: number) => string`
     * Example results: "Weak", "Strong", "Very weak", "Medium"
     */
    passwordStrengthLabel: (strength?: number) => string;

    // #endregion COMPLEX MESSAGES WITH SPECIAL LOGIC
}

/**
 * Registry of all known locales and their message shapes.
 *
 * Consumers can extend this via TypeScript module augmentation:
 *
 * ```typescript
 * // types.d.ts
 * declare module 'typed-ui/i18n/types' {
 *   interface LocaleRegistry {
 *     de: LocaleMessages;
 *     fr: LocaleMessages;
 *   }
 * }
 * ```
 *
 * This allows proper type-checking when registering new locales with {@link registerLocale}.
 */
export interface LocaleRegistry {
    /** Turkish locale */
    tr: LocaleMessages;
    /** English locale */
    en: LocaleMessages;
}

/**
 * Union of all registered locale keys.
 * Derived from the keys of {@link LocaleRegistry}.
 *
 * This ensures type safety when passing locale identifiers to functions like
 * {@link setLocale}, {@link getMessages}, and {@link registerLocale}.
 */
export type LocaleKey = keyof LocaleRegistry;
