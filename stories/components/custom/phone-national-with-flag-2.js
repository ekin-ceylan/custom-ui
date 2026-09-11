import { defineComponent, ifDefined } from '../../../src/modules/utilities.js';
import { CustomCombobox } from './custom-combobox.js';
import { html, nothing } from 'lit';
import UniqueIdGeneratorMixin from '../../../src/mixins/unique-id-generator-mixin.js';
import { mixins, LightComponentBase } from '../../../src/exports/custom-ui.js';
import { PhoneIntl } from './phone-national-with-flag.js';

export default class PhoneNational2 extends mixins(LightComponentBase, UniqueIdGeneratorMixin) {
    static get properties() {
        return {
            ...super.properties,
            countryCode: { type: String, attribute: 'phone-code' },
            label: { type: String },
            validationMessage: { type: String, state: true },
            disabled: { type: Boolean, reflect: true },
            required: { type: Boolean, reflect: true },
        };
    }

    get fieldId() {
        return `${this.componentName}-${this.uniqueId}`;
    }

    constructor() {
        super();

        /** @type {string | undefined} */
        this.countryCode = 'tr';
        /** @type {string | undefined} */
        this.label = undefined;
        /** @type {string | undefined} */
        this.validationMessage = undefined;
        /** @type {boolean | undefined} */
        this.disabled = undefined;
        /** @type {boolean | undefined} */
        this.required = undefined;
    }

    #handleCountryChange(event) {
        const next = event.target.value;
        if (next === this.countryCode) return;
        this.countryCode = next;
    }

    #onValidate(event) {
        this.validationMessage = event.detail?.validationMessage;
    }

    /**
     * Returns the HTML template for displaying validation error messages.
     * The span element includes ARIA attributes for accessibility and is hidden when no validation message exists.
     * @returns {import('lit').TemplateResult | typeof nothing} Lit HTML template with validation message
     */
    renderErrorMessage() {
        if (!this.validationMessage) return nothing;
        return html`<span id=${ifDefined(this.errorId)} data-role="error-message" aria-live="assertive">${this.validationMessage}</span>`;
    }

    render() {
        return html`
            <label for=${this.fieldId}>${this.label}</label>
            <div role="container">
                <combo-box-2 label="Alan Kodu" hide-label .options=${options} .value=${this.countryCode} @change=${this.#handleCountryChange}></combo-box-2>
                <phone-intl-2
                    label=${this.label}
                    field-id=${this.fieldId}
                    ?disabled=${this.disabled}
                    ?required=${this.required}
                    country-code=${this.countryCode}
                    @validate=${this.#onValidate}
                    class="textbox"
                ></phone-intl-2>
            </div>
            ${this.renderErrorMessage()}
        `;
    }
}

class PhoneIntl2 extends PhoneIntl {
    renderLabel() {
        return nothing;
    }

    renderErrorMessage() {
        return nothing;
    }

    /**
     * @override Renders the input mask content including the country code.
     * @return {import('lit').TemplateResult | typeof nothing}
     */
    renderInputMaskContent() {
        // prettier-ignore
        return html`<pre>+${this.selectedCountry?.code}</pre>${super.renderInputMaskContent()}`;
    }
}

defineComponent('combo-box-2', CustomCombobox);
defineComponent('phone-intl-2', PhoneIntl2);

class Country {
    #maxlength;
    #maskPlaceholder;
    #pattern;
    #maskRegex;

    get maskPlaceholder() {
        return this.#maskPlaceholder;
    }
    get maxlength() {
        return this.#maxlength;
    }
    get pattern() {
        return this.#pattern;
    }
    get maskRegex() {
        return this.#maskRegex;
    }

    code;
    #groups;
    placeholder;

    constructor(code, groups, placeholder) {
        this.code = code;
        this.#groups = groups;
        this.placeholder = placeholder;
        this.#maskPlaceholder = this.#groups.map(size => '_'.repeat(size)).join(' ');
        this.#maxlength = this.#groups.reduce((sum, size) => sum + size, 0);
        this.#pattern = this.#groups.map(size => String.raw`\d{${size}}`).join(' ');
        this.#maskRegex = new RegExp('^' + this.#groups.map(size => String.raw`(\d{1,${size}})?`).join(''));
    }
}

const countries = {
    ae: new Country(971, [3, 3, 4], '050 123 4567'),
    ar: new Country(54, [2, 4, 4], '11 2345 6789'),
    br: new Country(55, [2, 5, 4], '11 91234 5678'),
    ca: new Country(1, [3, 3, 4], '416 555 0123'),
    cn: new Country(86, [3, 4, 4], '131 2345 6789'),
    co: new Country(57, [3, 3, 4], '300 123 4567'),
    de: new Country(49, [5, 7], '01512 3456789'),
    eg: new Country(20, [3, 3, 4], '101 234 5678'),
    es: new Country(34, [3, 3, 3], '612 345 678'),
    fr: new Country(33, [2, 2, 2, 2, 2], '06 12 34 56 78'),
    gb: new Country(44, [4, 3, 4], '020 7123 4567'),
    in: new Country(91, [5, 5], '98765 43210'),
    it: new Country(39, [3, 3, 4], '312 345 6789'),
    jp: new Country(81, [2, 4, 4], '90 1234 5678'),
    kp: new Country(850, [4, 3, 4], '0192 234 5678'),
    kr: new Country(82, [2, 4, 4], '10 1234 5678'),
    mx: new Country(52, [3, 3, 4], '551 234 5678'),
    nl: new Country(31, [2, 4, 4], '20 1234 5678'),
    pl: new Country(48, [3, 3, 3], '501 234 567'),
    pt: new Country(351, [3, 3, 3], '912 345 678'),
    ru: new Country(7, [3, 3, 4], '912 345 6789'),
    sa: new Country(966, [2, 3, 4], '50 123 4567'),
    se: new Country(46, [2, 3, 2, 2], '70 123 45 67'),
    sg: new Country(65, [4, 4], '9123 4567'),
    th: new Country(66, [1, 4, 4], '8 1234 5678'),
    tr: new Country(90, [3, 3, 2, 2], '501 234 56 78'),
    us: new Country(1, [3, 3, 4], '201 555 0123'),
    vn: new Country(84, [3, 3, 4], '091 234 5678'),
};

class CountryPhone {
    value;
    phoneCode;
    label;

    get innerHTML() {
        return `<img src="https://flagcdn.com/${this.value}.svg" alt="${this.label} Bayrağı" width="20" height="15" style="margin-right: 5px" />
            <span>${this.label}</span>
            <span>+${this.phoneCode}</span>`;
    }

    constructor(data) {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }
}

const options = [
    new CountryPhone({ phoneCode: '971', value: 'ae', label: 'Birleşik Arap Emirlikleri' }),
    new CountryPhone({ phoneCode: '54', value: 'ar', label: 'Arjantin' }),
    new CountryPhone({ phoneCode: '55', value: 'br', label: 'Brezilya' }),
    new CountryPhone({ phoneCode: '1', value: 'ca', label: 'Kanada' }),
    new CountryPhone({ phoneCode: '86', value: 'cn', label: 'Çin Halk Cumhuriyeti' }),
    new CountryPhone({ phoneCode: '57', value: 'co', label: 'Kolombiya' }),
    new CountryPhone({ phoneCode: '49', value: 'de', label: 'Almanya' }),
    new CountryPhone({ phoneCode: '20', value: 'eg', label: 'Mısır' }),
    new CountryPhone({ phoneCode: '34', value: 'es', label: 'İspanya' }),
    new CountryPhone({ phoneCode: '33', value: 'fr', label: 'Fransa' }),
    new CountryPhone({ phoneCode: '44', value: 'gb', label: 'Birleşik Krallık' }),
    new CountryPhone({ phoneCode: '91', value: 'in', label: 'Hindistan' }),
    new CountryPhone({ phoneCode: '39', value: 'it', label: 'İtalya' }),
    new CountryPhone({ phoneCode: '81', value: 'jp', label: 'Japonya' }),
    new CountryPhone({ phoneCode: '850', value: 'kp', label: 'Kuzey Kore' }),
    new CountryPhone({ phoneCode: '82', value: 'kr', label: 'Güney Kore' }),
    new CountryPhone({ phoneCode: '52', value: 'mx', label: 'Meksika' }),
    new CountryPhone({ phoneCode: '31', value: 'nl', label: 'Hollanda' }),
    new CountryPhone({ phoneCode: '48', value: 'pl', label: 'Polonya' }),
    new CountryPhone({ phoneCode: '351', value: 'pt', label: 'Portekiz' }),
    new CountryPhone({ phoneCode: '7', value: 'ru', label: 'Rusya' }),
    new CountryPhone({ phoneCode: '966', value: 'sa', label: 'Suudi Arabistan' }),
    new CountryPhone({ phoneCode: '46', value: 'se', label: 'İsveç' }),
    new CountryPhone({ phoneCode: '65', value: 'sg', label: 'Singapur' }),
    new CountryPhone({ phoneCode: '66', value: 'th', label: 'Tayland' }),
    new CountryPhone({ phoneCode: '90', value: 'tr', label: 'Türkiye' }),
    new CountryPhone({ phoneCode: '1', value: 'us', label: 'Amerika Birleşik Devletleri' }),
    new CountryPhone({ phoneCode: '84', value: 'vn', label: 'Vietnam' }),
];

// https://github.com/google/libphonenumber/blob/07817b005926c648c5d7a29e2bf3ca844e0f7d68/resources/PhoneNumberMetadata.xml
