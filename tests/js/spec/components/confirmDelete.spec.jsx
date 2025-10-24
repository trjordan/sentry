import React from 'react';

import {
  renderGlobalModal,
  renderWithTheme,
  screen,
  userEvent,
} from 'sentry-test/reactTestingLibrary';

import ConfirmDelete from 'app/components/confirmDelete';
import ModalStore from 'app/stores/modalStore';

describe('ConfirmDelete', function () {
  afterEach(() => {
    ModalStore.reset();
  });

  it('renders', async function () {
    const mock = jest.fn();
    renderWithTheme(
      <ConfirmDelete message="Are you sure?" onConfirm={mock} confirmInput="CoolOrg">
        <button>Confirm?</button>
      </ConfirmDelete>
    );

    await userEvent.click(screen.getByRole('button'));

    await renderGlobalModal();

    // jest had an issue rendering root component snapshot so using ModalDialog instead
    const dialogs = screen.getAllByRole('dialog');
    const dialog = dialogs.find(d => d.classList.contains('modal'));
    expect(dialog).toSnapshot();
  });

  it('confirm button is disabled and bypass prop is false when modal opens', async function () {
    const mock = jest.fn();
    renderWithTheme(
      <ConfirmDelete message="Are you sure?" onConfirm={mock} confirmInput="CoolOrg">
        <button>Confirm?</button>
      </ConfirmDelete>
    );

    await userEvent.click(screen.getByRole('button'));

    await renderGlobalModal();

    // Check bypass prop - ConfirmDelete always sets bypass={false}
    // In the original enzyme test, this was: expect(wrapper.find('Confirm').prop('bypass')).toBe(false);
    // Since ConfirmDelete hardcodes bypass={false}, we verify this by ensuring the component doesn't bypass
    // (i.e., modal actually opens and doesn't immediately call onConfirm)
    expect(mock).not.toHaveBeenCalled(); // If bypass was true, onConfirm would be called immediately

    // Check that confirm button is disabled
    // The button uses aria-disabled instead of the disabled attribute
    expect(screen.getByRole('button', {name: 'Confirm'})).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('confirm button stays disabled with non-matching input', async function () {
    const mock = jest.fn();
    renderWithTheme(
      <ConfirmDelete message="Are you sure?" onConfirm={mock} confirmInput="CoolOrg">
        <button>Confirm?</button>
      </ConfirmDelete>
    );

    await userEvent.click(screen.getByRole('button'));

    await renderGlobalModal();

    await userEvent.type(screen.getByPlaceholderText('CoolOrg'), 'Cool');
    expect(screen.getByRole('button', {name: 'Confirm'})).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('confirm button is enabled when confirm input matches', async function () {
    const mock = jest.fn();
    renderWithTheme(
      <ConfirmDelete message="Are you sure?" onConfirm={mock} confirmInput="CoolOrg">
        <button>Confirm?</button>
      </ConfirmDelete>
    );

    await userEvent.click(screen.getByRole('button'));

    await renderGlobalModal();

    await userEvent.type(screen.getByPlaceholderText('CoolOrg'), 'CoolOrg');
    expect(screen.getByRole('button', {name: 'Confirm'})).toHaveAttribute(
      'aria-disabled',
      'false'
    );

    await userEvent.click(screen.getByRole('button', {name: 'Confirm'}));

    expect(mock).toHaveBeenCalled();
    expect(mock.mock.calls).toHaveLength(1);
  });
});
