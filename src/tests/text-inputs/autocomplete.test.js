import Autocomplete from '../../components/text-input/autocomplete.js';
import SuggestionOption from '../../components/parts/suggestion-option.js';

defineElement('auto-complete', Autocomplete);
defineElement('suggestion-option', SuggestionOption);

/**
 * Autocomplete Test Case List
 *
 * Keep this as a living specification for the component behavior before finalizing implementation.
 * The cases below are grouped by context and combine:
 *  - expected behavior of a standard autocomplete UX
 *  - the behavior currently implied by the draft implementation in autocomplete.js
 *  - the repo conventions established by the rich-text test suite
 *
 * Notes:
 *  - the input value and filter are text; suggestions use suggestionText
 *  - custom text is always allowed
 *  - matching behavior is treated as startsWith by default
 *  - Escape closes the list without triggering validation
 *  - option value/label and selectedOption are not part of this component contract
 */

describe('Autocomplete - Value contract', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('AUT-101 initializes with an empty value and a closed list', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');

        expect(fixture.host.value).toBe('');
        expect(fixture.input.value).toBe('');
        expect(fixture.host.open).toBe(false);
        expect(fixture.host.querySelector('[role="listbox"]').getAttribute('aria-expanded')).toBe('false');
    });

    it('AUT-102 updates the component value while the user types', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');

        fixture.host.options = [{ suggestionText: 'Ankara' }, { suggestionText: 'Istanbul' }];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'an');
        await fixture.host.updateComplete;

        expect(fixture.host.filter).toBe('an');
        expect(fixture.host.value).toBe('an');
    });

    it('AUT-103 reflects a programmatic value assignment into the input', async () => {
        const host = document.createElement('auto-complete');
        host.setAttribute('label', 'City');
        document.body.appendChild(host);
        await host.updateComplete;

        host.value = 'ank';
        await host.updateComplete;

        expect(host.value).toBe('ank');
        expect(host.inputElement.value).toBe('ank');
    });

    it('AUT-104 does not dispatch an input event for a programmatic value assignment', async () => {
        const host = document.createElement('auto-complete');
        host.setAttribute('label', 'City');
        const handler = vi.fn();
        host.addEventListener('input', handler);

        document.body.appendChild(host);
        await host.updateComplete;

        host.value = 'ist';
        await host.updateComplete;

        expect(handler).not.toHaveBeenCalled();
        expect(host.value).toBe('ist');
    });

    it('AUT-105 keeps the typed text when no suggestion matches the filter', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');

        fixture.host.options = [{ suggestionText: 'Ankara' }, { suggestionText: 'Istanbul' }];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'zz');
        await fixture.host.updateComplete;

        expect(fixture.host.filter).toBe('zz');
        expect(fixture.host.value).toBe('zz');
        expect(fixture.host.filteredOptions).toEqual([]);
    });

    it('AUT-106 clears the filter without leaving stale data behind', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');

        fixture.host.options = ['Ankara', 'Istanbul'];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'an');
        await fixture.host.updateComplete;

        await fixture.user.clear(fixture.input);
        await fixture.host.updateComplete;

        expect(fixture.host.filter).toBe('');
        expect(fixture.host.value).toBe('');
        expect(fixture.host.open).toBe(false);
    });

    it('AUT-107 preserves a value assigned before the component is connected', async () => {
        const host = document.createElement('auto-complete');
        host.setAttribute('label', 'City');
        host.value = 'Ankara';

        document.body.appendChild(host);
        await host.updateComplete;

        expect(host.value).toBe('Ankara');
        expect(host.inputElement.value).toBe('Ankara');
    });

    it('AUT-108 does not dispatch another update when the same value is assigned again', async () => {
        const host = document.createElement('auto-complete');
        host.setAttribute('label', 'City');
        document.body.appendChild(host);
        await host.updateComplete;

        const handler = vi.fn();
        host.addEventListener('update', handler);
        host.value = 'Ankara';
        await host.updateComplete;
        expect(handler).toHaveBeenCalledTimes(1);

        host.value = 'Ankara';
        await host.updateComplete;

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('AUT-109 initializes from the value attribute', async () => {
        const fixture = await initTestFixture('<auto-complete label="City" value="Ankara"></auto-complete>');

        expect(fixture.host.value).toBe('Ankara');
        expect(fixture.input.value).toBe('Ankara');
    });

    it('AUT-110 keeps an explicitly empty initial value as an empty string', async () => {
        const fixture = await initTestFixture('<auto-complete label="City" value=""></auto-complete>');

        expect(fixture.host.value).toBe('');
        expect(fixture.input.value).toBe('');
    });

    it('AUT-111 dispatches an update event for a programmatic value assignment', async () => {
        const host = document.createElement('auto-complete');
        host.setAttribute('label', 'City');
        const handler = vi.fn();
        host.addEventListener('update', handler);

        document.body.appendChild(host);
        await host.updateComplete;

        host.value = 'ist';
        await host.updateComplete;

        expect(handler).toHaveBeenCalled();
        expect(host.value).toBe('ist');
    });
});

describe('Autocomplete - List open / close / filtering', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('AUT-201 does not open the list on input focus alone', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');
        fixture.host.options = [{ suggestionText: 'Ankara' }, { suggestionText: 'Istanbul' }];
        await fixture.host.updateComplete;

        fixture.input.focus();
        await fixture.host.updateComplete;

        expect(fixture.host.open).toBe(false);
        expect(fixture.host.querySelector('[role="listbox"]').getAttribute('aria-expanded')).toBe('false');
    });

    it('AUT-202 opens the list and filters with startsWith when the user types', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');

        fixture.host.options = [{ suggestionText: 'Ankara' }, { suggestionText: 'Istanbul' }, { suggestionText: 'Adana' }];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'an');
        await fixture.host.updateComplete;

        expect(fixture.host.filter).toBe('an');
        expect(fixture.host.open).toBe(true);
        expect(fixture.host.querySelector('[role="listbox"]').getAttribute('aria-expanded')).toBe('true');
        expect(fixture.host.filteredOptions.map(option => option.suggestionText)).toEqual(['Ankara']);
    });

    it('AUT-203 keeps the list closed until filterThreshold is reached', async () => {
        const fixture = await initTestFixture('<auto-complete label="City" filter-threshold="2"></auto-complete>');

        fixture.host.options = [{ suggestionText: 'Ankara' }, { suggestionText: 'Istanbul' }];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'a');
        await fixture.host.updateComplete;

        expect(fixture.host.filter).toBe('a');
        expect(fixture.host.open).toBe(false);
        expect(fixture.host.querySelector('[role="listbox"]').getAttribute('aria-expanded')).toBe('false');

        await fixture.user.type(fixture.input, 'n');
        await fixture.host.updateComplete;

        expect(fixture.host.filter).toBe('an');
        expect(fixture.host.open).toBe(true);
        expect(fixture.host.filteredOptions.map(option => option.suggestionText)).toEqual(['Ankara']);
    });

    it('AUT-204 preserves the source order of filtered suggestions', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');
        fixture.host.options = ['Ankara', 'Adana', 'Aksaray'];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'a');
        await fixture.host.updateComplete;

        expect(fixture.host.filteredOptions.map(option => option.suggestionText)).toEqual(['Ankara', 'Adana', 'Aksaray']);
    });

    it('AUT-205 leaves the list closed when there are no suggestions', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');

        await fixture.user.type(fixture.input, 'zz');
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('zz');
        expect(fixture.host.open).toBe(false);
        expect(fixture.host.filteredOptions).toEqual([]);
        expect(fixture.host.querySelector('[role="listbox"] [role="option"]')).toBeNull();
    });

    it('AUT-206 ignores slotted suggestions when options are provided as a property', async () => {
        const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const host = document.createElement('auto-complete');
        host.setAttribute('label', 'City');
        host.append(document.createElement('suggestion-option'));
        host.lastElementChild.textContent = 'Adana';
        host.options = [{ suggestionText: 'Ankara' }];

        document.body.appendChild(host);
        await host.updateComplete;
        await new Promise(resolve => setTimeout(resolve, 0));
        host.filter = 'a';
        await host.updateComplete;

        expect(warningSpy).toHaveBeenCalled();
        expect(host.filteredOptions.map(option => option.suggestionText)).toEqual(['Ankara']);

        warningSpy.mockRestore();
    });

    it('AUT-207 accepts string and suggestionText object entries equivalently', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');
        fixture.host.options = ['Ankara', { suggestionText: 'Adana' }];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'a');
        await fixture.host.updateComplete;

        expect(fixture.host.filteredOptions.map(option => option.suggestionText)).toEqual(['Ankara', 'Adana']);
    });

    it('AUT-208 falls back to a SuggestionOption textContent when suggestionText is not set', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');
        const option = document.createElement('suggestion-option');
        option.textContent = 'Ankara';
        fixture.host.options = [option];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'an');
        await fixture.host.updateComplete;

        expect(fixture.host.filteredOptions.map(suggestion => suggestion.suggestionText)).toEqual(['Ankara']);
    });

    it('AUT-209 filters Unicode suggestion text case-insensitively', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');
        fixture.host.options = [{ suggestionText: 'İzmir' }, { suggestionText: 'Şanlıurfa' }];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'i');
        await fixture.host.updateComplete;

        expect(fixture.host.filteredOptions.map(option => option.suggestionText)).toEqual(['İzmir']);
    });
});

describe('Keyboard Interaction / Selection', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('AUT-301 selects the active suggestion with Enter and closes the list', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');

        fixture.host.options = [{ suggestionText: 'Ankara' }, { suggestionText: 'Istanbul' }];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'is');
        await fixture.host.updateComplete;
        await fixture.user.keyboard('{Enter}');
        await fixture.host.updateComplete;

        expect(fixture.host.open).toBe(false);
        expect(fixture.host.value).toBe('Istanbul');
        expect(fixture.input.value).toBe('Istanbul');
    });

    it('AUT-302 closes the list with Escape without clearing the typed value', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');
        let validationEventCount = 0;
        fixture.host.addEventListener('validate', () => validationEventCount++);

        fixture.host.options = [{ suggestionText: 'Ankara' }, { suggestionText: 'Istanbul' }];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'an');
        await fixture.host.updateComplete;
        expect(fixture.host.open).toBe(true);
        const validationEventCountBeforeEscape = validationEventCount;

        await fixture.user.keyboard('{Escape}');
        await fixture.host.updateComplete;

        expect(fixture.host.open).toBe(false);
        expect(fixture.host.filter).toBe('an');
        expect(fixture.input.value).toBe('an');
        expect(validationEventCount).toBe(validationEventCountBeforeEscape);
    });

    it('AUT-303 selects a suggestion on click and closes the list', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');
        fixture.host.options = [{ suggestionText: 'Ankara' }, { suggestionText: 'Istanbul' }];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'an');
        await fixture.host.updateComplete;
        const suggestion = fixture.host.querySelector('[role="option"]');
        await fixture.user.click(suggestion);
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('Ankara');
        expect(fixture.input.value).toBe('Ankara');
        expect(fixture.host.open).toBe(false);
    });

    it('AUT-304 moves the active suggestion down with ArrowDown', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');
        fixture.host.options = ['Ankara', 'Adana'];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'a');
        await fixture.host.updateComplete;
        const suggestions = fixture.host.querySelectorAll('[role="option"]');

        await fixture.user.keyboard('{ArrowDown}');
        await fixture.host.updateComplete;

        expect(fixture.host.activeIndex).toBe(1);
        expect(fixture.host.querySelector('[role="combobox"]').getAttribute('aria-activedescendant')).toBe(suggestions[1].id);
    });

    it('AUT-305 moves the active suggestion up with ArrowUp and wraps to the last suggestion', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');
        fixture.host.options = ['Ankara', 'Adana'];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'a');
        await fixture.host.updateComplete;
        const suggestions = fixture.host.querySelectorAll('[role="option"]');

        await fixture.user.keyboard('{ArrowUp}');
        await fixture.host.updateComplete;

        expect(fixture.host.activeIndex).toBe(1);
        expect(fixture.host.querySelector('[role="combobox"]').getAttribute('aria-activedescendant')).toBe(suggestions[1].id);
    });

    it('AUT-306 does not select disabled suggestions by click or keyboard', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');
        fixture.host.options = [{ suggestionText: 'Ankara' }, { suggestionText: 'Adana', disabled: true }, { suggestionText: 'Aksaray' }];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'a');
        await fixture.host.updateComplete;
        const suggestions = fixture.host.querySelectorAll('[role="option"]');
        await fixture.user.click(suggestions[1]);
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('a');
        expect(fixture.host.open).toBe(true);

        fixture.input.focus();
        await fixture.user.keyboard('{ArrowDown}');
        await fixture.host.updateComplete;

        expect(fixture.host.activeIndex).toBe(2);
        await fixture.user.keyboard('{Enter}');
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('Aksaray');
    });

    it('AUT-307 accepts the active suggestion with Tab and keeps focus until the next Tab', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');
        fixture.host.options = ['Ankara', 'Adana'];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'a');
        await fixture.host.updateComplete;
        await fixture.user.tab();
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('Ankara');
        expect(fixture.host.open).toBe(false);
        expect(document.activeElement).toBe(fixture.input);

        await fixture.user.tab();
        expect(document.activeElement).toBe(fixture.submit);
    });

    it('AUT-308 updates the filter and suggestions after Backspace', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');
        fixture.host.options = ['Ankara', 'Adana', 'Istanbul'];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'an');
        await fixture.host.updateComplete;
        expect(fixture.host.filteredOptions.map(option => option.suggestionText)).toEqual(['Ankara']);

        await fixture.user.keyboard('{Backspace}');
        await fixture.host.updateComplete;

        expect(fixture.host.filter).toBe('a');
        expect(fixture.host.value).toBe('a');
        expect(fixture.host.filteredOptions.map(option => option.suggestionText)).toEqual(['Ankara', 'Adana']);
        expect(fixture.host.open).toBe(true);
    });

    it('AUT-309 closes the list on blur and preserves free text', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');
        fixture.host.options = ['Ankara'];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'an');
        await fixture.host.updateComplete;
        expect(fixture.host.open).toBe(true);

        await fixture.user.click(fixture.form);
        await fixture.host.updateComplete;

        expect(fixture.host.open).toBe(false);
        expect(fixture.host.value).toBe('an');
        expect(fixture.input.value).toBe('an');
    });
});

describe('Autocomplete - Form Integration / Validation', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('AUT-401 includes the typed value in FormData when name is set', async () => {
        const fixture = await initTestFixture('<auto-complete label="City" name="city"></auto-complete>');
        await fixture.user.type(fixture.input, 'Custom city');

        expect(new FormData(fixture.form).get('city')).toBe('Custom city');
    });

    it('AUT-402 excludes the value from FormData when name is not set', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');
        await fixture.user.type(fixture.input, 'Ankara');

        expect(Array.from(new FormData(fixture.form).entries())).toEqual([]);
    });

    it('AUT-403 submits the initial value', async () => {
        const fixture = await initTestFixture('<auto-complete label="City" name="city" value="Ankara"></auto-complete>');

        expect(new FormData(fixture.form).get('city')).toBe('Ankara');
    });

    it('AUT-404 submits a value changed by the user', async () => {
        const fixture = await initTestFixture('<auto-complete label="City" name="city" value="Initial"></auto-complete>');
        await fixture.user.clear(fixture.input);
        await fixture.user.type(fixture.input, 'Custom city');

        expect(fixture.host.value).toBe('Custom city');
        expect(new FormData(fixture.form).get('city')).toBe('Custom city');
    });

    it('AUT-405 resets an empty-initialized autocomplete to an empty value', async () => {
        const fixture = await initTestFixture('<auto-complete label="City" name="city"></auto-complete>');
        await fixture.user.type(fixture.input, 'Ankara');
        await fixture.user.click(fixture.reset);
        await new Promise(resolve => requestAnimationFrame(resolve));
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('');
        expect(fixture.input.value).toBe('');
    });

    it('AUT-406 restores the value attribute after form reset', async () => {
        const fixture = await initTestFixture('<auto-complete label="City" name="city" value="Ankara"></auto-complete>');
        await fixture.user.clear(fixture.input);
        await fixture.user.type(fixture.input, 'Istanbul');
        await fixture.user.click(fixture.reset);
        await new Promise(resolve => requestAnimationFrame(resolve));
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('Ankara');
        expect(fixture.input.value).toBe('Ankara');
    });

    it('AUT-407 is invalid when required and empty', async () => {
        const fixture = await initTestFixture('<auto-complete label="City" required></auto-complete>');

        expect(fixture.input.validity.valueMissing).toBe(true);
        expect(fixture.host.checkValidity()).toBe(false);
    });

    it('AUT-408 accepts free text as valid input when required', async () => {
        const fixture = await initTestFixture('<auto-complete label="City" required></auto-complete>');
        await fixture.user.type(fixture.input, 'Custom city');
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('Custom city');
        expect(fixture.input.validity.valid).toBe(true);
        expect(fixture.host.checkValidity()).toBe(true);
    });

    it('AUT-409 updates validity after a programmatic value assignment', async () => {
        const fixture = await initTestFixture('<auto-complete label="City" required></auto-complete>');
        expect(fixture.host.checkValidity()).toBe(false);

        fixture.host.value = 'Custom city';
        await fixture.host.updateComplete;

        expect(fixture.input.value).toBe('Custom city');
        expect(fixture.host.checkValidity()).toBe(true);
    });

    it('AUT-410 disables editing and excludes the value from FormData', async () => {
        const fixture = await initTestFixture('<auto-complete label="City" name="city" value="Ankara" disabled></auto-complete>');
        await fixture.user.type(fixture.input, 'Istanbul');

        expect(fixture.input.disabled).toBe(true);
        expect(fixture.host.value).toBe('Ankara');
        expect(new FormData(fixture.form).has('city')).toBe(false);
    });

    it('AUT-411 prevents editing readonly input and includes its value in FormData', async () => {
        const fixture = await initTestFixture('<auto-complete label="City" name="city" value="Ankara" readonly></auto-complete>');
        await fixture.user.type(fixture.input, 'Istanbul');

        expect(fixture.input.readOnly).toBe(true);
        expect(fixture.host.value).toBe('Ankara');
        expect(new FormData(fixture.form).get('city')).toBe('Ankara');
    });
});

describe('Autocomplete - Accessibility / Semantics', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('AUT-501 associates the label with the input', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');
        const label = fixture.host.querySelector('label');

        expect(label.htmlFor).toBe(fixture.input.id);
        expect(fixture.input.getAttribute('aria-labelledby')).toBe(label.id);
    });

    it('AUT-502 exposes combobox state and controls its listbox', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');
        const combobox = fixture.host.querySelector('[role="combobox"]');
        const listbox = fixture.host.querySelector('[role="listbox"]');

        expect(combobox.getAttribute('aria-controls')).toBe(listbox.id);
        expect(combobox.getAttribute('aria-expanded')).toBe('false');
        expect(listbox.getAttribute('role')).toBe('listbox');

        fixture.host.options = ['Ankara'];
        await fixture.host.updateComplete;
        await fixture.user.type(fixture.input, 'a');
        await fixture.host.updateComplete;

        expect(combobox.getAttribute('aria-expanded')).toBe('true');
        expect(listbox.querySelector('[role="option"]')).not.toBeNull();
    });

    it('AUT-503 exposes the active suggestion through aria-activedescendant', async () => {
        const fixture = await initTestFixture('<auto-complete label="City"></auto-complete>');
        fixture.host.options = ['Ankara', 'Adana'];
        await fixture.host.updateComplete;

        await fixture.user.type(fixture.input, 'a');
        await fixture.host.updateComplete;

        const combobox = fixture.host.querySelector('[role="combobox"]');
        const activeOption = fixture.host.querySelector('[role="option"][data-active]');
        expect(combobox.getAttribute('aria-activedescendant')).toBe(activeOption.id);
    });

    it('AUT-504 reflects the disabled state on the input and combobox', async () => {
        const fixture = await initTestFixture('<auto-complete label="City" disabled></auto-complete>');
        const combobox = fixture.host.querySelector('[role="combobox"]');

        expect(fixture.input.disabled).toBe(true);
        expect(combobox.getAttribute('aria-disabled')).toBe('true');
    });

    it('AUT-505 associates the validation message with an invalid input', async () => {
        const fixture = await initTestFixture('<auto-complete label="City" required></auto-complete>');

        expect(fixture.host.checkValidity()).toBe(false);
        await fixture.host.updateComplete;

        const errorMessage = fixture.host.querySelector('[data-role="error-message"]');
        expect(fixture.input.getAttribute('aria-invalid')).toBe('true');
        expect(fixture.input.getAttribute('aria-errormessage')).toBe(errorMessage.id);
        expect(errorMessage.getAttribute('aria-live')).toBe('assertive');
        expect(errorMessage.textContent).not.toBe('');
    });
});

/*
# Autocomplete Case Planı

## 1. Component / Value Contract

* [x] AUT-101 — Component ilk oluşturulduğunda input boş ve liste kapalı başlar.
* [x] AUT-102 — Kullanıcı girişi component value ve filter'ını günceller.
* [x] AUT-103 — Programatik value input'a yansır.
* [x] AUT-104 — Programatik value ataması input event'i üretmez.
* [x] AUT-105 — Eşleşmeyen serbest metin korunur; öneri seçmek zorunlu değildir.
* [x] AUT-106 — Input temizlenince value ve filter boşalır.
* [x] AUT-107 — Component bağlanmadan önce atanan value korunur.
* [x] AUT-108 — Aynı value tekrar atanırsa gereksiz event/update oluşmaz.
* [x] AUT-109 — value attribute'u başlangıç değeri olarak yüklenir.
* [x] AUT-110 — Boş başlangıç değeri boş string olarak korunur.
* [x] AUT-111 — Programatik value ataması update event'i üretir.

## 2. List Open / Close / Filtering

* [x] AUT-201 — Input focus olduğunda liste kendiliğinden açılmaz.
* [x] AUT-202 — suggestionText startsWith eşleşmesiyle filtrelenir ve eşleşen öneriler gösterilir.
* [x] AUT-203 — filterThreshold altındayken liste kapalı kalır.
* [x] AUT-204 — Filtrelenmiş öneriler kaynak sırasını korur.
* [x] AUT-205 — Eşleşen öneri yoksa liste kapalı kalır ve boş seçenek satırı gösterilmez.
* [x] AUT-206 — options property ile slotted suggestion element'lerinin birlikte kullanımı doğru yönetilir.
* [x] AUT-207 — String öneri ile { suggestionText } girdisi aynı şekilde çalışır.
* [x] AUT-208 — suggestionText verilmemiş SuggestionOption, textContent'ini suggestionText olarak kullanır.
* [x] AUT-209 — Türkçe/Unicode metin startsWith filtrelemesinde korunur.

## 3. Keyboard Interaction / Selection

* [x] AUT-301 — Enter aktif önerinin suggestionText değerini input'a yazar ve listeyi kapatır.
* [x] AUT-302 — Escape listeyi kapatır ama yazıyı değiştirmez.
* [x] AUT-303 — Öneriye tıklamak suggestionText'i input'a yazar ve listeyi kapatır.
* [x] AUT-304 — ArrowDown açık listede sonraki etkin öneriye geçer.
* [x] AUT-305 — ArrowUp açık listede önceki etkin öneriye geçer.
* [x] AUT-306 — Disabled öneri tıklama veya klavye ile seçilemez.
* [x] AUT-307 — İlk Tab aktif öneriyi kabul edip input focus'unu korur; sonraki Tab ilerler.
* [x] AUT-308 — Backspace filtreyi ve öneri listesini yeniden hesaplar.
* [x] AUT-309 — Blur listeyi kapatır, serbest yazılan metni korur.

## 4. Form Integration / Validation

* [x] AUT-401 — name varsa form submit sırasında yazılan text FormData'ya eklenir.
* [x] AUT-402 — name yoksa component FormData'ya eklenmez.
* [x] AUT-403 — Başlangıç value'su form submit sırasında gönderilir.
* [x] AUT-404 — Kullanıcı tarafından değiştirilen value form submit sırasında gönderilir.
* [x] AUT-405 — Form reset boş başlangıç value'sunu geri yükler.
* [x] AUT-406 — Form reset, value attribute'u varsa başlangıç değerini geri yükler.
* [x] AUT-407 — required boş input'u invalid yapar.
* [x] AUT-408 — required alan serbest text girilince valid olur; öneri seçimi gerekmez.
* [x] AUT-409 — Programatik value değişimi validity durumunu günceller.
* [x] AUT-410 — disabled alan düzenlenemez ve FormData'ya eklenmez.
* [x] AUT-411 — readonly alan düzenlenemez ama FormData'ya eklenir.

## 5. Accessibility / Semantics

* [x] AUT-501 — Label input ile doğru ilişkilendirilir.
* [ ] AUT-502 — Combobox ve listbox ARIA semantiği doğru kurulur.
* [x] AUT-503 — Aktif öneri aria-activedescendant ile duyurulur.
* [x] AUT-504 — Disabled state input ve ARIA üzerinde doğru yansıtılır.
* [x] AUT-505 — Validation mesajı ve aria-invalid doğru ilişkilendirilir.

## 6. Edge Cases / Lifecycle

* [ ] AUT-601 — Boş öneri kaynağında kullanıcı text'i yazabilir ve liste açılmaz.
* [ ] AUT-602 — Suggestion içeriği HTML olarak verilirse güvenli biçimde gösterilir.
* [ ] AUT-603 — Yeniden render sonrası input focus ve value korunur.
* [ ] AUT-604 — Disconnect/reconnect sonrası component çalışmaya devam eder.
* [ ] AUT-605 — Birden fazla autocomplete instance birbirinden bağımsız çalışır.
* [ ] AUT-606 — Liste açıkken disconnect scroll lock ve dış pointer listener'larını temizler.

## Bu kontrata ait olmayanlar

* Option value/label ayrımı ve selected underlying value; strict value-label seçimi Lookup bileşeninin sorumluluğudur.
* selectedOption state'i veya öneri seçimini zorunlu kılma.
* allowCustomValue aç/kapa politikası; autocomplete'te custom text daima serbesttir.
* Eşleşme yokken “no options” satırı göstermek; güncel component listeyi kapatır.
*/
