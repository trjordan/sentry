import React from 'react';
import {createEvent} from '@testing-library/react';

import {
  fireEvent,
  renderGlobalModal,
  renderWithTheme,
  screen,
  userEvent,
} from 'sentry-test/reactTestingLibrary';

import Confirm from 'app/components/confirm';

describe('Confirm', function () {
  it('renders', async function () {
    const mock = jest.fn();
    renderWithTheme(
      <Confirm message="Are you sure?" onConfirm={mock}>
        <button>Confirm?</button>
      </Confirm>
    );

    await userEvent.click(screen.getByRole('button', {name: 'Confirm?'}));

    await renderGlobalModal();

    const dialogs = screen.getAllByRole('dialog');
    const dialog = dialogs.find(d => d.classList.contains('modal'));
    expect(dialog).toBeInTheDocument();
  });

  it('clicking action button opens Modal', async function () {
    const mock = jest.fn();
    renderWithTheme(
      <Confirm message="Are you sure?" onConfirm={mock}>
        <button>Confirm?</button>
      </Confirm>
    );

    await userEvent.click(screen.getByRole('button', {name: 'Confirm?'}));

    await renderGlobalModal();

    const dialogs = screen.getAllByRole('dialog');
    const dialog = dialogs.find(d => d.classList.contains('modal'));
    expect(dialog).toBeInTheDocument();
  });

  it('clicks Confirm in modal and calls `onConfirm` callback', async function () {
    const mock = jest.fn();
    renderWithTheme(
      <Confirm message="Are you sure?" onConfirm={mock}>
        <button>Confirm?</button>
      </Confirm>
    );

    expect(mock).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', {name: 'Confirm?'}));

    await renderGlobalModal();

    // Click "Confirm" button in the modal (there may be multiple buttons with same text)
    const allConfirmButtons = screen.getAllByRole('button', {name: 'Confirm'});
    const modalConfirmButton = allConfirmButtons.find(btn =>
      btn.closest('[role="dialog"]')
    );

    await userEvent.click(modalConfirmButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mock).toHaveBeenCalled();
    expect(mock.mock.calls).toHaveLength(1);
  });

  it('can stop propagation on the event', function () {
    const mock = jest.fn();

    renderWithTheme(
      <Confirm message="Are you sure?" onConfirm={mock} stopPropagation>
        <button>Confirm?</button>
      </Confirm>
    );

    expect(mock).not.toHaveBeenCalled();

    const button = screen.getByRole('button', {name: 'Confirm?'});
    const clickEvent = createEvent.click(button);
    clickEvent.stopPropagation = jest.fn();

    fireEvent(button, clickEvent);
    expect(clickEvent.stopPropagation).toHaveBeenCalled();
  });
});
