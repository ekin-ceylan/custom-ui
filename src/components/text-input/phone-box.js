import { isEmpty } from '../../modules/utilities.js';
import { mixins } from '../../modules/mixin-utils.js';
import InputMaskMixin from '../../mixins/input-mask-mixin.js';
import TextControlBase from '../../base/text-control-base.js';

/**
 * Input component that provides phone number format validation and masking.
 *
 * The `PhoneBox` component extends `TextControlBase` and incorporates the `InputMaskMixin` to provide a user-friendly interface for entering phone numbers.
 * It automatically formats the input as the user types, ensuring that the phone number adheres to a specific pattern.
 */
export default class PhoneBox extends mixins(TextControlBase, InputMaskMixin) {
    static get properties() {
        return {
            ...super.properties,
            // maxlength: { type: Number },
            // minlength: { type: Number },
            autounmask: { type: Boolean },
        };
    }

    constructor() {
        super();

        this.type = 'tel';
        this.inputmode = 'tel';
        this.pattern = String.raw`0\(\d{3}\) \d{3} \d{2} \d{2}`;
        this.autocomplete = 'tel';
        this.placeholder = '0(___) ___ __ __';
    }

    /**
     * Masks the input value to match the phone number format.
     * It removes non-digit characters, handles country code removal, and formats the number according to the specified pattern.
     * @param {string} value - The input value to be masked.
     * @override
     */
    mask(value) {
        if (isEmpty(value)) return value;
        value = value.replaceAll(/\D/g, ''); // Sayı olmayan karakterleri kaldır

        if (value.length >= 12) {
            value = value.replace(/^0{0,2}9/, ''); // Ülke kodunu kaldır
        }

        value = value.match(/^0?\d{1,10}/)?.[0] || ''; // Geçerli kısmı al

        if (value.length > 0 && !value.startsWith('0')) {
            value = '0' + value;
        }

        if (value.length > 1) {
            const pattern = /(\d)?(\d{1,3})?(\d{1,3})?(\d{1,2})?(\d{1,2})?/;
            value = value.replace(pattern, (_, a, b, c, d, e) => {
                let area = b?.length > 0 ? `(${b}` : '';
                area += b?.length === 3 ? ')' : '';
                const num = [c, d, e].filter(Boolean).join(' ');

                return `${a}${area} ${num}`.trimEnd();
            });
        }

        return value;
    }

    /**
     * @param {KeyboardEvent & { target: HTMLInputElement }} keyDownEvent - The keyboard event triggered on key down.
     * @override Validates the last character entered in the phone input. Ensures that only digits are allowed and the maximum length is not exceeded.
     */
    validateLastChar(keyDownEvent) {
        const val = keyDownEvent.target.value;
        const key = keyDownEvent.key;
        const caret = keyDownEvent.target.selectionStart;
        const caretEnd = keyDownEvent.target.selectionEnd;

        const newValue = (val.slice(0, caret) + key + val.slice(caretEnd)).replaceAll(/\D/g, '');

        if (newValue.length > 11) return false; // Maksimum uzunluk 11 olmalı

        return /\d/.test(keyDownEvent.key);
    }
}

// Case list
// paste test
/*
0 212 123 45 67
(0212) 123 45 67
+90 212 123 45 67
02121234567
0-212-123-45-67
*/
