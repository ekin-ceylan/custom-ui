import { defineComponent } from '../../../../dist/custom-ui.js';
import { createAttrType, inputBaseArgTypes, textBoxEventTypes } from '../../../utilities/common-arg-types.js';
import { Phonebox } from '../../../utilities/register.js';
import PhoneNational from '../../custom/phone-national-with-flag.js';
import PhoneNational2 from '../../custom/phone-national-with-flag-2.js';
import '../../../assets/styles/text-box.css';
import '../../../assets/styles/combo-box.css';
import '../../../assets/styles/custom.css';

export default {
    title: 'Bileşenler/Metin Bileşenleri/PhoneBox',
    argTypes: {
        ...inputBaseArgTypes,
        autounmask: createAttrType(
            'Bileşenin değerinin maskeli şekilde tutulup tutulmayacağını belirler. Açıksa, inputun görünen değeri maskelenirken bileşenin tuttuğu değer maskesiz olur. `unmask()` fonksiyonu tanımlanmış olmalıdır.',
            'boolean',
            'false'
        ),
    },
};

export const Default = {
    render: args => Phonebox(args),
    args: {
        name: 'PhoneNumber',
        label: 'Telefon Numarası',
        value: undefined,
        placeholder: '0(555) 555 5555',
    },
    parameters: {
        docs: {
            canvas: { sourceState: 'shown' }, // Canvas altında code otomatik açık gelir
            codePanel: true,
        },
    },
};

export const PlaygroundStory = {
    render: args => Phonebox(args),
    tags: ['!dev'],
    args: {
        label: 'Telefon Numarası',
        placeholder: '0(555) 555 5555',
    },
    parameters: {
        docs: {
            canvas: { sourceState: 'shown' }, // Canvas altında code otomatik açık gelir
        },
    },
};

export const IntlStory_1 = {
    render: _args => {
        defineComponent('phone-with-area', PhoneNational);
        const phone = new PhoneNational();

        return phone;
    },
    tags: ['!dev'],
};

export const IntlStory_2 = {
    render: _args => {
        defineComponent('phone-with-area-2', PhoneNational2);
        const phone = new PhoneNational2();
        phone.label = 'Telefon Numarası';

        return phone;
    },
    tags: ['!dev'],
};

export const PropAttrEventLists = {
    tags: ['!dev'],
    argTypes: textBoxEventTypes,
};
