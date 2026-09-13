import ComboBox from '../../components/select/combo-box.js';

defineElement('combo-box', ComboBox);

/** @typedef {import('../../base/select-base.js').default} SelectBase */
/** @typedef {import('../types').TestFixture<HTMLInputElement, SelectBase>} ComboBoxFixture */

/**
 * Initializes a combo-box and returns useful internals.
 * @param {string} elementStr
 * @returns {Promise<ComboBoxFixture> & { clearButton: HTMLButtonElement | null }}>
 */
async function initComboBox(elementStr) {
    const fixture = await initTestFixture(elementStr);

    Object.defineProperty(fixture, 'comboboxDiv', { get: () => fixture.host.querySelector('div[role="combobox"]') });
    Object.defineProperty(fixture, 'searchInput', { get: () => fixture.host.querySelector('input[data-role="search"]') });
    Object.defineProperty(fixture, 'display', { get: () => fixture.host.querySelector('div[data-role="display"]') });
    Object.defineProperty(fixture, 'listbox', { get: () => fixture.host.querySelector('div[role="listbox"]') });
    Object.defineProperty(fixture, 'clearButton', { get: () => fixture.host.querySelector('button[data-clear]') });

    if (!fixture.comboboxDiv || !fixture.searchInput || !fixture.display || !fixture.listbox) {
        throw new Error('combo-box internals not found');
    }

    return fixture;
}

function getOptionDivs(fixture) {
    return Array.from(fixture.host.querySelectorAll('div[role="listbox"] div[role="option"]'));
}

async function openList(fixture) {
    fixture.comboboxDiv.focus();
    await fixture.user.keyboard('{Enter}');
    await fixture.host.updateComplete;
}

async function closeListWithEscape(fixture) {
    await fixture.user.keyboard('{Escape}');
    await fixture.host.updateComplete;
}

describe('ComboBox - Accessibility (A11y) tests', () => {
    it('associates <label> with value input via for/id and aria-labelledby', async () => {
        const fixture = await initComboBox('<combo-box label="Country"></combo-box>');

        expect(fixture.label).not.toBeNull();
        expect(fixture.label.getAttribute('for')).toBe(fixture.host.fieldId);
        expect(fixture.label.id).toBe(fixture.host.labelId);

        expect(fixture.input.id).toBe(fixture.host.fieldId);
        expect(fixture.input.getAttribute('aria-labelledby')).toBe(fixture.host.labelId);
        expect(fixture.input.hasAttribute('aria-label')).toBe(false);
    });

    it('uses aria-label when hide-label is enabled (no visible label)', async () => {
        const fixture = await initComboBox('<combo-box label="Country" hide-label></combo-box>');

        expect(fixture.label).toBeNull();
        expect(fixture.input.getAttribute('aria-label')).toBe('Country');
        expect(fixture.input.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('sets required semantics (required + aria-required) and wires aria-errormessage', async () => {
        const fixture = await initComboBox('<combo-box label="Country" required ><option value="tr">TR</option></combo-box>');

        expect(fixture.input.required).toBe(true);
        expect(fixture.input.getAttribute('aria-required')).toBe('true');
        expect(fixture.error).toBeNull();
        expect(fixture.input.getAttribute('aria-errormessage')).toBeNull();

        expect(fixture.label).not.toBeNull();
        expect(fixture.label.textContent).toContain('Country');
    });

    it('sets aria-required="false" when required is not set', async () => {
        const fixture = await initComboBox('<combo-box label="X"></combo-box>');

        expect(fixture.input.getAttribute('aria-required')).toBe('false');
        expect(fixture.input.required).toBe(false);
    });
});

describe('ComboBox - Options & selection', () => {
    it('parses <option> children and respects selected attribute', async () => {
        const fixture = await initComboBox(`
			<combo-box field-id="color" label="Color" placeholder="Pick">
				<option value="r">Red</option>
				<option value="g" selected>Green</option>
			</combo-box>
		`);

        expect(fixture.host.value).toBe('g');
        expect(fixture.input.value).toBe('g');
        expect(fixture.display.textContent).toContain('Green');

        const optionDivs = getOptionDivs(fixture);
        expect(optionDivs.length).toBe(2);

        const selected = optionDivs.find(el => el.hasAttribute('aria-selected'));
        expect(selected).toBeTruthy();
        expect(selected.dataset.value).toBe('g');
    });

    it('opens with keyboard and selects active option with Enter', async () => {
        const fixture = await initComboBox(`
			<combo-box field-id="city" label="City" placeholder="Pick">
				<option value="a">Ankara</option>
				<option value="i">Istanbul</option>
			</combo-box>
		`);

        expect(fixture.host.value).toBe('');
        expect(fixture.display.textContent).toContain('Pick');

        await openList(fixture);
        expect(fixture.host.isOpen).toBe(true);
        expect(fixture.comboboxDiv.dataset.open).not.toBeUndefined();

        await fixture.user.keyboard('{ArrowDown}');
        await fixture.host.updateComplete;

        await fixture.user.keyboard('{Enter}');
        await fixture.host.updateComplete;

        expect(fixture.host.isOpen).toBe(false);
        expect(fixture.host.value).toBe('a');
        expect(fixture.input.value).toBe('a');
        expect(fixture.display.textContent).toContain('Ankara');
    });

    it('selects option via click and closes list', async () => {
        const fixture = await initComboBox(`
			<combo-box field-id="lang" label="Language" placeholder="Pick">
				<option value="js">JavaScript</option>
				<option value="ts">TypeScript</option>
			</combo-box>
		`);

        await openList(fixture);
        const optionDivs = getOptionDivs(fixture);
        expect(optionDivs.length).toBe(2);

        await fixture.user.click(optionDivs[1]);
        await fixture.host.updateComplete;

        expect(fixture.host.isOpen).toBe(false);
        expect(fixture.host.value).toBe('ts');
        expect(fixture.display.textContent).toContain('TypeScript');
    });

    it('selects option when clicking nested element inside option (delegated click)', async () => {
        const fixture = await initComboBox('<combo-box field-id="city" label="City" placeholder="Pick"></combo-box>');

        fixture.host.options = [
            { value: 'ank', innerHTML: '<span data-part="label">Ankara</span>' },
            { value: 'ist', innerHTML: '<span data-part="label">Istanbul</span>' },
        ];
        await fixture.host.updateComplete;

        await openList(fixture);
        const nestedLabel = fixture.host.querySelector('div[role="listbox"] div[role="option"] span[data-part="label"]');
        expect(nestedLabel).not.toBeNull();

        await fixture.user.click(nestedLabel);
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('ank');
        expect(fixture.host.isOpen).toBe(false);
    });

    it('does not select disabled option on delegated click', async () => {
        const fixture = await initComboBox('<combo-box field-id="city" label="City" placeholder="Pick"></combo-box>');

        fixture.host.options = [
            { value: 'ank', label: 'Ankara' },
            { value: 'ist', label: 'Istanbul', disabled: true },
        ];
        await fixture.host.updateComplete;

        await openList(fixture);
        const optionDivs = getOptionDivs(fixture);
        await fixture.user.click(optionDivs[1]);
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('');
        expect(fixture.host.isOpen).toBe(true);
    });

    it('updates active descendant to hovered option id (delegated mouseover)', async () => {
        const fixture = await initComboBox(`
			<combo-box field-id="city" label="City" placeholder="Pick">
				<option value="a">Ankara</option>
				<option value="i">Istanbul</option>
			</combo-box>
		`);

        await openList(fixture);
        const optionDivs = getOptionDivs(fixture);

        await fixture.user.hover(optionDivs[1]);
        await fixture.host.updateComplete;

        expect(fixture.host.activeIndex).toBe(1);
        expect(fixture.comboboxDiv.getAttribute('aria-activedescendant')).toBe(optionDivs[1].id);
    });
});

describe('ComboBox - Popover behavior', () => {
    it('opens and closes the native popover together with isOpen', async () => {
        const fixture = await initComboBox(`
            <combo-box field-id="city" label="City" placeholder="Pick">
                <option value="a">Ankara</option>
            </combo-box>
        `);

        expect(fixture.listbox.matches(':popover-open')).toBe(false);

        await openList(fixture);
        expect(fixture.host.isOpen).toBe(true);
        expect(fixture.listbox.matches(':popover-open')).toBe(true);

        await closeListWithEscape(fixture);
        expect(fixture.host.isOpen).toBe(false);
        expect(fixture.listbox.matches(':popover-open')).toBe(false);
        expect(fixture.host.activeIndex).toBe(-1);
        expect(document.activeElement).toBe(fixture.comboboxDiv);
    });

    it('closes on an outside pointer interaction but stays open for an inside interaction', async () => {
        const fixture = await initComboBox(`
            <combo-box field-id="city" label="City" placeholder="Pick">
                <option value="a">Ankara</option>
            </combo-box>
        `);

        const outside = document.createElement('button');
        document.body.append(outside);

        await openList(fixture);
        await fixture.user.click(fixture.searchInput);
        expect(fixture.host.isOpen).toBe(true);

        await fixture.user.click(outside);
        await fixture.host.updateComplete;
        expect(fixture.host.isOpen).toBe(false);
        expect(fixture.listbox.matches(':popover-open')).toBe(false);
    });

    it.each(['scroll', 'resize'])('closes when the viewport is invalidated by %s', async eventType => {
        const fixture = await initComboBox(`
            <combo-box field-id="city" label="City" placeholder="Pick">
                <option value="a">Ankara</option>
            </combo-box>
        `);

        await openList(fixture);
        globalThis.dispatchEvent(new Event(eventType));
        await fixture.host.updateComplete;

        expect(fixture.host.isOpen).toBe(false);
        expect(fixture.listbox.matches(':popover-open')).toBe(false);
    });

    it('does not close when the listbox itself is scrolled', async () => {
        const fixture = await initComboBox(`
            <combo-box field-id="city" label="City" placeholder="Pick">
                <option value="a">Ankara</option>
            </combo-box>
        `);

        await openList(fixture);
        fixture.listbox.dispatchEvent(new Event('scroll', { bubbles: true }));
        await fixture.host.updateComplete;

        expect(fixture.host.isOpen).toBe(true);
        expect(fixture.listbox.matches(':popover-open')).toBe(true);
    });

    it('cleans up global close handling when disconnected while open', async () => {
        const fixture = await initComboBox(`
            <combo-box field-id="city" label="City" placeholder="Pick">
                <option value="a">Ankara</option>
            </combo-box>
        `);
        const closeSpy = vi.fn();
        fixture.host.addEventListener('close', closeSpy);

        await openList(fixture);
        fixture.host.remove();
        const closeCountAfterDisconnect = closeSpy.mock.calls.length;
        globalThis.dispatchEvent(new Event('scroll'));
        globalThis.dispatchEvent(new Event('resize'));
        await new Promise(resolve => requestAnimationFrame(resolve));

        expect(closeSpy).toHaveBeenCalledTimes(closeCountAfterDisconnect);
    });

    it('dispatches open and close once for one open-close cycle', async () => {
        const fixture = await initComboBox(`
            <combo-box field-id="city" label="City" placeholder="Pick">
                <option value="a">Ankara</option>
            </combo-box>
        `);
        const openSpy = vi.fn();
        const closeSpy = vi.fn();
        fixture.host.addEventListener('open', openSpy);
        fixture.host.addEventListener('close', closeSpy);

        await openList(fixture);
        await closeListWithEscape(fixture);

        expect(openSpy).toHaveBeenCalledTimes(1);
        expect(closeSpy).toHaveBeenCalledTimes(1);
    });

    it.each([
        ['below', { x: 40, top: 100, bottom: 140, width: 180 }, 700, 700, false],
        ['above', { x: 40, top: 700, bottom: 740, width: 180 }, 800, 800, true],
    ])('positions the list %s the combobox and clamps its height', async (_direction, rect, viewportHeight, scrollHeight, directionUp) => {
        const fixture = await initComboBox(`
            <combo-box field-id="city" label="City" placeholder="Pick">
                <option value="a">Ankara</option>
            </combo-box>
        `);
        vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(viewportHeight);
        vi.spyOn(fixture.comboboxDiv, 'getBoundingClientRect').mockReturnValue({ ...rect, height: rect.bottom - rect.top, right: rect.x + rect.width, y: rect.top, toJSON() {} });
        vi.spyOn(fixture.listbox, 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: 0, height: 0, width: 0, x: 0, y: 0, right: 0, left: 0, toJSON() {} });
        fixture.listbox.style.maxHeight = '1000px';
        Object.defineProperty(fixture.listbox, 'scrollHeight', { configurable: true, value: scrollHeight });

        await openList(fixture);
        await new Promise(resolve => requestAnimationFrame(resolve));

        expect(fixture.host.directionUp).toBe(directionUp);
        expect(fixture.listbox.style.minWidth).toBe(`${rect.width}px`);
        expect(fixture.listbox.style.left).toBe(`${rect.x}px`);
        expect(fixture.listbox.style.maxHeight).toBe(`${directionUp ? rect.top : viewportHeight - rect.bottom}px`);
        expect(fixture.listbox.style.top).toBe(directionUp ? '' : `${rect.bottom}px`);
        expect(fixture.listbox.style.bottom).toBe(directionUp ? `${viewportHeight - rect.top}px` : '');
    });
});

describe('ComboBox - Extended interaction behavior', () => {
    it.each(['Escape', 'Tab'])('commits the active option when native behavior closes with %s', async key => {
        const fixture = await initComboBox(`
            <combo-box field-id="city" label="City" native-behavior>
                <option value="a">Ankara</option>
                <option value="i">Istanbul</option>
            </combo-box>
        `);

        await openList(fixture);
        await fixture.user.keyboard('{ArrowDown}');
        await fixture.host.updateComplete;
        await fixture.user.keyboard(`{${key}}`);
        await fixture.host.updateComplete;

        expect(fixture.host.isOpen).toBe(false);
        expect(fixture.host.value).toBe('a');
    });

    it('stays open while focus moves between internal controls and closes outside the component', async () => {
        const fixture = await initComboBox(`
            <combo-box field-id="city" label="City" clearable>
                <option value="a" selected>Ankara</option>
            </combo-box>
        `);
        const outside = document.createElement('button');
        document.body.append(outside);

        await openList(fixture);
        fixture.clearButton.focus();
        await fixture.host.updateComplete;
        expect(fixture.host.isOpen).toBe(true);

        outside.focus();
        await fixture.host.updateComplete;
        expect(fixture.host.isOpen).toBe(false);
    });

    it('isolates open and close behavior between multiple ComboBox instances', async () => {
        const first = await initComboBox('<combo-box field-id="first" label="First"><option value="a">A</option></combo-box>');
        const secondHost = document.createElement('combo-box');
        secondHost.setAttribute('field-id', 'second');
        secondHost.setAttribute('label', 'Second');
        const secondOption = document.createElement('option');
        secondOption.value = 'b';
        secondOption.textContent = 'B';
        secondHost.append(secondOption);
        document.body.append(secondHost);
        await secondHost.updateComplete;
        const second = {
            host: secondHost,
            comboboxDiv: secondHost.querySelector('div[role="combobox"]'),
            user: first.user,
        };

        await openList(first);
        second.comboboxDiv.focus();
        await second.user.keyboard('{Enter}');
        await second.host.updateComplete;

        expect(first.host.isOpen).toBe(false);
        expect(second.host.isOpen).toBe(true);

        globalThis.dispatchEvent(new Event('scroll'));
        await Promise.all([first.host.updateComplete, second.host.updateComplete]);
        expect(first.host.isOpen).toBe(false);
        expect(second.host.isOpen).toBe(false);
    });

    it('keeps event counts balanced across repeated open and close cycles', async () => {
        const fixture = await initComboBox('<combo-box field-id="city" label="City"><option value="a">Ankara</option></combo-box>');
        const openSpy = vi.fn();
        const closeSpy = vi.fn();
        fixture.host.addEventListener('open', openSpy);
        fixture.host.addEventListener('close', closeSpy);

        for (let cycle = 0; cycle < 2; cycle++) {
            await openList(fixture);
            await closeListWithEscape(fixture);
        }

        expect(openSpy).toHaveBeenCalledTimes(2);
        expect(closeSpy).toHaveBeenCalledTimes(2);
        expect(fixture.host.isOpen).toBe(false);
    });

    it('updates the open list when options change', async () => {
        const fixture = await initComboBox('<combo-box field-id="city" label="City"><option value="a">Ankara</option></combo-box>');

        await openList(fixture);
        fixture.host.options = [
            { value: 'a', label: 'Ankara' },
            { value: 'i', label: 'Istanbul' },
        ];
        await fixture.host.updateComplete;

        expect(fixture.host.isOpen).toBe(true);
        expect(fixture.listbox.matches(':popover-open')).toBe(true);
        expect(getOptionDivs(fixture).map(option => option.dataset.value)).toEqual(['a', 'i']);
    });
});

describe('ComboBox - Filtering', () => {
    it('filters options as the user types in search', async () => {
        const fixture = await initComboBox(`
			<combo-box field-id="fruit" label="Fruit" placeholder="Pick">
				<option value="ap">Apple</option>
				<option value="ba">Banana</option>
				<option value="or">Orange</option>
			</combo-box>
		`);

        await openList(fixture);
        await fixture.user.type(fixture.searchInput, 'an');
        await fixture.host.updateComplete;
        const optionDivs = getOptionDivs(fixture);

        expect(optionDivs.length).toBe(2);
        expect(optionDivs.map(o => o.textContent.trim().toLowerCase())).toEqual(expect.arrayContaining(['banana', 'orange']));
    });
});

describe('ComboBox - Required validation', () => {
    it('shows required error after interaction when closed without selection', async () => {
        const fixture = await initComboBox(`
            <combo-box label="Team" required placeholder="Pick">
				<option value="a">A</option>
				<option value="b">B</option>
			</combo-box>
		`);

        expect(fixture.error).toBeNull();
        expect(fixture.input.getAttribute('aria-errormessage')).toBeNull();

        await openList(fixture); // focuses search => marks as interacted
        await closeListWithEscape(fixture);

        expect(fixture.input.getAttribute('aria-invalid')).toBe('true');
        expect(fixture.error).not.toBeNull();
        expect(fixture.error.id).toBe(fixture.host.errorId);
        expect(fixture.error.hidden).toBe(false);
        expect(fixture.error.textContent.trim()).toContain('gereklidir');
        expect(fixture.input.getAttribute('aria-errormessage')).toBe(fixture.host.errorId);
    });

    it('clears error after a valid selection is made', async () => {
        const fixture = await initComboBox(`
            <combo-box label="Team" required placeholder="Pick">
				<option value="a">A</option>
				<option value="b">B</option>
			</combo-box>
		`);

        expect(fixture.error).toBeNull();

        await openList(fixture);
        await closeListWithEscape(fixture);
        expect(fixture.error).not.toBeNull();

        await openList(fixture);
        const optionDivs = getOptionDivs(fixture);
        await fixture.user.click(optionDivs[0]);
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('a');
        expect(fixture.input.getAttribute('aria-invalid')).toBeNull();
        expect(fixture.error).toBeNull();
        expect(fixture.input.getAttribute('aria-errormessage')).toBeNull();
    });
});

describe('ComboBox - Options property', () => {
    it('accepts options array and renders them', async () => {
        const fixture = await initComboBox('<combo-box field-id="x" label="X" placeholder="Pick"></combo-box>');

        fixture.host.options = ['one', 'two'];
        await fixture.host.updateComplete;
        await openList(fixture);
        const optionDivs = getOptionDivs(fixture);

        expect(optionDivs.length).toBe(2);
        expect(optionDivs.map(o => o.dataset.value)).toEqual(['one', 'two']);
    });

    it('throws when options is not an array', async () => {
        const fixture = await initComboBox('<combo-box field-id="x" label="X"></combo-box>');
        expect(() => {
            fixture.host.options = /** @type {any} */ ('nope');
        }).toThrow(/options must be an array/i);
    });

    it('ignores slotted nodes and warns when options are already set via property', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const validateSpy = vi.spyOn(ComboBox.prototype, 'validateNode');

        // options connect'ten önce atanmalı ki bağlama sırasında hasOptions true olsun
        const host = document.createElement('combo-box');
        host.setAttribute('field-id', 'x');
        host.setAttribute('label', 'X');
        host.options = ['one'];

        const slottedOption = document.createElement('option');
        slottedOption.value = 'two';
        slottedOption.textContent = 'Two';
        host.appendChild(slottedOption);

        document.body.appendChild(host);
        await host.updateComplete;

        expect(validateSpy).toHaveBeenCalledWith(slottedOption, 'default');
        expect(validateSpy).toHaveReturnedWith(false);
        expect(warnSpy).toHaveBeenCalledWith('Options are already set via property. Ignoring slotted nodes.');

        warnSpy.mockRestore();
        validateSpy.mockRestore();
        host.remove();
    });

    it('rejects unsupported slotted children and logs an error', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const validateSpy = vi.spyOn(ComboBox.prototype, 'validateNode');

        const host = document.createElement('combo-box');
        host.setAttribute('field-id', 'x');
        host.setAttribute('label', 'X');

        const invalidChild = document.createElement('div');
        invalidChild.textContent = 'Invalid';
        host.appendChild(invalidChild);

        document.body.appendChild(host);
        await host.updateComplete;

        expect(validateSpy).toHaveBeenCalledWith(invalidChild, 'default');
        expect(validateSpy).toHaveReturnedWith(false);
        expect(errorSpy).toHaveBeenCalledWith('Only `HTMLOptionElement` and `CustomOption` are allowed as children of `combo-box`.');

        errorSpy.mockRestore();
        validateSpy.mockRestore();
        host.remove();
    });
});

describe('ComboBox - Filter-required and filter-threshold', () => {
    it('does not open list when filterRequired is true and threshold is not met', async () => {
        const fixture = await initComboBox('<combo-box field-id="search" label="Search" filter-required filter-threshold="2" placeholder="Type to search"></combo-box>');

        fixture.host.options = [
            { value: 'apple', label: 'Apple' },
            { value: 'apricot', label: 'Apricot' },
        ];
        await fixture.host.updateComplete;

        fixture.comboboxDiv.focus();
        await fixture.user.keyboard('{Enter}');
        await fixture.host.updateComplete;

        expect(fixture.host.isOpen).toBe(false);
    });

    it('opens list when threshold is met with filterRequired', async () => {
        const fixture = await initComboBox('<combo-box field-id="search" label="Search" filter-required filter-threshold="2" placeholder="Type to search"></combo-box>');

        fixture.host.options = [
            { value: 'apple', label: 'Apple' },
            { value: 'apricot', label: 'Apricot' },
        ];
        await fixture.host.updateComplete;

        fixture.searchInput.focus();
        await fixture.user.type(fixture.searchInput, 'ap');
        await fixture.host.updateComplete;
        const optionDivs = getOptionDivs(fixture);

        expect(fixture.host.isOpen).toBe(true);
        expect(optionDivs.length).toBe(2);
    });

    it('returns empty filteredOptions when threshold is not met and filterRequired is true', async () => {
        const fixture = await initComboBox('<combo-box field-id="search" label="Search" filter-required filter-threshold="3" placeholder="Type to search"></combo-box>');

        fixture.host.options = [
            { value: 'apple', label: 'Apple' },
            { value: 'apricot', label: 'Apricot' },
        ];
        await fixture.host.updateComplete;

        fixture.searchInput.focus();
        await fixture.user.type(fixture.searchInput, 'ap');
        await fixture.host.updateComplete;

        const optionDivs = getOptionDivs(fixture);
        expect(optionDivs.length).toBe(0);
    });

    it('closes list and clears filter when typing goes below threshold with filterRequired', async () => {
        const fixture = await initComboBox('<combo-box field-id="search" label="Search" filter-required filter-threshold="2" placeholder="Type to search"></combo-box>');

        fixture.host.options = [
            { value: 'apple', label: 'Apple' },
            { value: 'apricot', label: 'Apricot' },
        ];
        await fixture.host.updateComplete;

        fixture.searchInput.focus();
        await fixture.user.type(fixture.searchInput, 'apple');
        await fixture.host.updateComplete;
        expect(fixture.host.isOpen).toBe(true);

        await fixture.user.clear(fixture.searchInput);
        await fixture.host.updateComplete;

        expect(fixture.host.isOpen).toBe(false);
    });

    it('does not show indicator (arrow) when filterRequired is true', async () => {
        const fixture = await initComboBox('<combo-box field-id="search" label="Search" filter-required placeholder="Type to search"></combo-box>');

        const indicator = fixture.querySelector('svg[role="presentation"]');
        expect(indicator).toBeNull();
    });

    it('shows indicator (arrow) when filterRequired is false', async () => {
        const fixture = await initComboBox('<combo-box field-id="search" label="Search" placeholder="Type to search"></combo-box>');

        const indicator = fixture.querySelector('svg[role="presentation"]');
        expect(indicator).not.toBeNull();
    });
});

describe('ComboBox - Event emission control (programmatic vs user-driven)', () => {
    it('does not emit input/change when setting initial selected option via options property', async () => {
        const fixture = await initComboBox('<combo-box field-id="x" label="X" placeholder="Pick"></combo-box>');

        const inputSpy = vi.fn();
        const changeSpy = vi.fn();
        fixture.host.addEventListener('input', inputSpy);
        fixture.host.addEventListener('change', changeSpy);

        fixture.host.options = [
            { value: 'a', label: 'A', selected: true },
            { value: 'b', label: 'B' },
        ];
        await fixture.host.updateComplete;

        expect(inputSpy).not.toHaveBeenCalled();
        expect(changeSpy).not.toHaveBeenCalled();
        expect(fixture.host.value).toBe('a');
    });

    it('does not emit input/change when external code sets value property', async () => {
        const fixture = await initComboBox(`
            <combo-box field-id="x" label="X" placeholder="Pick">
                <option value="a">A</option>
                <option value="b">B</option>
            </combo-box>
        `);

        const inputSpy = vi.fn();
        const changeSpy = vi.fn();
        fixture.host.addEventListener('input', inputSpy);
        fixture.host.addEventListener('change', changeSpy);

        fixture.host.value = 'b';
        await fixture.host.updateComplete;

        expect(inputSpy).not.toHaveBeenCalled();
        expect(changeSpy).not.toHaveBeenCalled();
        expect(fixture.host.value).toBe('b');
    });

    it('does not emit input/change when slotted option with selected is parsed', async () => {
        const fixture = await initComboBox(`
            <combo-box field-id="x" label="X" placeholder="Pick">
                <option value="a" selected>A</option>
                <option value="b">B</option>
            </combo-box>
        `);

        const inputSpy = vi.fn();
        const changeSpy = vi.fn();
        fixture.host.addEventListener('input', inputSpy);
        fixture.host.addEventListener('change', changeSpy);

        // Events should not fire during initial parse
        expect(inputSpy).not.toHaveBeenCalled();
        expect(changeSpy).not.toHaveBeenCalled();
        expect(fixture.host.value).toBe('a');
    });

    it('emits input/change when user clicks to select an option', async () => {
        const fixture = await initComboBox(`
            <combo-box field-id="x" label="X" placeholder="Pick">
                <option value="a">A</option>
                <option value="b">B</option>
            </combo-box>
        `);

        const inputSpy = vi.fn();
        const changeSpy = vi.fn();
        fixture.host.addEventListener('input', inputSpy);
        fixture.host.addEventListener('change', changeSpy);

        await openList(fixture);
        const optionDivs = getOptionDivs(fixture);
        await fixture.user.click(optionDivs[0]);
        await fixture.host.updateComplete;

        expect(inputSpy).toHaveBeenCalledTimes(1);
        expect(changeSpy).toHaveBeenCalledTimes(1);
        expect(fixture.host.value).toBe('a');
    });

    it('emits input/change when user selects with keyboard Enter', async () => {
        const fixture = await initComboBox(`
            <combo-box field-id="x" label="X" placeholder="Pick">
                <option value="a">A</option>
                <option value="b">B</option>
            </combo-box>
        `);

        const inputSpy = vi.fn();
        const changeSpy = vi.fn();
        fixture.host.addEventListener('input', inputSpy);
        fixture.host.addEventListener('change', changeSpy);

        await openList(fixture);
        await fixture.user.keyboard('{ArrowDown}');
        await fixture.host.updateComplete;
        await fixture.user.keyboard('{Enter}');
        await fixture.host.updateComplete;

        expect(inputSpy).toHaveBeenCalledTimes(1);
        expect(changeSpy).toHaveBeenCalledTimes(1);
        expect(fixture.host.value).toBe('a');
    });

    it('emits input/change when clear button is clicked', async () => {
        const fixture = await initComboBox(`
            <combo-box field-id="x" label="X" placeholder="Pick" clearable>
                <option value="a" selected>A</option>
            </combo-box>
        `);

        const inputSpy = vi.fn();
        const changeSpy = vi.fn();
        fixture.host.addEventListener('input', inputSpy);
        fixture.host.addEventListener('change', changeSpy);

        // Initial state should not emit
        expect(inputSpy).not.toHaveBeenCalled();
        expect(changeSpy).not.toHaveBeenCalled();

        const clearButton = fixture.host.querySelector('button[data-clear]');
        await fixture.user.click(clearButton);
        await fixture.host.updateComplete;

        expect(inputSpy).toHaveBeenCalledTimes(1);
        expect(changeSpy).toHaveBeenCalledTimes(1);
        expect(fixture.host.value).toBe('');
    });

    it('emits input/change when user selects with native-behavior arrow keys while closed', async () => {
        const fixture = await initComboBox(`
            <combo-box field-id="x" label="X" placeholder="Pick" native-behavior>
                <option value="a">A</option>
                <option value="b">B</option>
            </combo-box>
        `);

        const inputSpy = vi.fn();
        const changeSpy = vi.fn();
        fixture.host.addEventListener('input', inputSpy);
        fixture.host.addEventListener('change', changeSpy);

        fixture.comboboxDiv.focus();
        await fixture.user.keyboard('{ArrowDown}');
        await fixture.host.updateComplete;

        expect(inputSpy).toHaveBeenCalledTimes(1);
        expect(changeSpy).toHaveBeenCalledTimes(1);
        expect(fixture.host.value).toBe('a');
    });
});
