// Performans: Görseller varsayılan olarak hemen yüklenir, lazy loading yoktur → sayfa yavaşlar
// Layout sorunları: Boyut verilmezse sayfa kaymaları (CLS) oluşur
// Responsive zorluk: Farklı ekranlar için srcset gibi çözümler karmaşık ve zor yönetilir
// Kullanıcı deneyimi: Yükleme animasyonu yok, hata durumları zayıf
// Erişilebilirlik ve SEO: alt eksikliği ciddi sorun yaratır
// preload/lazyload

import { html } from 'lit';
import SlotCollectorMixin from '../../mixins/slot-collector-mixin';
import { mixins } from '../../modules/mixin-utils';
import LightComponentBase from '../../base/light-component-base.js';

// bg-image - ayrı comp olabilir
export default class Picture extends mixins(LightComponentBase, SlotCollectorMixin) {
    render() {
        return html`
            <picture>
                <slot></slot>
                <!-- <source data-srcset="/Assets/images/police_iptal_banner.webp" type="image/webp" />
                <img data-src="/Assets/images/police_iptal_banner.png" alt="zeyil değişikliği banner" class="banner lazyload" width="423" height="145" /> -->
            </picture>
        `;
    }
}
