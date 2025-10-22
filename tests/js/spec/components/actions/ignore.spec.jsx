import React from 'react';

import {
  renderGlobalModal,
  renderWithTheme,
  screen,
  userEvent,
} from 'sentry-test/reactTestingLibrary';

import IgnoreActions from 'app/components/actions/ignore';

describe('IgnoreActions', function () {
  describe('disabled', function () {
    const spy = jest.fn();

    beforeEach(function () {
      renderWithTheme(<IgnoreActions onUpdate={spy} disabled />);
    });

    it('has disabled prop', function () {
      const button = screen.getByRole('button', {name: 'Ignore'});
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not call onUpdate when clicked', async function () {
      const button = screen.getByRole('button', {name: 'Ignore'});
      await userEvent.click(button);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('ignored', function () {
    const spy = jest.fn();

    beforeEach(function () {
      renderWithTheme(<IgnoreActions onUpdate={spy} isIgnored />);
    });

    it('displays ignored view', function () {
      const button = screen.getByRole('button', {name: 'Unignore'});
      expect(button).toBeInTheDocument();
      // Shows icon only
      expect(button).toHaveTextContent('');
    });

    it('calls onUpdate with unresolved status when clicked', async function () {
      const button = screen.getByRole('button', {name: 'Unignore'});
      await userEvent.click(button);
      expect(spy).toHaveBeenCalledWith({status: 'unresolved'});
    });
  });

  describe('without confirmation', function () {
    const spy = jest.fn();

    beforeEach(function () {
      renderWithTheme(<IgnoreActions onUpdate={spy} hasInbox={false} />);
    });

    it('calls spy with ignore details when clicked', async function () {
      const button = screen.getByRole('button', {name: 'Ignore'});
      await userEvent.click(button);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({status: 'ignored'});
    });
  });

  describe('with confirmation step', function () {
    const spy = jest.fn();

    beforeEach(function () {
      renderGlobalModal();
      renderWithTheme(
        <IgnoreActions
          onUpdate={spy}
          shouldConfirm
          confirmMessage="confirm me"
          hasInbox={false}
        />
      );
    });

    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('displays confirmation modal with message provided', async function () {
      const button = screen.getByRole('button', {name: 'Ignore'});
      await userEvent.click(button);

      const message = await screen.findByText('confirm me');
      expect(message).toBeInTheDocument();
      expect(spy).not.toHaveBeenCalled();

      const allButtons = screen.getAllByRole('button', {name: 'Ignore'});
      const confirmButton = allButtons.find(btn => btn.closest('[role="dialog"]'));
      await userEvent.click(confirmButton);

      expect(spy).toHaveBeenCalled();
    });
  });
});
