import { html } from 'lit';
import { LightComponentBase } from 'custom-ui';
import CheckBoxController from './controllers/check-box-controller.js';
import TextBoxController from './controllers/text-box-controller.js';
import UrlBoxController from './controllers/url-box-controller.js';

export default class ControllerTest extends LightComponentBase {
    constructor() {
        super();

        this.checkbox = new CheckBoxController(this, {
            componentName: 'controller-test-checkbox',
            parentElement: '[data-role="checkbox-controller"]',
            description: html`Koşulları <a href="/terms">okudum</a> ve kabul ediyorum.`,
        });
        this.checkbox.label = 'Checkbox';
        this.checkbox.checkedValue = true;
        this.checkbox.uncheckedValue = false;
        this.checkbox.addEventListener('input', () => this.requestUpdate());

        this.textbox = new TextBoxController(this, {
            componentName: 'controller-test-textbox',
            parentElement: '[data-role="textbox-controller"]',
        });
        this.textbox.label = 'Textbox';
        this.textbox.placeholder = 'Type something';
        this.textbox.required = true;
        this.textbox.addEventListener('input', () => this.requestUpdate());
        this.textbox.addEventListener('validate', () => this.requestUpdate());

        this.urlbox = new UrlBoxController(this, {
            componentName: 'controller-test-urlbox',
            parentElement: '[data-role="urlbox-controller"]',
            allowedProtocols: 'http: https: mailto: tel:',
            allowRelative: true,
        });
        this.urlbox.label = 'URL';
        this.urlbox.required = true;
        this.urlbox.addEventListener('input', () => this.requestUpdate());
        this.urlbox.addEventListener('validate', () => this.requestUpdate());
    }

    render() {
        return html`
            <div data-role="checkbox-controller">${this.checkbox.renderTemplate()}</div>
            <div data-role="textbox-controller">${this.textbox.renderTemplate()}</div>
            <div data-role="urlbox-controller">${this.urlbox.renderTemplate()}</div>
            <p>Checkbox: ${String(this.checkbox.checked)}</p>
            <p>Textbox: ${this.textbox.value}</p>
            <p>URL: ${this.urlbox.value}</p>
        `;
    }
}
