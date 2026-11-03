import TextArea from '../../components/text-area/text-area.js';

defineElement('text-area', TextArea);

describe('Property content binding', () => {
    it('serializes template content for an inherited String property while preserving whitespace and dropping comments', async () => {
        const fixture = await initTestFixture('<text-area label="Description"><template prop="value"> Hello <strong>world</strong><!-- dropped --> ! </template></text-area>');
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe(' Hello <strong>world</strong> ! ');
        expect(fixture.input.value).toBe(' Hello <strong>world</strong> ! ');
    });

    it('serializes a regular element without collector attributes and gives prop precedence', async () => {
        const fixture = await initTestFixture('<text-area label="Description"><div prop="value" slot="description" data-test="content">Hello</div></text-area>');
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('<div data-test="content">Hello</div>');
        expect(fixture.input.value).toBe('<div data-test="content">Hello</div>');
    });

    it('preserves node binding for an Object property', async () => {
        const fixture = await initTestFixture('<text-area label="Description"><strong prop="description">Hello</strong></text-area>');
        await fixture.host.updateComplete;

        expect(fixture.host.description).toBeInstanceOf(HTMLElement);
        expect(fixture.host.querySelector('[data-role="description"] strong')).toBe(fixture.host.description);
    });

    it('preserves template node arrays across renders for an Object property', async () => {
        const fixture = await initTestFixture('<text-area label="Description"><template prop="description">Hello <strong>world</strong></template></text-area>');
        await fixture.host.updateComplete;
        const nodes = fixture.host.description;

        expect(Array.isArray(nodes)).toBe(true);
        expect(nodes).toHaveLength(2);
        fixture.host.requestUpdate();
        await fixture.host.updateComplete;

        expect(fixture.host.description).toBe(nodes);
        expect(fixture.host.querySelector('[data-role="description"]').textContent).toBe('Hello world');
    });

    it('decodes escaped text when serializing template content for a String property', async () => {
        const fixture = await initTestFixture('<text-area label="Description"><template prop="value">&lt;p&gt;Hello &amp; world&lt;/p&gt;</template></text-area>');
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('<p>Hello & world</p>');
        expect(fixture.input.value).toBe('<p>Hello & world</p>');
    });

    it.each([
        ['template', '<template prop="value">a<!-- note -->b</template>', 'ab'],
        ['template nested element', '<template prop="value"><span>a<!-- note -->b</span></template>', '<span>ab</span>'],
        ['root element', '<span prop="value">a<!-- note -->b</span>', '<span>ab</span>'],
    ])('drops comments from %s prop content', async (_name, markup, expected) => {
        const fixture = await initTestFixture(`<text-area label="Description">${markup}</text-area>`);
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe(expected);
        expect(fixture.input.value).toBe(expected);
    });

    it('keeps escaped comment text from prop content as literal text', async () => {
        const fixture = await initTestFixture('<text-area label="Description"><template prop="value">a&lt;!-- note --&gt;b</template></text-area>');
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('a<!-- note -->b');
        expect(fixture.input.value).toBe('a<!-- note -->b');
    });
});

describe('Component contract', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('throws when required label is missing', () => {
        const host = document.createElement('text-area');

        expect(() => {
            host.willUpdate(new Map([['label', undefined]]));
        }).toThrow("text-area: 'label' attribute must be set.");
    });

    it('throws when a required field is cleared after initial render', () => {
        const host = document.createElement('text-area');

        expect(() => {
            host.willUpdate(new Map([['label', 'Description']]));
        }).toThrow("text-area: 'label' attribute must be set.");
    });
});

describe('Validation tests', () => {
    /** @type {import('../types').TestFixture<HTMLInputElement>} */
    let fixture;

    beforeEach(async () => {
        fixture = await initTestFixture('<text-area label="Description" required minlength="3" maxlength="5"></text-area>');
    });

    it('required validation shows error when value is cleared after interaction', async () => {
        await fixture.user.type(fixture.input, 'x');
        await fixture.user.clear(fixture.input);
        await fixture.user.tab();

        expect(fixture.input.validity.valueMissing).toBe(true);
        expect(fixture.error).not.toBeNull();
        expect(fixture.error.textContent.trim()).toContain('zorunludur');
    });

    it('minlength shows error on blur when below min length', async () => {
        await fixture.user.type(fixture.input, 'a');
        await fixture.user.tab();

        expect(fixture.error).not.toBeNull();
        expect(fixture.error.textContent.trim()).toContain('en az');
    });

    it('maxlength prevents overflow and does not show error when capped natively', async () => {
        await fixture.user.type(fixture.input, 'abcdef');
        await fixture.user.tab();

        expect(fixture.input.value).toBe('abcde');
        expect(fixture.error).toBeNull();
    });

    it('validation is not shown immediately while field is still valid', async () => {
        await fixture.user.type(fixture.input, 'abc');

        expect(fixture.error).toBeNull();
    });

    it('validation updates while editing invalid field back to valid', async () => {
        await fixture.user.type(fixture.input, 'a');
        await fixture.user.tab();
        expect(fixture.error).not.toBeNull();

        fixture.input.focus();
        await fixture.user.type(fixture.input, 'bc');
        await fixture.user.tab();

        expect(fixture.error).toBeNull();
    });
});

describe('Character counter tests', () => {
    it('renders counter when show-counter and maxlength are set', async () => {
        const fixture = await initTestFixture('<text-area label="Description" show-counter maxlength="5"></text-area>');
        const counter = fixture.querySelector('[data-role="counter"]');

        expect(counter).not.toBeNull();
        expect(counter.textContent.trim()).toBe('5');
    });

    it('updates counter based on maxlength while typing', async () => {
        const fixture = await initTestFixture('<text-area label="Description" show-counter maxlength="5"></text-area>');
        await fixture.user.type(fixture.input, 'ab');

        const counter = fixture.querySelector('[data-role="counter"]');
        expect(counter).not.toBeNull();
        expect(counter.textContent.trim()).toBe('3');
    });

    it('renders counter and counts forward when maxlength is not set', async () => {
        const fixture = await initTestFixture('<text-area label="Description" show-counter></text-area>');

        const initialCounter = fixture.querySelector('[data-role="counter"]');
        expect(initialCounter).not.toBeNull();
        expect(initialCounter.textContent.trim()).toBe('0');

        await fixture.user.type(fixture.input, 'ab');
        const counter = fixture.querySelector('[data-role="counter"]');

        expect(counter).not.toBeNull();
        expect(counter.textContent.trim()).toBe('2');
    });

    it.each([
        ['5', 'abc', '2', 'updates counter when value is set programmatically with maxlength'],
        ['5', 'abcdef', '-1', 'shows negative counter when programmatic value exceeds maxlength'],
        ['', 'abcd', '4', 'updates counter when value is set programmatically without maxlength'],
    ])('$3', async (maxlength, input, expected) => {
        const maxAttr = maxlength ? `maxlength="${maxlength}"` : '';
        const fixture = await initTestFixture(`<text-area label="Description" show-counter ${maxAttr}></text-area>`);

        fixture.host.value = input;
        await fixture.host.updateComplete;
        const counter = fixture.querySelector('[data-role="counter"]');

        expect(counter).not.toBeNull();
        expect(counter.textContent.trim()).toBe(expected);
    });
});

describe('Value and slot behavior', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('replaces the value attribute initial value with default slot content', async () => {
        const fixture = await initTestFixture('<text-area label="Desc" value="preset">fallback</text-area>');
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('fallback');
        expect(fixture.input.value).toBe('fallback');
    });

    it('preserves the value attribute initial value when only named slot content exists', async () => {
        const fixture = await initTestFixture('<text-area label="Desc" value="preset"><span slot="suffix">icon</span></text-area>');
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('preset');
        expect(fixture.input.value).toBe('preset');
    });

    it('hydrates value from default slotted text when value is empty', async () => {
        const fixture = await initTestFixture('<text-area label="Desc">Hello world</text-area>');

        expect(fixture.host.value).toBe('Hello world');
        expect(fixture.input.value).toBe('Hello world');
    });

    it('serializes default slotted element nodes as literal text (outerHTML)', async () => {
        const fixture = await initTestFixture('<text-area label="Desc"><b>Hi</b></text-area>');

        expect(fixture.host.value).toContain('<b>Hi</b>');
        expect(fixture.input.value).toContain('<b>Hi</b>');
    });

    it.each([
        ['direct mixed content', ' Hello <b>world</b> ! ', false],
        ['template siblings', ' First <b>second</b> third <i>fourth</i> last ', true],
    ])('preserves %s in the same order and spacing as native textarea', async (_name, content, useTemplate) => {
        const nativeContainer = document.createElement('div');
        nativeContainer.innerHTML = `<textarea>${content}</textarea>`;
        const native = nativeContainer.querySelector('textarea');
        const markup = useTemplate ? `<template>${content}</template>` : content;
        const fixture = await initTestFixture(`<text-area label="Desc">${markup}</text-area>`);
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe(native.value);
        expect(fixture.input.value).toBe(native.value);

        fixture.host.requestUpdate();
        await fixture.host.updateComplete;

        expect(fixture.input.value).toBe(native.value);
    });

    it('decodes character references like native textarea', async () => {
        const content = '&lt;b&gt;Hello&lt;/b&gt; &amp; world';
        const nativeContainer = document.createElement('div');
        nativeContainer.innerHTML = `<textarea>${content}</textarea>`;
        const native = nativeContainer.querySelector('textarea');
        const fixture = await initTestFixture(`<text-area label="Desc">${content}</text-area>`);
        await fixture.host.updateComplete;

        expect(native.value).toBe('<b>Hello</b> & world');
        expect(fixture.host.value).toBe(native.value);
        expect(fixture.input.value).toBe(native.value);
    });

    it.each([
        ['direct', 'a<!-- note -->b', 'ab'],
        ['nested element', '<span>a<!-- note -->b</span>', '<span>ab</span>'],
        ['template', '<template>a<!-- note -->b</template>', 'ab'],
    ])('drops comments from %s default slot content', async (_name, markup, expected) => {
        const fixture = await initTestFixture(`<text-area label="Desc">${markup}</text-area>`);
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe(expected);
        expect(fixture.input.value).toBe(expected);
    });

    it('keeps escaped comment text from default slot as literal text like native textarea', async () => {
        const content = 'a&lt;!-- note --&gt;b';
        const nativeContainer = document.createElement('div');
        nativeContainer.innerHTML = `<textarea>${content}</textarea>`;
        const native = nativeContainer.querySelector('textarea');
        const fixture = await initTestFixture(`<text-area label="Desc">${content}</text-area>`);
        await fixture.host.updateComplete;

        expect(native.value).toBe('a<!-- note -->b');
        expect(fixture.host.value).toBe(native.value);
        expect(fixture.input.value).toBe(native.value);
    });

    it('preserves a prop-bound value when there is no default content', async () => {
        const fixture = await initTestFixture('<text-area label="Desc" value="preset"><template prop="value"><b>Prop content</b></template></text-area>');
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('<b>Prop content</b>');
        expect(fixture.input.value).toBe('<b>Prop content</b>');
    });

    it('replaces a value assigned before connection with default content', async () => {
        const host = document.createElement('text-area');
        host.setAttribute('label', 'Desc');
        host.value = 'preset';
        host.appendChild(document.createTextNode('Default content'));

        try {
            document.body.appendChild(host);
            await host.updateComplete;
            await host.updateComplete;

            expect(host.value).toBe('Default content');
            expect(host.inputElement.value).toBe('Default content');
        } finally {
            host.remove();
        }
    });

    it.each([
        ['direct', '   ', 'preset'],
        ['template', '<template>   </template>', '   '],
    ])('handles whitespace-only %s content according to collector rules', async (_name, markup, expected) => {
        const fixture = await initTestFixture(`<text-area label="Desc" value="preset">${markup}</text-area>`);
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe(expected);
        expect(fixture.input.value).toBe(expected);
    });
});

describe('Native textarea parity', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    /** @param {string} content */
    function getNativeValue(content) {
        const container = document.createElement('div');
        container.innerHTML = `<textarea>${content}</textarea>`;
        return container.querySelector('textarea').value;
    }

    /** @param {string} markup */
    async function getComponentValue(markup) {
        const fixture = await initTestFixture(`<text-area label="Desc">${markup}</text-area>`);
        await fixture.host.updateComplete;
        expect(fixture.input.value).toBe(fixture.host.value);
        return fixture.host.value;
    }

    // [name, content, root-bound markup or null, include default slot]
    const parityCases = [
        ['plain text', 'Hello world', null, true],
        ['encoded markup', '&lt;b&gt;Hello&lt;/b&gt; &amp; world', null, true],
        ['bare & and >', 'a && b > c', null, true],
        ['named and numeric entities', '&copy; &#169; &#xA9; &euro; &nbsp;|', null, true],
        ['element with entity', '<b>A &amp; B</b>', '<b prop="value">A &amp; B</b>', true],
        ['attributes with entities', '<a href="?a=1&amp;b=2" title="x &quot;y&quot;">link</a>', '<a prop="value" href="?a=1&amp;b=2" title="x &quot;y&quot;">link</a>', true],
        ['nested elements', '<p class="x"><i>A</i> &lt;B&gt; <span>C &amp; D</span></p>', '<p prop="value" class="x"><i>A</i> &lt;B&gt; <span>C &amp; D</span></p>', true],
        ['mixed text and elements', 'Önce <b>kalın</b> sonra &lt;i&gt;', null, true],
        ['void elements', 'satır<br>satır<br><img src="x.png" alt="a &amp; b">', null, true],
        ['root void element', '<img src="x.png" alt="a &amp; b">', '<img prop="value" src="x.png" alt="a &amp; b">', true],
        ['encoded closing textarea', 'x &lt;/textarea&gt; y', null, true],
        ['inner whitespace and line breaks', '  satır 1\n  satır 2  ', null, true],
        ['script content', "<script>alert('x & y')</script>", null, true],
        // Out-of-context <td> is dropped when parsed in a regular element, so only template preserves it.
        ['context-dependent tag', '<td>hücre</td>', null, false],
        // A top-level template in the default slot is unwrapped by the collector.
        ['nested template', '<template><b>T</b></template>', null, false],
    ];

    describe.each(parityCases)('%s', (_name, content, rootMarkup, includeDefaultSlot) => {
        it.runIf(includeDefaultSlot)('default slot matches native', async () => {
            expect(await getComponentValue(content)).toBe(getNativeValue(content));
        });

        it('template prop binding matches native', async () => {
            expect(await getComponentValue(`<template prop="value">${content}</template>`)).toBe(getNativeValue(content));
        });

        it.runIf(rootMarkup !== null)('root prop binding matches native', async () => {
            expect(await getComponentValue(rootMarkup)).toBe(getNativeValue(content));
        });
    });

    describe('documented deviations', () => {
        it('normalizes tag and attribute casing because content is parsed as HTML', async () => {
            const content = '<B CLASS=x>Hi</B>';
            const expected = '<b class="x">Hi</b>';

            expect(getNativeValue(content)).toBe(content);
            expect(await getComponentValue(content)).toBe(expected);
            expect(await getComponentValue(`<template prop="value">${content}</template>`)).toBe(expected);
            expect(await getComponentValue('<B prop="value" CLASS=x>Hi</B>')).toBe(expected);
        });

        it('drops comments because they are not slottable', async () => {
            const content = 'a<!-- note -->b';

            expect(getNativeValue(content)).toBe(content);
            expect(await getComponentValue(content)).toBe('ab');
            expect(await getComponentValue(`<template prop="value">${content}</template>`)).toBe('ab');
        });

        it('keeps the leading line break that native textarea strips', async () => {
            const content = '\nilk satır';

            expect(getNativeValue(content)).toBe('ilk satır');
            expect(await getComponentValue(`<template prop="value">${content}</template>`)).toBe(content);
        });
    });
});

describe('Accessibility (A11y) tests', () => {
    it('associates label with textarea via for/id and aria-labelledby', async () => {
        const fixture = await initTestFixture('<text-area label="Description"></text-area>');

        expect(fixture.label).not.toBeNull();
        expect(fixture.label.getAttribute('for')).toBe(fixture.host.fieldId);
        expect(fixture.label.id).toBe(fixture.host.labelId);

        expect(fixture.input.id).toBe(fixture.host.fieldId);
        expect(fixture.input.getAttribute('aria-labelledby')).toBe(fixture.host.labelId);
    });

    it('uses aria-label when hide-label is enabled', async () => {
        const fixture = await initTestFixture('<text-area label="Description" hide-label></text-area>');

        expect(fixture.label).toBeNull();
        expect(fixture.input.getAttribute('aria-label')).toBe('Description');
        expect(fixture.input.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('forwards helper attributes: autocomplete, spellcheck, inputmode', async () => {
        const fixture = await initTestFixture('<text-area label="Description" autocomplete="off" inputmode="text" spellcheck></text-area>');

        expect(fixture.input.getAttribute('autocomplete')).toBe('off');
        expect(fixture.input.getAttribute('inputmode')).toBe('text');
        expect(fixture.input.hasAttribute('spellcheck')).toBe(true);
        expect(fixture.input.spellcheck).toBe(true);
    });

    it('forwards rows, cols and wrap attributes', async () => {
        const fixture = await initTestFixture('<text-area label="Description" rows="4" cols="30" wrap="soft"></text-area>');

        expect(fixture.input.getAttribute('rows')).toBe('4');
        expect(fixture.input.getAttribute('cols')).toBe('30');
        expect(fixture.input.getAttribute('wrap')).toBe('soft');
    });
});

describe('Reset tests', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it.each([
        ['value attribute', 'component', false, '<text-area label="Desc" value="initial"></text-area>'],
        ['value attribute', 'form', false, '<text-area label="Desc" value="initial"></text-area>'],
        ['slot', 'component', false, '<text-area label="Desc">initial</text-area>'],
        ['slot', 'form', false, '<text-area label="Desc">initial</text-area>'],
        ['value attribute', 'component', true, '<text-area label="Desc" value="initial"></text-area>'],
        ['value attribute', 'form', true, '<text-area label="Desc" value="initial"></text-area>'],
        ['slot', 'component', true, '<text-area label="Desc">initial</text-area>'],
        ['slot', 'form', true, '<text-area label="Desc">initial</text-area>'],
    ])('when initial value is %s and %s reset is used, it resets the value', async (_source, resetType, changed, markup) => {
        /** @type {import('../types').TestFixture<HTMLInputElement>} */
        const fixture = await initTestFixture(markup);

        if (changed) {
            fixture.host.value = 'changed';
            await fixture.host.updateComplete;
        }

        if (resetType === 'component') {
            fixture.host.reset();
            await fixture.host.updateComplete;
        } else {
            fixture.reset.click();
            await new Promise(resolve => requestAnimationFrame(resolve));
        }

        expect(fixture.host.value).toBe('initial');
        expect(fixture.input.value).toBe('initial');
    });
});

describe('Description tests', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('renders description element when string property is set', async () => {
        const fixture = await initTestFixture('<text-area label="Description"></text-area>');

        fixture.host.description = 'Helper text for the field';
        await fixture.host.updateComplete;
        const descElement = fixture.host.querySelector('[data-role="description"]');

        expect(descElement).not.toBeNull();
        expect(descElement.textContent.trim()).toBe('Helper text for the field');
    });

    it('sets aria-describedby when description property is set', async () => {
        const fixture = await initTestFixture('<text-area label="Description"></text-area>');

        fixture.host.description = 'Helper text';
        await fixture.host.updateComplete;

        expect(fixture.input.getAttribute('aria-describedby')).toBe(fixture.host.descriptionId);
    });

    it('does not set aria-describedby when description is not set', async () => {
        const fixture = await initTestFixture('<text-area label="Description"></text-area>');

        expect(fixture.input.hasAttribute('aria-describedby')).toBe(false);
    });

    it('renders HTMLElement description property', async () => {
        const fixture = await initTestFixture('<text-area label="Description"></text-area>');

        const descDiv = document.createElement('div');
        descDiv.innerHTML = '<strong>Important:</strong> This is required';
        fixture.host.description = descDiv;
        await fixture.host.updateComplete;
        const descElement = fixture.querySelector('[data-role="description"]');

        expect(descElement).not.toBeNull();
        expect(descElement.querySelector('strong')).not.toBeNull();
        expect(descElement.querySelector('strong').textContent).toBe('Important:');
    });

    it('renders description slot when provided', async () => {
        const fixture = await initTestFixture('<text-area label="Description"><span prop="description">Slotted helper</span></text-area>');
        await fixture.host.updateComplete;
        const descElement = fixture.querySelector('[data-role="description"]');

        expect(descElement).not.toBeNull();
        expect(descElement.textContent).toContain('Slotted helper');
    });

    it('prefers property over slot when both are provided', async () => {
        const fixture = await initTestFixture('<text-area label="Description"><span prop="description">Slotted</span></text-area>');

        fixture.host.description = 'Property text';
        await fixture.host.updateComplete;
        const descElement = fixture.querySelector('[data-role="description"]');

        expect(descElement.textContent).toContain('Property text');
        expect(descElement.textContent).not.toContain('Slotted');
    });

    it('does not render description element when neither property nor slot is provided', async () => {
        const fixture = await initTestFixture('<text-area label="Description"></text-area>');
        const descElement = fixture.querySelector('[data-role="description"]');

        expect(descElement).toBeNull();
    });

    it('removes description when property is cleared', async () => {
        const fixture = await initTestFixture('<text-area label="Description"></text-area>');

        fixture.host.description = 'Helper text';
        await fixture.host.updateComplete;
        expect(fixture.querySelector('[data-role="description"]')).not.toBeNull();

        fixture.host.description = undefined;
        await fixture.host.updateComplete;
        expect(fixture.querySelector('[data-role="description"]')).toBeNull();
    });

    it('has correct description id format', async () => {
        const fixture = await initTestFixture('<text-area label="Description"></text-area>');

        fixture.host.description = 'Helper';
        await fixture.host.updateComplete;
        const descElement = fixture.querySelector('[data-role="description"]');

        expect(descElement.id).toBe(fixture.host.descriptionId);
        expect(descElement.id).toContain('description');
        expect(descElement.id).toContain(fixture.host.uniqueId);
    });
});

/*
TEST CASES FOR TEXT AREA COMPONENT

COMPONENT CONTRACT
1. throws when required label is missing
2. throws when a required field is cleared after initial render

VALUE / SLOT BEHAVIOR
1. uses value attribute/property as source of truth when provided
2. collects default slotted text nodes as initial textarea value when value is empty
3. collects default slotted element nodes as literal text (outerHTML)
4. ignores slotted nodes when value is already set and logs warning
5. non-default slot content should keep standard SlotCollector behavior (extensibility)

VALIDATION
1. required: shows error when value becomes empty after interaction
2. minlength: shows error on blur when below minimum length
3. maxlength: native textarea prevents overflow input, no custom error if capped
4. validation is not checked immediately while valid (interacted-gated behavior)
5. validation is checked immediately after becoming invalid and while editing to valid state
6. if required field is cleared after interaction, validation appears immediately
7. valueUpdated path triggers validation refresh for programmatic value changes

EVENTS
1. input event updates host.value and dispatches custom input event
2. change event updates host.value and dispatches custom change event
3. blur triggers interacted-based validation check
4. invalid event forces validation check

ACCESSIBILITY (A11Y)
1. associates <label> with <textarea> via for/id and aria-labelledby
2. uses aria-label when hide-label is enabled and no visible label exists
3. sets aria-required="false" when required is not set
4. wires aria-errormessage to rendered error element id
5. removes aria-errormessage when field becomes valid
6. keeps accessible name sourced from label even with placeholder present
7. forwards helper attributes: autocomplete, spellcheck, inputmode
8. textarea is keyboard reachable and blur updates invalid UI
9. toggles aria-invalid when validity state changes
10. prevents focus when disabled

TEXTAREA-SPECIFIC ATTRS
1. forwards rows/cols/wrap attributes to native textarea
2. respects readonly behavior

DESCRIPTION
1. renders description element when string property is set
2. sets aria-describedby when description property is set
3. does not set aria-describedby when description is not set
4. renders HTMLElement description property
5. renders description slot when provided
6. prefers property over slot when both are provided
7. does not render description element when neither property nor slot is provided
8. removes description when property is cleared
9. has correct description id format with componentName and uniqueId

RESET
1. component.reset() restores the initial value from the value attribute
2. form reset restores the initial value from the value attribute
3. component.reset() restores the initial value from default slotted text
4. form reset restores the initial value from default slotted text
5. component and form reset restore the initial value both before and after the value changes
*/
