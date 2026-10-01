import Lookup from '../../components/select/lookup.js';

defineElement('lookup-input', Lookup);

/**
 * Initializes a lookup and exposes its internal controls.
 * @param {string} elementStr
 */
async function initLookup(elementStr) {
    const fixture = await initTestFixture(elementStr);

    Object.defineProperty(fixture, 'searchInput', { get: () => fixture.host.querySelector('input[data-role="search"]') });
    Object.defineProperty(fixture, 'listbox', { get: () => fixture.host.querySelector('div[role="listbox"]') });

    if (!fixture.input || !fixture.searchInput || !fixture.listbox) {
        throw new Error('lookup internals not found');
    }

    return fixture;
}

function getOptionElements(fixture) {
    return Array.from(fixture.host.querySelectorAll('div[role="listbox"] div[role="option"]'));
}

/**
 * Types text into the search input of the lookup component.
 * @param {import('../types.js').TestFixture<Lookup>} fixture
 * @param {string} text
 */
async function typeSearch(fixture, text) {
    fixture.searchInput.focus();
    await fixture.user.type(fixture.searchInput, text);
    await fixture.host.updateComplete;
}

describe('Lookup - Options updates', () => {
    it('LKP-201 accepts string, number, object, and HTMLOptionElement option entries', async () => {
        const fixture = await initLookup('<lookup-input label="City"></lookup-input>');
        const optionElement = document.createElement('option');
        optionElement.value = 'd';
        optionElement.textContent = 'Delta';

        fixture.host.options = ['Alpha', 2, { value: 'g', label: 'Gamma' }, optionElement];
        fixture.host.filter = 'a';
        await fixture.host.updateComplete;

        expect(fixture.host.options).toHaveLength(4);
        expect(fixture.host.filteredOptions.map(option => option.value)).toEqual(['g', 'd']);
    });

    it('LKP-202 throws when options is not an array', async () => {
        const fixture = await initLookup('<lookup-input label="City"></lookup-input>');

        expect(() => {
            fixture.host.options = /** @type {any} */ ('not-an-array');
        }).toThrow(/options must be an array/i);
    });

    it('LKP-203 ignores slotted options and warns when options are set by property', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const host = document.createElement('lookup-input');
        host.setAttribute('label', 'City');
        document.body.append(host);
        await host.updateComplete;

        host.options = ['Ankara'];
        const slottedOption = document.createElement('option');
        slottedOption.value = 'i';
        slottedOption.textContent = 'Istanbul';
        expect(host.validateNode(slottedOption, 'default')).toBe(false);

        expect(warnSpy).toHaveBeenCalledWith('Options are already set via property. Ignoring slotted nodes.');
        expect(host.options).toHaveLength(1);

        warnSpy.mockRestore();
        host.remove();
    });

    it('LKP-204 rejects unsupported slotted children and logs an error', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const host = document.createElement('lookup-input');
        host.setAttribute('label', 'City');
        const invalidChild = document.createElement('div');
        host.append(invalidChild);

        document.body.append(host);
        await host.updateComplete;

        expect(errorSpy).toHaveBeenCalledWith('Only `HTMLOptionElement` and `CustomOption` are allowed as children of `lookup-input`.');
        expect(host.options).toHaveLength(0);

        errorSpy.mockRestore();
        host.remove();
    });

    it('LKP-205 preserves the selection when the value remains in the replacement options', async () => {
        const fixture = await initTestFixture(`
            <lookup-input label="City" value="a">
                <option value="a" selected>Ankara</option>
                <option value="i">Istanbul</option>
            </lookup-input>
        `);

        fixture.host.options = [
            { value: 'a', label: 'Ankara updated' },
            { value: 'i', label: 'Istanbul' },
        ];
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('a');
        expect(fixture.host.selectedOption.value).toBe('a');
        expect(fixture.host.inputElement.value).toBe('a');
    });

    it('LKP-105 clears an unmatched value when a selection already exists', async () => {
        const fixture = await initLookup('<lookup-input label="City" value="a"><option value="a">Ankara</option></lookup-input>');

        fixture.host.value = 'unknown';
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('');
        expect(fixture.host.selectedOption.value).toBeUndefined();
        expect(fixture.input.value).toBe('');
    });

    it('LKP-206 clears the selection when replacement options no longer contain its value', async () => {
        const fixture = await initTestFixture(`
            <lookup-input label="City" value="a">
                <option value="a" selected>Ankara</option>
                <option value="i">Istanbul</option>
            </lookup-input>
        `);

        fixture.host.options = [{ value: 'i', label: 'Istanbul' }];
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('');
        expect(fixture.host.selectedOption.value).toBeUndefined();
        expect(fixture.host.inputElement.value).toBe('');
    });

    it('LKP-208 uses an explicitly selected option from the replacement options', async () => {
        const fixture = await initLookup('<lookup-input label="City" value="a"><option value="a">Ankara</option></lookup-input>');

        fixture.host.options = [
            { value: 'i', label: 'Istanbul' },
            { value: 'b', label: 'Bursa', selected: true },
        ];
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('b');
        expect(fixture.host.selectedOption.value).toBe('b');
        expect(fixture.input.value).toBe('b');
    });

    it('LKP-207 updates the rendered options while the list is open', async () => {
        const fixture = await initLookup('<lookup-input lang="en" label="City"><option value="i">Istanbul</option></lookup-input>');

        await typeSearch(fixture, 'i');
        expect(fixture.host.open).toBe(true);

        fixture.host.options = [
            { value: 'i', label: 'Istanbul' },
            { value: 'iz', label: 'Izmir' },
        ];
        await fixture.host.updateComplete;

        expect(fixture.host.open).toBe(true);
        expect(getOptionElements(fixture).map(option => option.dataset.value)).toEqual(['i', 'iz']);
    });
});

describe('Lookup - Value and selection contract', () => {
    it('LKP-101 starts empty without an initial value or selected option', async () => {
        const fixture = await initLookup('<lookup-input label="City"></lookup-input>');

        expect(fixture.host.value).toBe('');
        expect(fixture.host.selectedOption).toBeNull();
        expect(fixture.input.value).toBe('');
    });

    it('LKP-102 initializes from the value attribute and selects the matching slotted option', async () => {
        const fixture = await initLookup(`
            <lookup-input label="City" value="i">
                <option value="a">Ankara</option>
                <option value="i">Istanbul</option>
            </lookup-input>
        `);

        expect(fixture.host.value).toBe('i');
        expect(fixture.host.selectedOption.value).toBe('i');
        expect(fixture.input.value).toBe('i');
    });

    it('LKP-103 initializes from a slotted option marked selected', async () => {
        const fixture = await initLookup(`
            <lookup-input label="City">
                <option value="a" selected>Ankara</option>
                <option value="i">Istanbul</option>
            </lookup-input>
        `);

        expect(fixture.host.value).toBe('a');
        expect(fixture.host.selectedOption.value).toBe('a');
        expect(fixture.input.value).toBe('a');
    });

    it('LKP-104 selects a matching option after a programmatic value assignment', async () => {
        const fixture = await initLookup(`
            <lookup-input lang="en" label="City">
                <option value="a">Ankara</option>
                <option value="i">Istanbul</option>
            </lookup-input>
        `);

        fixture.host.value = 'i';
        await fixture.host.updateComplete;
        fixture.host.filter = 'i';
        await fixture.host.updateComplete;

        expect(fixture.host.selectedOption.value).toBe('i');
        expect(fixture.input.value).toBe('i');
    });

    it('LKP-105 clears an unmatched value when no option was selected', async () => {
        const fixture = await initLookup('<lookup-input label="City"><option value="a">Ankara</option></lookup-input>');

        fixture.host.value = 'unknown';
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('');
        expect(fixture.host.selectedOption?.value).toBeUndefined();
        expect(fixture.input.value).toBe('');
    });

    it('LKP-106 does not treat typed search text as a selected value', async () => {
        const fixture = await initLookup('<lookup-input label="City"><option value="a">Ankara</option></lookup-input>');

        await typeSearch(fixture, 'an');

        expect(fixture.host.filter).toBe('an');
        expect(fixture.host.value).toBe('');
        expect(fixture.input.value).toBe('');
    });

    it('LKP-107/LKP-401 updates the selection when an option is clicked and closes the list', async () => {
        const fixture = await initLookup(`
            <lookup-input lang="en" label="City">
                <option value="a">Ankara</option>
                <option value="i">Istanbul</option>
            </lookup-input>
        `);

        await typeSearch(fixture, 'is');
        await fixture.user.click(getOptionElements(fixture)[0]);
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('i');
        expect(fixture.host.selectedOption.value).toBe('i');
        expect(fixture.input.value).toBe('i');
        expect(fixture.host.open).toBe(false);
    });

    it('LKP-108 clears value, selectedOption, filter, and input when the clear button is clicked', async () => {
        const fixture = await initLookup('<lookup-input label="City" value="a" clearable><option value="a">Ankara</option></lookup-input>');
        const clearButton = fixture.host.querySelector('button[data-clear]');

        await fixture.user.click(clearButton);
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('');
        expect(fixture.host.selectedOption.value).toBeUndefined();
        expect(fixture.host.filter).toBe('');
        expect(fixture.input.value).toBe('');
    });
});

describe('Lookup - Filtering and list behavior', () => {
    it('LKP-301 keeps the list closed until filterThreshold is reached', async () => {
        const fixture = await initLookup('<lookup-input label="City" filter-threshold="2"><option value="a">Ankara</option></lookup-input>');

        await typeSearch(fixture, 'a');
        expect(fixture.host.open).toBe(false);

        await typeSearch(fixture, 'n');
        expect(fixture.host.open).toBe(true);
    });

    it('LKP-302 filters option labels case-insensitively by substring', async () => {
        const fixture = await initLookup(
            '<lookup-input lang="en" label="City"><option value="i">Istanbul</option><option value="iz">Izmir</option><option value="a">Ankara</option></lookup-input>'
        );

        await typeSearch(fixture, 'ST');

        expect(fixture.host.filteredOptions.map(option => option.value)).toEqual(['i']);
    });

    it('LKP-303 closes the list and clears the filter when search text is cleared', async () => {
        const fixture = await initLookup('<lookup-input label="City"><option value="i">Istanbul</option></lookup-input>');

        await typeSearch(fixture, 'is');
        expect(fixture.host.open).toBe(true);

        await fixture.user.clear(fixture.searchInput);
        await fixture.host.updateComplete;

        expect(fixture.host.filter).toBe('');
        expect(fixture.host.open).toBe(false);
    });

    it('LKP-304 shows filtered options and expanded state once the list opens', async () => {
        const fixture = await initLookup('<lookup-input lang="en" label="City"><option value="i">Istanbul</option><option value="a">Ankara</option></lookup-input>');

        await typeSearch(fixture, 'is');

        expect(fixture.host.open).toBe(true);
        expect(fixture.searchInput.getAttribute('aria-expanded')).toBe('true');
        expect(getOptionElements(fixture).map(option => option.dataset.value)).toEqual(['i']);
    });

    it('LKP-305 closes with Escape without changing the selected value', async () => {
        const fixture = await initLookup('<lookup-input label="City" value="a"><option value="a">Ankara</option><option value="i">Istanbul</option></lookup-input>');

        await typeSearch(fixture, 'is');
        await fixture.user.keyboard('{Escape}');
        await fixture.host.updateComplete;

        expect(fixture.host.open).toBe(false);
        expect(fixture.host.value).toBe('a');
    });

    it('LKP-306 restores selected display text and validates when search loses focus', async () => {
        const fixture = await initLookup('<lookup-input label="City" required value="a"><option value="a">Ankara</option></lookup-input>');
        const outside = document.createElement('button');
        document.body.append(outside);

        await typeSearch(fixture, 'an');
        outside.focus();
        await fixture.host.updateComplete;

        expect(fixture.host.filter).toBe('Ankara');
        expect(fixture.host.invalid).toBe(false);
    });

    it('LKP-307 shows the no-options item when the filter has no matches', async () => {
        const fixture = await initLookup('<lookup-input label="City"><option value="a">Ankara</option></lookup-input>');

        await typeSearch(fixture, 'zz');

        expect(getOptionElements(fixture)).toHaveLength(0);
        expect(fixture.listbox.querySelector('[aria-disabled]').hidden).toBe(false);
    });

    it('LKP-308 applies Turkish casing when filtering Turkish option labels', async () => {
        const fixture = await initLookup('<lookup-input lang="tr" label="Şehir"><option value="i">İstanbul</option></lookup-input>');

        await typeSearch(fixture, 'i');

        expect(fixture.host.filteredOptions.map(option => option.value)).toEqual(['i']);
    });
});

describe('Lookup - Keyboard and pointer selection', () => {
    it('LKP-402 selects the active option with Enter and closes the list', async () => {
        const fixture = await initLookup('<lookup-input lang="en" label="City"><option value="a">Ankara</option><option value="i">Istanbul</option></lookup-input>');

        await typeSearch(fixture, 'is');
        await fixture.user.keyboard('{Enter}');
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('i');
        expect(fixture.host.open).toBe(false);
    });

    it('LKP-403 selects the active option with Tab and closes the list', async () => {
        const fixture = await initLookup('<lookup-input lang="en" label="City"><option value="a">Ankara</option><option value="i">Istanbul</option></lookup-input>');

        await typeSearch(fixture, 'is');
        await fixture.user.keyboard('{Tab}');
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('i');
        expect(fixture.host.open).toBe(false);
    });

    it('LKP-404 moves the active descendant through filtered options with arrow keys', async () => {
        const fixture = await initLookup(
            '<lookup-input label="City"><option value="a">Ankara</option><option value="ad">Adana</option><option value="ak">Aksaray</option></lookup-input>'
        );

        await typeSearch(fixture, 'a');
        await fixture.user.keyboard('{ArrowDown}');
        await fixture.host.updateComplete;

        const options = getOptionElements(fixture);
        expect(fixture.host.activeIndex).toBe(1);
        expect(fixture.searchInput.getAttribute('aria-activedescendant')).toBe(options[1].id);
    });

    it('LKP-405 does not select a disabled option by click or keyboard', async () => {
        const fixture = await initLookup(
            '<lookup-input label="City"><option value="a">Ankara</option><option value="d" disabled>Adana</option><option value="k">Aksaray</option></lookup-input>'
        );

        await typeSearch(fixture, 'a');
        const options = getOptionElements(fixture);
        await fixture.user.click(options[1]);
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('');
        expect(fixture.host.open).toBe(true);

        await fixture.user.keyboard('{ArrowDown}');
        await fixture.user.keyboard('{Enter}');
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('k');
    });

    it('LKP-406 updates the active descendant when an option is hovered', async () => {
        const fixture = await initLookup('<lookup-input lang="en" label="City"><option value="a">Ankara</option><option value="i">Istanbul</option></lookup-input>');

        await typeSearch(fixture, 'i');
        const option = getOptionElements(fixture)[0];
        await fixture.user.hover(option);
        await fixture.host.updateComplete;

        expect(fixture.host.activeIndex).toBe(0);
        expect(fixture.searchInput.getAttribute('aria-activedescendant')).toBe(option.id);
    });

    it('LKP-109 does not emit input or change for programmatic value and options updates', async () => {
        const fixture = await initLookup('<lookup-input label="City"><option value="a">Ankara</option></lookup-input>');
        const inputSpy = vi.fn();
        const changeSpy = vi.fn();
        fixture.host.addEventListener('input', inputSpy);
        fixture.host.addEventListener('change', changeSpy);

        fixture.host.value = 'a';
        await fixture.host.updateComplete;
        fixture.host.options = [{ value: 'a', label: 'Ankara updated', selected: true }];
        await fixture.host.updateComplete;

        expect(inputSpy).not.toHaveBeenCalled();
        expect(changeSpy).not.toHaveBeenCalled();
    });

    it('LKP-110 emits input and change once for each user selection and clear action', async () => {
        const fixture = await initLookup('<lookup-input label="City" clearable><option value="a">Ankara</option></lookup-input>');
        const inputSpy = vi.fn();
        const changeSpy = vi.fn();
        fixture.host.addEventListener('input', inputSpy);
        fixture.host.addEventListener('change', changeSpy);

        await typeSearch(fixture, 'an');
        await fixture.user.click(getOptionElements(fixture)[0]);
        await fixture.host.updateComplete;
        await fixture.user.click(fixture.host.querySelector('button[data-clear]'));
        await fixture.host.updateComplete;

        expect(inputSpy).toHaveBeenCalledTimes(2);
        expect(changeSpy).toHaveBeenCalledTimes(2);
    });
});

describe('Lookup - Form and validation', () => {
    it('LKP-501 is invalid when required and no option is selected', async () => {
        const fixture = await initLookup('<lookup-input label="City" required></lookup-input>');

        expect(fixture.input.validity.valueMissing).toBe(true);
        expect(fixture.host.checkValidity()).toBe(false);
    });

    it('LKP-502 clears required validation after an option is selected', async () => {
        const fixture = await initLookup('<lookup-input label="City" required><option value="a">Ankara</option></lookup-input>');
        fixture.input.dispatchEvent(new Event('invalid', { cancelable: true }));
        await fixture.host.updateComplete;
        expect(fixture.host.invalid).toBe(true);

        await typeSearch(fixture, 'an');
        await fixture.user.click(getOptionElements(fixture)[0]);
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('a');
        expect(fixture.host.invalid).toBe(false);
        expect(fixture.host.validationMessage).toBe('');
    });

    it('LKP-503 associates the invalid input with its validation message', async () => {
        const fixture = await initLookup('<lookup-input label="City" required></lookup-input>');

        fixture.input.dispatchEvent(new Event('invalid', { cancelable: true }));
        await fixture.host.updateComplete;

        const error = fixture.host.querySelector('[data-role="error-message"]');
        expect(fixture.host.invalid).toBe(true);
        expect(error).not.toBeNull();
        expect(fixture.input.getAttribute('aria-errormessage')).toBe(error.id);
    });

    it('LKP-504 includes the selected value in FormData when name is set', async () => {
        const fixture = await initLookup('<lookup-input label="City" name="city" value="a"><option value="a">Ankara</option></lookup-input>');

        expect(new FormData(fixture.form).get('city')).toBe('a');
    });

    it.each([
        ['value attribute', '<lookup-input label="City" name="city" value="a"><option value="a">Ankara</option><option value="i">Istanbul</option></lookup-input>'],
        ['selected option', '<lookup-input label="City" name="city"><option value="a" selected>Ankara</option><option value="i">Istanbul</option></lookup-input>'],
    ])('LKP-505 restores the initial %s on form reset', async (_source, markup) => {
        const fixture = await initLookup(markup);

        fixture.host.value = 'i';
        await fixture.host.updateComplete;
        await fixture.user.click(fixture.reset);
        await new Promise(resolve => requestAnimationFrame(resolve));
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('a');
        expect(fixture.input.value).toBe('a');
    });
});

describe('Lookup - Accessibility and popover lifecycle', () => {
    it('LKP-601 associates the visible label with the value input and search combobox', async () => {
        const fixture = await initLookup('<lookup-input label="City"></lookup-input>');
        const label = fixture.host.querySelector('label');

        expect(label.htmlFor).toBe(fixture.input.id);
        expect(fixture.input.getAttribute('aria-labelledby')).toBe(label.id);
        expect(fixture.searchInput.getAttribute('aria-labelledby')).toBe(label.id);
    });

    it('LKP-602 provides an accessible name when the visible label is hidden', async () => {
        const fixture = await initLookup('<lookup-input label="City" hide-label></lookup-input>');

        expect(fixture.host.querySelector('label')).toBeNull();
        expect(fixture.input.getAttribute('aria-label')).toBe('City');
    });

    it('LKP-603 reflects required and disabled semantics on the value input', async () => {
        const fixture = await initLookup('<lookup-input label="City" required disabled></lookup-input>');

        expect(fixture.input.required).toBe(true);
        expect(fixture.input.getAttribute('aria-required')).toBe('true');
        expect(fixture.input.disabled).toBe(true);
    });

    it('LKP-604 exposes listbox controls, expanded state, and active descendant', async () => {
        const fixture = await initLookup('<lookup-input label="City"><option value="a">Ankara</option></lookup-input>');

        expect(fixture.searchInput.getAttribute('aria-controls')).toBe(fixture.listbox.id);
        expect(fixture.searchInput.getAttribute('aria-expanded')).toBe('false');

        await typeSearch(fixture, 'a');

        const option = getOptionElements(fixture)[0];
        expect(fixture.searchInput.getAttribute('aria-expanded')).toBe('true');
        expect(fixture.searchInput.getAttribute('aria-activedescendant')).toBe(option.id);
    });

    it('LKP-605 synchronizes the native popover with Escape dismissal', async () => {
        const fixture = await initLookup('<lookup-input label="City"><option value="a">Ankara</option></lookup-input>');

        await typeSearch(fixture, 'a');
        expect(fixture.listbox.matches(':popover-open')).toBe(true);

        await fixture.user.keyboard('{Escape}');
        await fixture.host.updateComplete;

        expect(fixture.host.open).toBe(false);
        expect(fixture.listbox.matches(':popover-open')).toBe(false);
    });

    it('LKP-606 closes on an outside pointer interaction', async () => {
        const fixture = await initLookup('<lookup-input label="City"><option value="a">Ankara</option></lookup-input>');
        const outside = document.createElement('button');
        document.body.append(outside);

        await typeSearch(fixture, 'a');
        await fixture.user.click(outside);
        await fixture.host.updateComplete;

        expect(fixture.host.open).toBe(false);
        outside.remove();
    });

    it('LKP-606 stays open when the search input is clicked', async () => {
        const fixture = await initLookup('<lookup-input label="City"><option value="a">Ankara</option></lookup-input>');

        await typeSearch(fixture, 'a');
        await fixture.user.click(fixture.searchInput);
        await fixture.host.updateComplete;

        expect(fixture.host.open).toBe(true);
    });

    it('LKP-607 cleans up popover close handling when disconnected while open', async () => {
        const fixture = await initLookup('<lookup-input label="City"><option value="a">Ankara</option></lookup-input>');
        const closeSpy = vi.fn();
        fixture.host.addEventListener('close', closeSpy);

        await typeSearch(fixture, 'a');
        fixture.host.remove();
        const closeCountAfterDisconnect = closeSpy.mock.calls.length;
        globalThis.dispatchEvent(new Event('scroll'));
        globalThis.dispatchEvent(new Event('resize'));
        await new Promise(resolve => requestAnimationFrame(resolve));

        expect(closeSpy).toHaveBeenCalledTimes(closeCountAfterDisconnect);
    });
});

/*
Lookup Case Plan

Keep this as a living specification for Lookup behavior before adding executable tests.
Lookup is a strict selection control: typed search text is a filter, not a value, and
the component value must correspond to a selected option.

## 1. Value and Selection Contract

* [x] LKP-101 — A lookup without an initial value starts empty with no selected option.
* [x] LKP-102 — The value attribute selects the matching slotted option on initialization.
* [x] LKP-103 — A slotted option with selected initializes the value and selectedOption.
* [x] LKP-104 — Assigning a value that matches an option selects that option and updates the input.
* [ ] LKP-105 — Assigning a value that does not match an option clears the value and selection.
* [x] LKP-106 — Typing search text changes the filter but does not set the selected value.
* [x] LKP-107 — Selecting an option updates value, selectedOption, and the value input.
* [x] LKP-108 — Clearing the lookup clears value, selectedOption, filter, and input.
* [x] LKP-109 — Programmatic value and options updates do not emit input/change events.
* [x] LKP-110 — User selection and clear actions emit input/change once per action.

## 2. Options Property and Updates

* [x] LKP-201 — String, number, object, and HTMLOptionElement entries are converted to options.
* [x] LKP-202 — A non-array options value throws a TypeError.
* [x] LKP-203 — Slotted options are ignored with a warning when options are supplied by property.
* [x] LKP-204 — Unsupported slotted children are rejected and reported.
* [x] LKP-205 — Replacing options preserves selection when the current value still exists.
* [x] LKP-206 — Replacing options clears value and selection when the current value is removed.
* [x] LKP-207 — Replacing options updates the rendered list while it is open.
* [x] LKP-208 — An option marked selected in the replacement options becomes the selection.

## 3. Filtering and List Behavior

* [x] LKP-301 — The list stays closed until the filter reaches filterThreshold.
* [x] LKP-302 — Search filters option labels case-insensitively by substring.
* [x] LKP-303 — Clearing the search filter hides the list and does not leave stale filter text.
* [x] LKP-304 — Opening the list exposes the filtered options and correct expanded state.
* [x] LKP-305 — Escape closes the list without changing the current selection.
* [x] LKP-306 — Blur restores the selected option's display text and runs validation.
* [x] LKP-307 — The no-options state is shown when the filter has no matches.
* [x] LKP-308 — Filtering uses the component's locale-specific casing rules.

## 4. Selection Interaction

* [x] LKP-401 — Clicking an option selects it and closes the list.
* [x] LKP-402 — Enter selects the active option and closes the list.
* [x] LKP-403 — Tab selects the active option and closes the list.
* [x] LKP-404 — Arrow keys move the active descendant through available options.
* [x] LKP-405 — Disabled options cannot be selected by click or keyboard.
* [x] LKP-406 — Hovering an option updates aria-activedescendant.

## 5. Form Integration and Validation

* [x] LKP-501 — A required lookup is invalid while it has no selected value.
* [x] LKP-502 — Selecting an option satisfies required validation and clears the error.
* [x] LKP-503 — Invalid input displays and associates the validation message.
* [x] LKP-504 — The selected value is included in FormData when name is set.
* [x] LKP-505 — Reset restores the value attribute or initially selected option.

## 6. Accessibility and Popover Lifecycle

* [x] LKP-601 — The visible label is associated with the value input and search combobox.
* [x] LKP-602 — hide-label provides an accessible name without rendering a visible label.
* [x] LKP-603 — Required and disabled states are reflected in input semantics.
* [x] LKP-604 — Combobox exposes listbox controls, expanded state, and active descendant.
* [x] LKP-605 — Native popover open/close state stays synchronized with the component.
* [x] LKP-606 — Outside interaction closes the list; inside interaction keeps it open.
* [x] LKP-607 — Disconnecting while open cleans up global listeners.

## Contract boundaries

* Typed text is only a filter; unlike Autocomplete, custom free text is not a valid selection.
* Value, selectedOption, and the selected list option must stay synchronized after options change.
* ComboBox tests provide useful shared coverage patterns for listbox interactions, validation,
  events, reset, and popover behavior; Lookup-specific assertions must account for its filter
  threshold and strict selection semantics.
*/
