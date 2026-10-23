import TextBoxController from './text-box-controller.js';

export default class UrlBoxController extends TextBoxController {
    /**
     * URL rules are configured once, before the first host update.
     * @param {ConstructorParameters<typeof TextBoxController>[0]} host
     * @param {ConstructorParameters<typeof TextBoxController>[1] & { allowedProtocols?: string; allowRelative?: boolean }} [options]
     */
    constructor(host, options = {}) {
        super(host, options);

        this.allowedProtocols = options.allowedProtocols ?? 'http: https:';
        this.allowRelative = options.allowRelative ?? false;
        this.placeholder = 'https://...'; // göreli kabul ettiğini belli eden bir placeholder
        this.pattern = createUrlPattern(this.allowedProtocols, this.allowRelative);
        this.maxlength = 500;
        this.autocomplete = 'off';
        this.spellcheck = false;
        this.allowPattern = String.raw`\S+`;
    }
}

/**
 * Creates a URL pattern based on allowed protocols and relative URL allowance.
 * @param {string} allowedProtocols
 * @param {boolean} allowRelative
 * @returns {string}
 */
function createUrlPattern(allowedProtocols, allowRelative) {
    const protocols = new Set(allowedProtocols.trim().toLowerCase().split(/\s+/).filter(Boolean));
    const alternatives = [];

    if (protocols.has('http:')) alternatives.push(String.raw`http:\/\/[^\s]+`);
    if (protocols.has('https:')) alternatives.push(String.raw`https:\/\/[^\s]+`);
    if (protocols.has('mailto:')) alternatives.push(String.raw`mailto:[^\s@]+@[^\s@]+\.[^\s@]+`);
    if (protocols.has('tel:')) alternatives.push(String.raw`tel:\+?(?:[0-9]|\(|\)|\.|-)+`);
    if (protocols.has('http:') || protocols.has('https:')) {
        alternatives.push(String.raw`(?:(?:[a-zA-Z0-9]|-)+\.)+[a-zA-Z]{2,}(?:(?:\/|\?|#)[^\s]*)?`);
    }
    if (allowRelative) {
        alternatives.push(String.raw`(?:\/(?!\/)|\.\.?\/|\?|#)[^\s]*`);
    }

    return alternatives.length > 0 ? `^(?:${alternatives.join('|')})$` : '(?!)';
}
