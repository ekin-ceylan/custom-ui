import { TextAreaBase } from 'custom-ui';
import { html, nothing, svg } from 'lit';

/**
 * Base class for the rich text editor component.
 * @extends {TextAreaBase}
 */
export default class RichTextEditorBase extends TextAreaBase {
    // #region STATICS, FIELDS, GETTERS

    static get properties() {
        return {
            ...super.properties,
            showSourceCode: { type: Boolean, attribute: 'show-source-code' },
        };
    }

    /** Title for the undo button, typically used for accessibility and tooltips. */
    get undoButtonTitle() {
        return this.localeMessages.undoButtonTitle;
    }

    /** Title for the redo button, typically used for accessibility and tooltips. */
    get redoButtonTitle() {
        return this.localeMessages.redoButtonTitle;
    }

    /** Title for the bold button, typically used for accessibility and tooltips. */
    get boldButtonTitle() {
        return this.localeMessages.boldButtonTitle;
    }

    /** Title for the italic button, typically used for accessibility and tooltips. */
    get italicButtonTitle() {
        return this.localeMessages.italicButtonTitle;
    }

    /** Title for the strike button, typically used for accessibility and tooltips. */
    get strikeButtonTitle() {
        return this.localeMessages.strikeButtonTitle;
    }

    /** Title for the skip to editor button, typically used for accessibility and tooltips. */
    get skipToEditorLabel() {
        return this.localeMessages.skipToEditorLabel;
    }

    /** Title and accessible label for the bulleted-list button. */
    get bulletListButtonTitle() {
        return this.localeMessages.bulletListButtonTitle;
    }

    /** Title and accessible label for the ordered-list button. */
    get orderedListButtonTitle() {
        return this.localeMessages.orderedListButtonTitle;
    }

    /** Title and accessible label for the source-code toggle button. */
    get sourceCodeButtonTitle() {
        return this.localeMessages.sourceCodeButtonTitle;
    }

    /** Accessible label for the block-style selection control. */
    get textStyleLabel() {
        return this.localeMessages.textStyleLabel;
    }

    /** Title for the paragraph option in the block-style selector. */
    get paragraphOptionTitle() {
        return this.localeMessages.paragraphOptionTitle;
    }

    /** Title for the level-one heading option. */
    get heading1OptionTitle() {
        return this.localeMessages.heading1OptionTitle;
    }

    /** Title for the level-two heading option. */
    get heading2OptionTitle() {
        return this.localeMessages.heading2OptionTitle;
    }

    /** Title for the level-three heading option. */
    get heading3OptionTitle() {
        return this.localeMessages.heading3OptionTitle;
    }

    /** Title for the level-four heading option. */
    get heading4OptionTitle() {
        return this.localeMessages.heading4OptionTitle;
    }

    /** Title for the level-five heading option. */
    get heading5OptionTitle() {
        return this.localeMessages.heading5OptionTitle;
    }

    /** Title for the level-six heading option. */
    get heading6OptionTitle() {
        return this.localeMessages.heading6OptionTitle;
    }

    /** Title for the blockquote option in the block-style selector. */
    get blockquoteOptionTitle() {
        return this.localeMessages.blockquoteOptionTitle;
    }

    /** Title for the code-block option in the block-style selector. */
    get codeBlockOptionTitle() {
        return this.localeMessages.codeBlockOptionTitle;
    }

    // #endregion STATICS, FIELDS, GETTERS

    constructor() {
        super();

        /**
         * Show source code state (whether the source code view is visible)
         * @type {boolean}
         */
        this.showSourceCode = false;
    }

    /** @param {import('@tiptap/core').Editor | null} editor */
    #focusEditor(editor) {
        if (this.disabled) return;
        if (this.showSourceCode) this.inputElement.focus();
        else editor?.commands.focus();
    }

    #handleBlockTypeChange(value, editor) {
        if (!editor) return;
        const chain = editor.chain().focus();

        if (value === 'p') {
            chain.setParagraph().run();
        } else if (value.startsWith('h')) {
            const level = /** @type { 1 | 2 | 3 | 4 | 5 | 6 } */ (Number.parseInt(value.charAt(1), 10));
            chain.toggleHeading({ level }).run();
        } else if (value === 'blockquote') {
            chain.toggleBlockquote().run();
        } else if (value === 'codeBlock') {
            chain.toggleCodeBlock().run();
        }
    }

    #getActiveBlock(editor) {
        if (!editor) return 'p';
        if (editor?.isActive('heading', { level: 1 })) return 'h1';
        if (editor?.isActive('heading', { level: 2 })) return 'h2';
        if (editor?.isActive('heading', { level: 3 })) return 'h3';
        if (editor?.isActive('heading', { level: 4 })) return 'h4';
        if (editor?.isActive('heading', { level: 5 })) return 'h5';
        if (editor?.isActive('heading', { level: 6 })) return 'h6';
        if (editor?.isActive('blockquote')) return 'blockquote';
        if (editor?.isActive('codeBlock')) return 'codeBlock';
        return 'p';
    }

    /**
     * Renders the "Skip to Editor" button for accessibility.
     * @param {import('@tiptap/core').Editor | null} editor
     * @protected
     * @category rendering
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderSkipToEditorButton(editor) {
        const onClick = _e => this.#focusEditor(editor);
        return html`<button type="button" @click=${onClick} data-command="focus" data-role="skip-to-editor" aria-label=${this.skipToEditorLabel}>
            ${this.skipToEditorLabel}
        </button> `;
    }

    /**
     * Renders the block type selection dropdown for the rich text editor.
     * @param {import('@tiptap/core').Editor | null} editor
     * @protected
     * @category rendering
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderBlockSelection(editor) {
        const onChange = e => this.#handleBlockTypeChange(e.target.value, editor);
        const activeBlock = this.#getActiveBlock(editor);

        return html`<select @change=${onChange} .value=${activeBlock} data-role="block-selection" aria-label=${this.textStyleLabel}>
            <option value="p" title=${this.paragraphOptionTitle}>¶</option>
            <option value="h1" title=${this.heading1OptionTitle}>H1</option>
            <option value="h2" title=${this.heading2OptionTitle}>H2</option>
            <option value="h3" title=${this.heading3OptionTitle}>H3</option>
            <option value="h4" title=${this.heading4OptionTitle}>H4</option>
            <option value="h5" title=${this.heading5OptionTitle}>H5</option>
            <option value="h6" title=${this.heading6OptionTitle}>H6</option>
            <option value="blockquote" title=${this.blockquoteOptionTitle}>❜❜</option>
            <option value="codeBlock" title=${this.codeBlockOptionTitle}>${'</>'}</option>
        </select>`;
    }

    /**
     * @param {string[]} paths
     * @param {number} strokeWidth
     * @protected
     * @returns {import('lit').TemplateResult}
     */
    renderIcon(paths, strokeWidth = 2) {
        return html`<svg
            width="16"
            height="16"
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

    /**
     * Renders the undo button for the rich text editor.
     * @param {import('@tiptap/core').Editor | null} editor The editor instance.
     * @protected
     * @category rendering
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderUndoButton(editor) {
        const canUndo = editor?.can().undo() ?? false;
        const undo = () => editor?.chain().focus().undo().run();

        return html`<button type="button" @click=${undo} ?disabled=${!canUndo} data-command="undo" aria-label=${this.undoButtonTitle} title="${this.undoButtonTitle}">
            ${this.renderIcon(['M9 14l-4 -4l4 -4', 'M5 10h11a4 4 0 1 1 0 8h-1'])}
        </button>`;
    }

    /**
     * Renders the redo button for the rich text editor.
     * @param {import('@tiptap/core').Editor | null} editor
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderRedoButton(editor) {
        const canRedo = editor?.can().redo() ?? false;
        const redo = () => editor?.chain().focus().redo().run();

        return html`<button type="button" @click=${redo} ?disabled=${!canRedo} data-command="redo" aria-label=${this.redoButtonTitle} title="${this.redoButtonTitle}">
            ${this.renderIcon(['M15 14l4 -4l-4 -4', 'M19 10h-11a4 4 0 1 0 0 8h1'])}
        </button>`;
    }

    /**
     * Renders the bold button for the rich text editor.
     * @param {import('@tiptap/core').Editor | null} editor
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderBoldButton(editor) {
        const toggleBold = () => editor?.chain().focus().toggleBold().run();
        const ariaPressed = editor?.isActive('bold') ?? false;

        return html`<button type="button" @click=${toggleBold} aria-pressed=${ariaPressed} data-command="bold" aria-label=${this.boldButtonTitle} title="${this.boldButtonTitle}">
            ${this.renderIcon(['M7 5h6a3.5 3.5 0 0 1 0 7h-6l0 -7', 'M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7'], 3)}
        </button>`;
    }

    /**
     * Renders the italic button for the rich text editor.
     * @param {import('@tiptap/core').Editor | null} editor
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderItalicButton(editor) {
        const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
        const ariaPressed = editor?.isActive('italic') ?? false;

        return html`<button
            type="button"
            @click=${toggleItalic}
            aria-pressed=${ariaPressed}
            data-command="italic"
            aria-label=${this.italicButtonTitle}
            title="${this.italicButtonTitle}"
        >
            ${this.renderIcon(['M11 5l6 0', 'M7 19l6 0', 'M14 5l-4 14'])}
        </button>`;
    }

    /**
     * Renders the strike-through button for the rich text editor.
     * @param {import('@tiptap/core').Editor | null} editor
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderStrikeButton(editor) {
        const toggleStrike = () => editor?.chain().focus().toggleStrike().run();
        const ariaPressed = editor?.isActive('strike') ?? false;

        return html`<button
            type="button"
            @click=${toggleStrike}
            aria-pressed=${ariaPressed}
            data-command="strike"
            aria-label=${this.strikeButtonTitle}
            title="${this.strikeButtonTitle}"
        >
            ${this.renderIcon(['M5 12l14 0', 'M16 6.5a4 2 0 0 0 -4 -1.5h-1a3.5 3.5 0 0 0 0 7h2a3.5 3.5 0 0 1 0 7h-1.5a4 2 0 0 1 -4 -1.5'])}
        </button>`;
    }

    /**
     * Renders the bullet list button for the rich text editor.
     * @param {import('@tiptap/core').Editor | null} editor
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderBulletListButton(editor) {
        const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
        const ariaPressed = editor?.isActive('bulletList') ?? false;

        return html`<button
            type="button"
            @click=${toggleBulletList}
            aria-pressed=${ariaPressed}
            data-command="bullet-list"
            aria-label=${this.bulletListButtonTitle}
            title=${this.bulletListButtonTitle}
        >
            ${this.renderIcon(['M9 6l11 0', 'M9 12l11 0', 'M9 18l11 0', 'M5 6l0 .01', 'M5 12l0 .01', 'M5 18l0 .01'])}
        </button>`;
    }

    /**
     *
     * @param {import('@tiptap/core').Editor | null} editor
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderOrderedListButton(editor) {
        const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
        const ariaPressed = editor?.isActive('orderedList') ?? false;

        return html`<button
            type="button"
            @click=${toggleOrderedList}
            aria-pressed=${ariaPressed}
            data-command="ordered-list"
            aria-label=${this.orderedListButtonTitle}
            title=${this.orderedListButtonTitle}
        >
            ${this.renderIcon(['M11 6h9', 'M11 12h9', 'M12 18h8', 'M4 16a2 2 0 1 1 4 0c0 .591 -.5 1 -1 1.5l-3 2.5h4', 'M6 10v-6l-2 2'])}
        </button>`;
    }
    /**
     * Renders the source code button for the rich text editor.
     * @param {import('@tiptap/core').Editor | null} editor
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderSourceCodeButton(editor) {
        const onClick = async _e => {
            this.showSourceCode = !this.showSourceCode;
            await this.updateComplete;
            this.#focusEditor(editor);
        };

        return html`<button
            type="button"
            @click=${onClick}
            data-command="source"
            aria-label=${this.sourceCodeButtonTitle}
            title=${this.sourceCodeButtonTitle}
            aria-pressed=${this.showSourceCode}
        >
            ${this.renderIcon(['M14.5 4h2.5a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3v-5', 'M6 5l-2 2l2 2', 'M10 9l2 -2l-2 -2'])}
        </button>`;
    }

    /**
     * Renders the content of the toolbar for the rich text editor.
     * @param {import('@tiptap/core').Editor | null} editor
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderToolbarContent(editor) {
        const skip = this.renderSkipToEditorButton(editor);
        const block = this.renderBlockSelection(editor);
        const bold = this.renderBoldButton(editor);
        const italic = this.renderItalicButton(editor);
        const strike = this.renderStrikeButton(editor);
        const bulletList = this.renderBulletListButton(editor);
        const orderedList = this.renderOrderedListButton(editor);
        const undo = this.renderUndoButton(editor);
        const redo = this.renderRedoButton(editor);
        const source = this.renderSourceCodeButton(editor);

        return html`${skip}${block}${bold}${italic}${strike}${bulletList}${orderedList}${undo}${redo}${source}`;
    }

    /**
     *
     * @param {import('@tiptap/core').Editor | null} editor
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderToolbar(editor) {
        return html`<div role="toolbar">${this.renderToolbarContent(editor)}</div>`;
    }

    /**
     * Renders the main editor container for the rich text editor.
     * @param {import('@tiptap/core').Editor | null} editor The editor instance to render the container for.
     * @protected
     * @category rendering
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderEditorDiv(editor) {
        const onClick = _e => this.#focusEditor(editor);
        return html`<div data-role="editor" @click=${onClick}></div>`;
    }
}
