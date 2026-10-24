import { html, nothing } from 'lit';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { ifDefined, isEmpty, spread } from 'custom-ui';
import { formatEditorContent, trimTrailingP } from './modules/rich-text-helper.js';
import RichTextImage from './models/RichTextImage.js';
import RichTextEditorLink from './models/RichTextEditorLink.js';
import RichTextEditorBase from './base/rich-text-editor-base.js';
import PopoverImageFormController from './controllers/popover-image-form-controller.js';
import PopoverLinkFormController from './controllers/popover-link-form-controller.js';
import createAttributeExtension from './modules/attribute-extensions.js';
import createElementExtensions from './modules/element-extensions.js';
import { link, photo } from './modules/icons.js';

/**
 * Rich Text Editor component for the Custom UI library.
 * Provides a rich text editing interface with support for images, links, and various text formatting options.
 * @extends {RichTextEditorBase}
 */
export default class RichTextEditor extends RichTextEditorBase {
    // #region STATICS, FIELDS, GETTERS

    /** @type {Editor | null} */
    #editor = null;
    /** @type {HTMLElement | null} */
    #editorContainer = null;
    #linkForm = new PopoverLinkFormController(this, { componentName: 'rich-text-link-form' });
    #imageForm = new PopoverImageFormController(this, { componentName: 'rich-text-image-form' });

    // #endregion STATICS, FIELDS, GETTERS

    constructor() {
        super();

        this.#linkForm.addEventListener('submit', event => this.#onLinkSubmit(event));
        this.#linkForm.addEventListener('remove', () => this.#onLinkRemove());
        this.#imageForm.addEventListener('submit', event => this.#onImageSubmit(event));
        this.#addPopoverFormEvents(this.#linkForm);
        this.#addPopoverFormEvents(this.#imageForm);
    }

    connectedCallback() {
        super.connectedCallback();

        // Component DOM'a tekrar eklendiyse (reconnect), editörü yeniden başlat (RT-012)
        if (this.hasUpdated && !this.#editor) {
            void this.#restartEditor();
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        if (this.#editor) {
            this.#editor.destroy();
            this.#editor = null;
        }
    }

    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);

        this.#initEditor();

        // this.#editorContainer.addEventListener('mouseover', event => {
        //     // Tıklanan öğe veya onun bir üst öğesi <a> etiketi mi?
        //     const target = /** @type {HTMLElement} */ (event.target);
        //     const linkElement = target.closest('a');

        //     if (linkElement) {
        //         // event.preventDefault(); // İsteğe bağlı: Linkin sayfayı değiştirmesini engelle

        //         const url = linkElement.getAttribute('href');
        //         console.log('hover!', url);
        //         console.log('Tıklanan DOM Elementi:', linkElement);

        //         // Burada istediğin işlemi yapabilirsin (Örn: özel bir tooltip açmak)
        //     }
        // });
    }

    /**
     * @param {import('lit').PropertyValues} changedProperties Map of changed properties with old values
     * @protected
     * @override
     * - Calls `super.updated()` to ensure proper Lit lifecycle.
     * - Checks if `readonly` or `disabled` properties have changed and updates the editor's editable state accordingly.
     */
    updated(changedProperties) {
        super.updated(changedProperties);

        if (changedProperties.has('readonly') || changedProperties.has('disabled')) {
            this.#editor?.setEditable(!this.readonly && !this.disabled);
        }
    }

    // #region INTERNAL HOOKS

    /** @override @protected */
    valueUpdated() {
        const currentHtml = this.#getCleanEditorContent(this.#editor);
        const newValue = this.value || '';

        if (currentHtml !== newValue) {
            this.#editor.commands.setContent(newValue, { emitUpdate: false, parseOptions: { preserveWhitespace: true } });
            this.#onEditorUpdate(this.#editor);
            this.#checkValidity(true);

            return true;
        }

        return false;
    }

    /** @override */
    setupFirstInteraction() {
        this.addEventListener('input', _e => this.dispatchCustomEvent('first-interaction'), { once: true });
    }

    // #endregion INTERNAL HOOKS

    // #region EVENT HANDLERS

    /** @param {import('@tiptap/core').Editor} editor */
    #onEditorUpdate(editor) {
        let htmlContent = editor.getHTML();
        htmlContent = trimTrailingP(htmlContent);

        // Kullanıcı kaynaklı bir değişiklik varsa value'yu güncelle ve event fırlat
        if (this.value !== htmlContent) {
            this.value = htmlContent; // RT-005, P0-002
            this.dispatchCustomEvent('input'); // EVT-001
        }

        this.inputElement.value = formatEditorContent(htmlContent);
        this.#checkValidity(false);

        this.requestUpdate();
    }

    #onInput(event) {
        const newValue = event.target.value;
        const currentValue = formatEditorContent(this.value);

        if (currentValue !== newValue) {
            this.#editor.commands.setContent(newValue, { emitUpdate: false, parseOptions: { preserveWhitespace: true } });
            this.value = this.#getCleanEditorContent(this.#editor);
            this.#checkValidity(false);
            this.dispatchCustomEvent('input');
        }
    }

    #onBlur(_event) {
        this.#checkValidity(true);
    }

    #onFocus() {
        if (!this.showSourceCode) this.#editor.commands.focus();
    }

    /**
     * Handles native invalid event from textarea.
     * @param {Event} _event
     */
    #onInvalid(_event) {
        this.#checkValidity(true);
    }

    #onLinkSubmit(event) {
        /** @type {RichTextEditorLink} */
        const linkModel = event.detail.value;

        // URL silindiyse sildiyse ve submit dediyse, linki kaldır.
        if (!linkModel.url) {
            this.#onLinkRemove();
            return;
        }

        const chain = this.#editor.chain().focus();

        if (linkModel.isBlock) {
            const target = linkModel.blank ? '_blank' : null;
            chain.updateAttributes('blockLink', { href: linkModel.url, target, rel: 'noopener noreferrer nofollow' }).run();
        } else {
            // düzenleme moduysa tüm linki seç
            if (this.#editor.isActive('link')) {
                chain.extendMarkRange('link');
            }

            chain.insertContent(linkModel.node).run();
        }

        this.#linkForm.hidePopover(); // İşlem bittikten sonra popover'ı kapat
    }

    #onLinkRemove() {
        this.#editor.chain().focus().extendMarkRange('link').unsetLink().run();
        this.#linkForm.hidePopover();
    }

    #onImageSubmit(event) {
        /** @type {RichTextImage} */
        const imageModel = event.detail.value;

        if (!imageModel.url) return;

        this.#editor.chain().focus().insertContent({ type: 'image', attrs: imageModel.node }).run();
        this.#imageForm.hidePopover();
    }

    // #endregion EVENT HANDLERS

    /** @returns {Promise<void>} */
    async #restartEditor() {
        await this.updateComplete;
        this.#initEditor();
    }

    #initEditor() {
        this.#editorContainer = this.renderRoot.querySelector('[data-role="editor"]');
        if (!this.#editorContainer || this.#editor) return;

        const starterKitExtension = StarterKit.configure({
            link: {
                openOnClick: false,
                markdownLinks: true,
                HTMLAttributes: { target: null, rel: null },
            },
        });
        const attrExtension = createAttributeExtension();
        const elementExtensions = createElementExtensions();

        this.#editor = new Editor({
            element: this.#editorContainer,
            extensions: [starterKitExtension, attrExtension, ...elementExtensions],
            content: this.value,
            injectCSS: false,
            editable: !this.readonly && !this.disabled,
            onUpdate: ({ editor }) => this.#onEditorUpdate(editor),
            onTransaction: () => this.requestUpdate(), // Her işlemde component'i güncelle
            onFocus: () => (this.inputElement.value = formatEditorContent(this.value)),
            onBlur: () => this.#onBlur(),
        });

        this.#onEditorUpdate(this.#editor);
        // this.inputElement.value = formatEditorContent(this.value);
    }

    /** @param {PopoverLinkFormController | PopoverImageFormController} form */
    #addPopoverFormEvents(form) {
        form.addEventListener('cancel', () => form.hidePopover());
        form.addEventListener('toggle', event => {
            const toggle = /** @type {CustomEvent<{ originalEvent: ToggleEvent }>} */ (event);
            if (toggle.detail.originalEvent.newState === 'closed') {
                form.reset();
                if (this.isConnected) this.#editor?.commands.focus();
            }
        });
    }

    #checkValidity(force = false) {
        const valueMissing = this.required && isEmpty(this.value);
        const isDeleted = this.interacted && valueMissing; // blur olmadan yazıp sildi mi

        // invalid ise her inputta tekrar kontrol et
        if (!force && !this.invalid && !isDeleted) return true;

        return this.checkValidity();
    }

    /** @param {import('@tiptap/core').Editor} editor */
    #getCleanEditorContent(editor) {
        if (!editor) return '';
        const content = editor.getHTML();

        return trimTrailingP(content);
    }

    #showLinkForm() {
        if (!this.#editor) return;

        let { from, to, empty } = this.#editor.state.selection;
        const chain = this.#editor.chain().focus();
        const isLink = this.#editor.isActive('link');
        const isBlock = this.#editor.isActive('blockLink');

        // linkin içinde ama seçim yoksa seçimi genişlet
        if (isLink && empty) {
            chain.extendMarkRange('link').run();
            const newSelection = this.#editor.state.selection;
            from = newSelection.from;
            to = newSelection.to;
            empty = newSelection.empty;
        }

        const linkAttrs = isBlock ? this.#editor.getAttributes('blockLink') : this.#editor.getAttributes('link');
        const url = linkAttrs?.href || '';
        const blank = linkAttrs?.target === '_blank';
        const text = empty || isBlock ? '' : this.#editor.state.doc.textBetween(from, to, ' ');

        this.#linkForm.value = new RichTextEditorLink({ text, url, blank, isBlock });
        void this.#openFormPopover(this.#linkForm, from);
    }

    #showImageForm() {
        if (!this.#editor) return;

        const { from } = this.#editor.state.selection;
        const attr = this.#editor.getAttributes('image');
        this.#imageForm.value = new RichTextImage({ url: attr?.src || '', alt: attr?.alt || '' });
        void this.#openFormPopover(this.#imageForm, from);
    }

    /**
     * @param {PopoverLinkFormController | PopoverImageFormController} form
     * @param {number} from
     */
    async #openFormPopover(form, from) {
        const editor = this.#editor;
        await this.updateComplete;
        if (!this.isConnected || this.#editor !== editor) return;
        form.showPopover(editor.view.coordsAtPos(from));
    }

    /** @returns {import('lit').TemplateResult | typeof nothing} */
    renderPlaceholder() {
        if (!isEmpty(this.value) || !this.placeholder) return nothing;

        return html`<span data-role="placeholder" aria-hidden="true">${this.placeholder}</span>`;
    }

    /**
     * Renders the description element for the textarea.
     * It can be overridden by subclasses to provide custom description rendering logic.
     * @protected
     * @category rendering
     * @return {import('lit').TemplateResult | typeof nothing}
     */
    renderDescription() {
        if (!this.description) return nothing;
        return html`<div data-role="description" id=${this.descriptionId}>${this.description}</div>`;
    }

    renderImageButton() {
        const showImageForm = () => this.#showImageForm();
        const ariaPressed = this.#editor?.isActive('image') ?? false;
        const title = this.localeMessages.imageButtonTitle;

        return html`<button type="button" @click=${showImageForm} aria-pressed=${ariaPressed} data-command="image" aria-label=${title} title=${title}>${photo()}</button>`;
    }

    /**
     * Renders the link button for the rich-text editor.
     * @returns {import('lit').TemplateResult | typeof nothing}
     */
    renderLinkButton() {
        const showLinkForm = () => this.#showLinkForm();
        const ariaPressed = this.#editor?.isActive('link') ?? false;
        const title = this.localeMessages.linkButtonTitle;

        return html`<button type="button" @click=${showLinkForm} aria-pressed=${ariaPressed} data-command="link" aria-label=${title} title=${title}>${link()}</button>`;
    }

    /** @override Adds link and image buttons to the font buttons */
    renderToolbarContent(editor) {
        const superButtons = super.renderToolbarContent(editor);
        return html`${superButtons}${this.renderLinkButton()}${this.renderImageButton()}`;
    }

    render() {
        return html`${this.renderLabel()}
            <div data-role="container" data-source-view=${this.showSourceCode ? 'true' : 'false'}>
                ${this.renderToolbar(this.#editor)}
                <textarea
                    ${spread(this.getScopedAttrs('input'))}
                    id=${this.fieldId}
                    name=${ifDefined(this.name)}
                    ?disabled=${this.disabled}
                    ?readonly=${this.readonly}
                    aria-labelledby=${ifDefined(this.labelId)}
                    aria-label=${ifDefined(this.hideLabel ? this.label : undefined)}
                    aria-errormessage=${ifDefined(this.errorId)}
                    aria-describedby=${ifDefined(this.description ? this.descriptionId : undefined)}
                    aria-required=${this.required ? 'true' : 'false'}
                    aria-invalid=${ifDefined(this.ariaInvalid)}
                    autocomplete="off"
                    ?required=${this.required}
                    spellcheck="false"
                    inputmode="text"
                    maxlength=${ifDefined(this.maxlength)}
                    minlength=${ifDefined(this.minlength)}
                    ?data-has-value=${this.value}
                    @input=${this.#onInput}
                    @blur=${this.#onBlur}
                    @focus=${this.#onFocus}
                    @invalid=${this.#onInvalid}
                    data-role="source"
                    tabindex=${this.showSourceCode ? nothing : '-1'}
                ></textarea>
                ${this.renderEditorDiv(this.#editor)} ${this.renderPlaceholder()} ${this.renderClearButton()} ${this.renderDescription()}
            </div>
            ${this.#linkForm.renderTemplate()} ${this.#imageForm.renderTemplate()} ${this.renderErrorMessage()}`;
    }
}

/*
npm install listesi
esbuild ile tek dosya üretme
importmap’e eklenecek minimal kayıt
view içinde kullanım örneği
*/

/*
Blokları alt alta yaz
class ekle
attr ekle
link ekle

*/

/*
 - Auto-resize: içerik arttıkça yüksekliğin otomatik büyümesi
 - Min/max rows: satır sayısına göre daha kontrollü büyüme
 - Soft limit / hard limit ayrımı: maxlength yakınında uyarı, aşınca engelleme
 - Disabled/read-only görsel ayrımı: sadece davranış değil stil olarak da farklı görünüm
 - Auto-select on focus: odaklanınca tüm metni seçme opsiyonu
 - Mention / autocomplete support: @etiket, öneri listesi, chip dönüşümü
 - Markdown mode: düz text alanı ama markdown yazım desteği
 - Code-like mode: monospace, tab insert, satır numarası gibi geliştirici odaklı ekler
 - Paste normalization: yapıştırılan metni temizleme veya dönüştürme
 - Enter behavior controls: enter ile submit, shift+enter ile yeni satır gibi kurallar
 - History / undo helpers: özellikle editor benzeri senaryolarda
 - Autosave / draft support: yazılanı geçici olarak saklama
 - Slot başlangıç içeriği ile birlikte initial value precedence: bunu zaten ele aldık, ama resmi API’ye bağlanabilir

 Benim öncelik sıram şu olurdu:
 - Auto-resize
 - Min/max rows
 - Paste normalization
 - Markdown veya mention gibi daha özel editör özellikleri
*/
