import LightComponentBase from '../../base/light-component-base.js';

export default class CustomOptgroup extends LightComponentBase {
    static get properties() {
        return {
            ...super.properties,
            label: { type: String },
            disabled: { type: Boolean },
            hidden: { type: Boolean },
        };
    }
}
