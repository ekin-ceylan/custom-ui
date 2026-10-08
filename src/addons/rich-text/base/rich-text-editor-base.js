import { TextAreaBase } from 'custom-ui';
import { html, nothing } from 'lit';
import { arrowBackUp, arrowForwardUp, bold, bulletList, italic, listNumbers, sourceCode, strikethrough } from '../modules/icons.js';

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
        const title = this.localeMessages.skipToEditorLabel;

        return html`<button type="button" @click=${onClick} data-command="focus" data-role="skip-to-editor" aria-label=${title}>${title}</button> `;
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

        return html`<select @change=${onChange} .value=${activeBlock} data-role="block-selection" aria-label=${this.localeMessages.textStyleLabel}>
            <option value="p" title=${this.localeMessages.paragraphOptionTitle}>¶</option>
            <option value="h1" title=${this.localeMessages.heading1OptionTitle}>H1</option>
            <option value="h2" title=${this.localeMessages.heading2OptionTitle}>H2</option>
            <option value="h3" title=${this.localeMessages.heading3OptionTitle}>H3</option>
            <option value="h4" title=${this.localeMessages.heading4OptionTitle}>H4</option>
            <option value="h5" title=${this.localeMessages.heading5OptionTitle}>H5</option>
            <option value="h6" title=${this.localeMessages.heading6OptionTitle}>H6</option>
            <option value="blockquote" title=${this.localeMessages.blockquoteOptionTitle}>❜❜</option>
            <option value="codeBlock" title=${this.localeMessages.codeBlockOptionTitle}>${'</>'}</option>
        </select>`;
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
        const title = this.localeMessages.undoButtonTitle;

        return html`<button type="button" @click=${undo} ?disabled=${!canUndo} data-command="undo" aria-label=${title} title="${title}">${arrowBackUp()}</button>`;
    }

    /**
     * Renders the redo button for the rich text editor.
     * @param {import('@tiptap/core').Editor | null} editor
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderRedoButton(editor) {
        const canRedo = editor?.can().redo() ?? false;
        const redo = () => editor?.chain().focus().redo().run();
        const title = this.localeMessages.redoButtonTitle;

        return html`<button type="button" @click=${redo} ?disabled=${!canRedo} data-command="redo" aria-label=${title} title="${title}">${arrowForwardUp()}</button>`;
    }

    /**
     * Renders the bold button for the rich text editor.
     * @param {import('@tiptap/core').Editor | null} editor
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderBoldButton(editor) {
        const toggleBold = () => editor?.chain().focus().toggleBold().run();
        const ariaPressed = editor?.isActive('bold') ?? false;
        const title = this.localeMessages.boldButtonTitle;

        return html`<button type="button" @click=${toggleBold} aria-pressed=${ariaPressed} data-command="bold" aria-label=${title} title="${title}">${bold()}</button>`;
    }

    /**
     * Renders the italic button for the rich text editor.
     * @param {import('@tiptap/core').Editor | null} editor
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderItalicButton(editor) {
        const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
        const ariaPressed = editor?.isActive('italic') ?? false;
        const title = this.localeMessages.italicButtonTitle;

        return html`<button type="button" @click=${toggleItalic} aria-pressed=${ariaPressed} data-command="italic" aria-label=${title} title="${title}">${italic()}</button>`;
    }

    /**
     * Renders the strike-through button for the rich text editor.
     * @param {import('@tiptap/core').Editor | null} editor
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderStrikeButton(editor) {
        const toggleStrike = () => editor?.chain().focus().toggleStrike().run();
        const ariaPressed = editor?.isActive('strike') ?? false;
        const title = this.localeMessages.strikeButtonTitle;

        return html`<button type="button" @click=${toggleStrike} aria-pressed=${ariaPressed} data-command="strike" aria-label=${title} title="${title}">
            ${strikethrough()}
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
        const title = this.localeMessages.bulletListButtonTitle;

        return html`<button type="button" @click=${toggleBulletList} aria-pressed=${ariaPressed} data-command="bullet-list" aria-label=${title} title=${title}>
            ${bulletList()}
        </button>`;
    }

    /**
     * Renders the ordered list button for the rich text editor.
     * @param {import('@tiptap/core').Editor | null} editor
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderOrderedListButton(editor) {
        const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
        const ariaPressed = editor?.isActive('orderedList') ?? false;
        const title = this.localeMessages.orderedListButtonTitle;

        return html`<button type="button" @click=${toggleOrderedList} aria-pressed=${ariaPressed} data-command="ordered-list" aria-label=${title} title=${title}>
            ${listNumbers()}
        </button>`;
    }

    /**
     * Renders the source code button for the rich text editor.
     * @param {import('@tiptap/core').Editor | null} editor
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderSourceCodeButton(editor) {
        const title = this.localeMessages.sourceCodeButtonTitle;

        const onClick = async _e => {
            this.showSourceCode = !this.showSourceCode;
            await this.updateComplete;
            this.#focusEditor(editor);
        };

        return html`<button type="button" @click=${onClick} data-command="source" aria-label=${title} title=${title} aria-pressed=${this.showSourceCode}>${sourceCode()}</button>`;
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
     * Renders the toolbar for the rich text editor.
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
