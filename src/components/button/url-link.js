import { html } from 'lit';
import { ifDefined } from '../../modules/utilities.js';
import SlotCollectorMixin from '../../mixins/slot-collector-mixin.js';
import { mixins } from '../../modules/mixin-utils.js';
import LightComponentBase from '../../base/light-component-base.js';

export default class UrlLink extends mixins(LightComponentBase, SlotCollectorMixin) {
    static get properties() {
        return {
            href: { type: String, attribute: 'href', reflect: true },
            target: { type: String, attribute: 'target', reflect: true },
            ariaLabel: { type: String, attribute: 'aria-label', reflect: true },
        };
    }

    render() {
        const rel = this.target === '_blank' ? 'noopener noreferrer' : '';

        return html`
            <a href=${this.href} target=${this.target} rel=${rel} aria-label=${ifDefined(this.ariaLabel)}>
                <slot></slot>
            </a>
        `;
    }

    constructor() {
        super();

        this.href = '#';
        this.target = '_self';
        this.ariaLabel = null;
    }
}

// customElements.define('url-link', UrlLink);
