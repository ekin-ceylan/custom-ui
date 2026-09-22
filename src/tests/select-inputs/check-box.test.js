import CheckBox from '../../components/select/check-box.js';

defineElement('check-box', CheckBox);

/** @typedef {import('../../base/form-control-base.js').default} FormControlBase */
/** @typedef {import('../types').TestFixture<HTMLInputElement, FormControlBase>} CheckBoxFixture */

/**
 * Initializes a check-box and returns its test fixture.
 * @param {string} elementStr
 * @returns {Promise<CheckBoxFixture>}
 */
async function initCheckBox(elementStr) {
    return initTestFixture(elementStr);
}

describe('CheckBox - Accessibility', () => {
    it('associates the label with the checkbox input', async () => {
        const fixture = await initCheckBox('<check-box label="Accept terms">Terms</check-box>');

        expect(fixture.label).not.toBeNull();
        expect(fixture.label.getAttribute('for')).toBe(fixture.host.fieldId);
        expect(fixture.label.id).toBe(fixture.host.labelId);
        expect(fixture.input.id).toBe(fixture.host.fieldId);
        expect(fixture.input.getAttribute('aria-describedby')).toBe(`${fixture.host.componentName}-description-${fixture.host.uniqueId}`);
    });

    it('renders slotted text as the checkbox description', async () => {
        const fixture = await initCheckBox('<check-box label="Notifications">Receive email notifications</check-box>');

        expect(fixture.querySelector('span').textContent).toContain('Receive email notifications');
        expect(fixture.input.getAttribute('aria-describedby')).toBe(fixture.querySelector('span').id);
    });

    it('sets required and readonly ARIA semantics', async () => {
        const fixture = await initCheckBox('<check-box label="Required" required readonly></check-box>');

        expect(fixture.input.required).toBe(true);
        expect(fixture.input.getAttribute('aria-required')).toBe('true');
        expect(fixture.input.hasAttribute('aria-readonly')).toBe(true);
    });
});

describe('CheckBox - Initial state', () => {
    it('renders an unchecked checkbox by default', async () => {
        const fixture = await initCheckBox('<check-box label="Choice"></check-box>');

        expect(fixture.input.checked).toBe(false);
    });

    it('respects checked, checked-value, and unchecked-value attributes', async () => {
        const fixture = await initCheckBox('<check-box label="Choice" checked checked-value="yes" unchecked-value="no"></check-box>');

        expect(fixture.input.checked).toBe(true);
        expect(fixture.host.checkedValue).toBe('yes');
        expect(fixture.host.uncheckedValue).toBe('no');
    });
});

describe('CheckBox - Programmatic updates', () => {
    it('updates the native input when checked changes programmatically', async () => {
        const fixture = await initCheckBox('<check-box label="Choice"></check-box>');

        fixture.host.checked = true;
        await fixture.host.updateComplete;

        expect(fixture.input.checked).toBe(true);
        expect(fixture.host.value).toBe(fixture.host.checkedValue);

        fixture.host.checked = false;
        await fixture.host.updateComplete;

        expect(fixture.input.checked).toBe(false);
        expect(fixture.host.value).toBe(fixture.host.uncheckedValue);
    });

    it('preserves the checked state when checkedValue changes', async () => {
        const fixture = await initCheckBox('<check-box label="Choice" checked></check-box>');

        fixture.host.checkedValue = 'yes';
        await fixture.host.updateComplete;

        expect(fixture.input.checked).toBe(true);
        expect(fixture.host.value).toBe('yes');
    });

    it('preserves the unchecked state when uncheckedValue changes', async () => {
        const fixture = await initCheckBox('<check-box label="Choice"></check-box>');

        fixture.host.uncheckedValue = 'no';
        await fixture.host.updateComplete;

        expect(fixture.input.checked).toBe(false);
        expect(fixture.host.value).toBe('no');
    });

    it('normalizes an invalid value to uncheckedValue', async () => {
        const fixture = await initCheckBox('<check-box label="Choice" unchecked-value="no"></check-box>');

        fixture.host.value = 'unexpected';
        await fixture.host.updateComplete;

        expect(fixture.host.value).toBe('no');
        expect(fixture.input.checked).toBe(false);
    });

    it('rejects equal checked and unchecked values', async () => {
        const fixture = await initCheckBox('<check-box label="Choice"></check-box>');

        expect(() => {
            fixture.host.checkedValue = fixture.host.uncheckedValue;
        }).toThrow("'checkedValue' and 'uncheckedValue' must be different.");

        expect(() => {
            fixture.host.uncheckedValue = fixture.host.checkedValue;
        }).toThrow("'checkedValue' and 'uncheckedValue' must be different.");
    });
});

describe('CheckBox - Value handling', () => {
    it('sets the checked value when the checkbox is checked', async () => {
        const fixture = await initCheckBox('<check-box label="Choice" checked-value="selected" unchecked-value="empty"></check-box>');

        await fixture.user.click(fixture.input);
        await fixture.host.updateComplete;

        expect(fixture.input.checked).toBe(true);
        expect(fixture.host.value).toBe('selected');
    });

    it('sets the unchecked value when the checkbox is unchecked', async () => {
        const fixture = await initCheckBox('<check-box label="Choice" checked checked-value="selected" unchecked-value="empty"></check-box>');

        await fixture.user.click(fixture.input);
        await fixture.host.updateComplete;

        expect(fixture.input.checked).toBe(false);
        expect(fixture.host.value).toBe('empty');
    });
});

describe('CheckBox - Indeterminate state', () => {
    it('syncs the indeterminate attribute to the native input property', async () => {
        const fixture = await initCheckBox('<check-box label="Choice" indeterminate></check-box>');

        expect(fixture.host.indeterminate).toBe(true);
        expect(fixture.host.hasAttribute('indeterminate')).toBe(true);
        expect(fixture.input.indeterminate).toBe(true);
    });

    it('clears the checked state when rendered as indeterminate', async () => {
        const fixture = await initCheckBox('<check-box label="Choice" checked indeterminate></check-box>');

        expect(fixture.input.checked).toBe(false);
        expect(fixture.input.indeterminate).toBe(true);
        expect(fixture.host.value).toBe(fixture.host.uncheckedValue);
    });

    it('updates the native input when indeterminate changes', async () => {
        const fixture = await initCheckBox('<check-box label="Choice"></check-box>');

        fixture.host.indeterminate = true;
        await fixture.host.updateComplete;
        expect(fixture.input.indeterminate).toBe(true);

        fixture.host.indeterminate = false;
        await fixture.host.updateComplete;
        expect(fixture.input.indeterminate).toBe(false);
        expect(fixture.input.checked).toBe(false);
    });

    it('clears indeterminate state when unchecked is set programmatically', async () => {
        const fixture = await initCheckBox('<check-box label="Choice" indeterminate></check-box>');

        fixture.host.checked = false;
        await fixture.host.updateComplete;

        expect(fixture.host.indeterminate).toBe(false);
        expect(fixture.input.indeterminate).toBe(false);
        expect(fixture.input.checked).toBe(false);
    });

    it('clears indeterminate state when checked is set to true programmatically', async () => {
        const fixture = await initCheckBox('<check-box label="Choice" indeterminate></check-box>');

        fixture.host.checked = true;
        await fixture.host.updateComplete;

        expect(fixture.host.indeterminate).toBe(false);
        expect(fixture.input.indeterminate).toBe(false);
        expect(fixture.input.checked).toBe(true);
        expect(fixture.host.value).toBe(fixture.host.checkedValue);
    });

    it('preserves indeterminate state when checkedValue changes', async () => {
        const fixture = await initCheckBox('<check-box label="Choice" indeterminate></check-box>');

        fixture.host.checkedValue = 'yes';
        await fixture.host.updateComplete;

        expect(fixture.host.indeterminate).toBe(true);
        expect(fixture.input.indeterminate).toBe(true);
        expect(fixture.host.value).toBe(fixture.host.uncheckedValue);
    });

    it('preserves indeterminate state when uncheckedValue changes', async () => {
        const fixture = await initCheckBox('<check-box label="Choice" indeterminate></check-box>');

        fixture.host.uncheckedValue = 'no';
        await fixture.host.updateComplete;

        expect(fixture.host.indeterminate).toBe(true);
        expect(fixture.input.indeterminate).toBe(true);
        expect(fixture.host.value).toBe('no');
    });

    it('clears indeterminate state when the native checkbox is clicked', async () => {
        const fixture = await initCheckBox('<check-box label="Choice" indeterminate></check-box>');

        await fixture.user.click(fixture.input);
        await fixture.host.updateComplete;

        expect(fixture.input.indeterminate).toBe(false);
        expect(fixture.input.checked).toBe(true);
        expect(fixture.host.value).toBe(fixture.host.checkedValue);
    });
});

describe('CheckBox - Required validation', () => {
    it('shows the required error when an unchecked checkbox is invalid', async () => {
        const fixture = await initCheckBox('<check-box label="Consent" required></check-box>');

        fixture.input.dispatchEvent(new Event('invalid', { bubbles: true, cancelable: true }));
        await fixture.host.updateComplete;

        expect(fixture.input.validity.valueMissing).toBe(true);
        expect(fixture.input.getAttribute('aria-invalid')).toBe('true');
        expect(fixture.input.getAttribute('aria-errormessage')).toBe(fixture.error.id);
        expect(fixture.error.textContent).toContain('zorunludur.');
    });

    it('clears the required error after the checkbox is checked', async () => {
        const fixture = await initCheckBox('<check-box label="Consent" required></check-box>');

        fixture.input.dispatchEvent(new Event('invalid', { bubbles: true, cancelable: true }));
        await fixture.host.updateComplete;
        expect(fixture.error).not.toBeNull();

        await fixture.user.click(fixture.input);
        await fixture.host.updateComplete;

        expect(fixture.input.checked).toBe(true);
        expect(fixture.input.getAttribute('aria-invalid')).toBeNull();
        expect(fixture.error).toBeNull();
    });
});

describe('CheckBox - Interaction states', () => {
    it('does not change state when readonly', async () => {
        const fixture = await initCheckBox('<check-box label="Choice" readonly></check-box>');

        await fixture.user.click(fixture.input);
        await fixture.host.updateComplete;

        expect(fixture.input.checked).toBe(false);
        expect(fixture.host.value).toBeNull();
    });

    it('does not change state when disabled', async () => {
        const fixture = await initCheckBox('<check-box label="Choice" disabled></check-box>');

        await fixture.user.click(fixture.input);
        await fixture.host.updateComplete;

        expect(fixture.input.disabled).toBe(true);
        expect(fixture.input.checked).toBe(false);
        expect(fixture.host.value).toBeNull();
    });
});
