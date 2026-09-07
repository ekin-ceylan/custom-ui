// Registers Typed UI custom elements for Storybook.
// Guarded to avoid "already defined" errors during HMR.

import { html, render } from 'lit';
import * as TypedUI from '../../dist/custom-ui.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ifDefined, isEmpty } from '../../src/modules/utilities.js';

const defineComponent = TypedUI.defineComponent;

defineComponent('check-box', TypedUI.CheckBox);
defineComponent('text-box', TypedUI.TextBox);
defineComponent('tc-box', TypedUI.TcBox);
defineComponent('plate-box', TypedUI.PlateBox);
defineComponent('phone-box', TypedUI.PhoneBox);
defineComponent('email-box', TypedUI.EmailBox);
defineComponent('password-box', TypedUI.PasswordBox);
defineComponent('confirm-password-box', TypedUI.ConfirmPasswordBox);
defineComponent('new-password-box', TypedUI.NewPasswordBox);
defineComponent('select-box', TypedUI.SelectBox);
defineComponent('combo-box', TypedUI.ComboBox);
defineComponent('modal-dialog', TypedUI.ModalDialog);
defineComponent('t-pagination', TypedUI.Pagination);
defineComponent('basic-img', TypedUI.Image);

export const Checkbox = ({ defaultSlot, name, label, checkedValue, required, checked, disabled, readonly, indeterminate }) => {
    const temp = html`<check-box
        name=${ifDefined(name)}
        label=${ifDefined(label)}
        checked-value=${ifDefined(checkedValue)}
        ?required=${required}
        ?checked=${checked}
        ?disabled=${disabled}
        ?readonly=${readonly}
        ?indeterminate=${indeterminate}
    >
        ${unsafeHTML(defaultSlot ?? '')}
    </check-box>`;

    return elementFromTemplate(temp);
};

export const Combobox = args => {
    const temp = html`<combo-box
        name=${ifDefined(args.name)}
        label=${ifDefined(args.label)}
        ?hide-label=${args.hideLabel}
        ?required=${args.required}
        ?clearable=${args.clearable}
        ?disabled=${args.disabled}
        ?native-behavior=${args.nativeBehavior}
        placeholder=${ifDefined(args.placeholder)}
        value=${ifDefined(args.value)}
    >
        ${unsafeHTML(args.noOptionsSlot ?? '')} ${unsafeHTML(args.defaultSlot ?? '')}
    </combo-box>`;

    return elementFromTemplate(temp);
};

export const Selectbox = args => {
    const temp = html`<select-box
        id=${ifDefined(args.id)}
        name=${ifDefined(args.name)}
        label=${ifDefined(args.label)}
        ?hide-label=${args.hideLabel}
        ?required=${args.required}
        ?clearable=${args.clearable}
        ?disabled=${args.disabled}
        placeholder=${ifDefined(args.placeholder)}
        no-options-label=${ifDefined(args.noOptionsLabel)}
        value=${ifDefined(args.value)}
    >
        ${unsafeHTML(args.defaultSlot ?? '')}
    </select-box>`;

    return elementFromTemplate(temp);
};

// prettier-ignore
export const Pagination = args => {
    const temp = html`<t-pagination
        class="pagination"
        current-page=${ifDefined(args.currentPage)}
        page-count=${ifDefined(args.pageCount)}
        sibling-count=${ifDefined(args.siblingCount)}
        aria-label=${ifDefined(args.ariaLabel)}
        first-page-label=${ifDefined(args.firstPageLabel)}
        last-page-label=${ifDefined(args.lastPageLabel)}
        prev-page-label=${ifDefined(args.prevPageLabel)}
        next-page-label=${ifDefined(args.nextPageLabel)}
        page-label=${ifDefined(args.pageLabel)}
    >
        ${unsafeHTML(args.goFirstIconSlot ?? '')}
        ${unsafeHTML(args.goLastIconSlot ?? '')}
        ${unsafeHTML(args.goPrevIconSlot ?? '')}
        ${unsafeHTML(args.goNextIconSlot ?? '')}
        ${unsafeHTML(args.ellipsisIconSlot ?? '')}
    </t-pagination>`;

    return elementFromTemplate(temp);
};

export const Image = args => {
    const temp = `<basic-img ${getAttrs(args)}> </basic-img>`;
    return elementFromText(temp);
};

// #region TEXTBOX RENDERER

export const Platebox = args => {
    const temp = `<plate-box ${getAttrs(args)} class="textbox"> </plate-box>`;
    return elementFromText(temp);
};

export const Phonebox = args => {
    const temp = `<phone-box ${getAttrs(args)} class="textbox"> </phone-box>`;
    return elementFromText(temp);
};

export const Textbox = args => {
    const temp = `<text-box ${getAttrs(args)} class="textbox"> </text-box>`;
    return elementFromText(temp);
};

export const TcBox = args => {
    const temp = `<tc-box ${getAttrs(args)} class="textbox"> </tc-box>`;
    return elementFromText(temp);
};

export const Emailbox = args => {
    const temp = `<email-box ${getAttrs(args)} class="textbox"> </email-box>`;
    return elementFromText(temp);
};

export const Passwordbox = args => {
    const temp = `<password-box ${getAttrs(args)} class="textbox"> </password-box>`;
    return elementFromText(temp);
};

export const ConfirmPasswordbox = args => {
    const temp = `<confirm-password-box ${getAttrs(args)} class="textbox"> </confirm-password-box>`;
    return elementFromText(temp);
};

export const NewPasswordbox = args => {
    const temp = `<new-password-box ${getAttrs(args)} class="textbox"> </new-password-box>`;
    return elementFromText(temp);
};

// #endregion TEXTBOX RENDERER

export const ModalDialog = ({ defaultSlot, backdropClose, escClose }) => {
    // prettier-ignore
    const temp = html`<modal-dialog id="my-modal" ?backdrop-close=${backdropClose} ?esc-close=${escClose}>
        ${unsafeHTML(defaultSlot ?? '')}
    </modal-dialog>`;

    return elementFromTemplate(temp);
};

export const createForm = (mainElement, elementComment) => {
    const button = document.createElement('button');
    button.type = 'submit';
    button.style.margin = '22px 10px 0 0';
    button.textContent = 'Gönder';

    const span = document.createElement('span');

    const form = document.createElement('form');
    form.appendChild(document.createComment(` ${elementComment} `));
    form.appendChild(mainElement);
    form.appendChild(document.createComment(` ${elementComment} `));
    form.appendChild(button);
    form.appendChild(span);

    form.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(form);
        const entries = Array.from(formData.entries())
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        span.textContent = `Form submitted with data:\n${entries}`;
    });

    return form;
};

function elementFromTemplate(tpl) {
    try {
        const host = document.createElement('div');
        render(tpl, host);
        const el = host.firstElementChild;
        // ensure rendering is done

        if (!el) throw new Error('Template did not produce a root element.');

        return el;
    } catch (error) {
        return error;
    }
}

function elementFromText(htmlString) {
    const template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    return template.content.firstElementChild;
}

function pascalToKebab(str) {
    return str.replaceAll(/([A-Z])/g, '-$1').toLowerCase();
}

function getAttrs(args) {
    return Object.entries(args)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => {
            const attr = pascalToKebab(k);
            return addIfDefined(attr, v);
        })
        .join(' ');
}

function addIfDefined(name, value) {
    if (value === true) return name;
    return isEmpty(value) || value === false ? '' : `${name}="${value}"`;
}
