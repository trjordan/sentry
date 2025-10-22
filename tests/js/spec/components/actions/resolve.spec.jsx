import React from 'react';

import {
  renderGlobalModal,
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';
import {selectByValue} from 'sentry-test/select-new';

import ResolveActions from 'app/components/actions/resolve';

describe('ResolveActions', function () {
  describe('disabled', function () {
    const spy = jest.fn();

    beforeEach(function () {
      renderWithTheme(
        <ResolveActions
          onUpdate={spy}
          disabled
          hasRelease={false}
          orgSlug="org-1"
          projectSlug="proj-1"
        />
      );
    });

    it('has disabled prop', function () {
      const button = screen.getByRole('button', {name: 'Resolve'});
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not call onUpdate when clicked', async function () {
      const button = screen.getByRole('button', {name: 'Resolve'});
      await userEvent.click(button);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('disableDropdown', function () {
    const spy = jest.fn();

    beforeEach(function () {
      renderWithTheme(
        <ResolveActions
          onUpdate={spy}
          disableDropdown
          hasRelease={false}
          orgSlug="org-1"
          projectSlug="proj-1"
        />
      );
    });

    it('main button is enabled', function () {
      const button = screen.getByRole('button', {name: 'Resolve'});
      expect(button).not.toHaveAttribute('disabled');
    });

    it('main button calls onUpdate when clicked', async function () {
      const button = screen.getByRole('button', {name: 'Resolve'});
      await userEvent.click(button);
      expect(spy).toHaveBeenCalled();
    });

    it('dropdown menu is disabled', function () {
      const button = screen.getByRole('button', {name: 'More resolve options'});
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('resolved', function () {
    const spy = jest.fn();

    beforeEach(function () {
      renderWithTheme(
        <ResolveActions
          onUpdate={spy}
          disabled
          hasRelease={false}
          orgSlug="org-1"
          projectSlug="proj-1"
          isResolved
        />
      );
    });

    it('displays resolved view', function () {
      const button = screen.getByRole('button', {name: 'Unresolve'});
      expect(button).toBeInTheDocument();
    });

    it('calls onUpdate with unresolved status when clicked', async function () {
      const button = screen.getByRole('button', {name: 'Unresolve'});
      await userEvent.click(button);
      expect(spy).toHaveBeenCalledWith({status: 'unresolved'});
    });
  });

  describe('auto resolved', function () {
    it('cannot be unresolved manually', async function () {
      const spy = jest.fn();
      renderWithTheme(
        <ResolveActions
          onUpdate={spy}
          disabled
          hasRelease={false}
          orgSlug="org-1"
          projectSlug="proj-1"
          isResolved
          isAutoResolved
        />
      );

      const button = screen.getByRole('button', {name: 'Unresolve'});
      await userEvent.click(button);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('without confirmation', function () {
    const spy = jest.fn();

    beforeEach(function () {
      renderWithTheme(
        <ResolveActions
          onUpdate={spy}
          hasRelease={false}
          orgSlug="org-1"
          projectSlug="proj-1"
        />
      );
    });

    it('renders', function () {
      expect(screen.getByRole('button', {name: 'Resolve'})).toBeInTheDocument();
    });

    it('calls spy with resolved status when clicked', async function () {
      const button = screen.getByRole('button', {name: 'Resolve'});
      await userEvent.click(button);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({status: 'resolved'});
    });
  });

  describe('with confirmation step', function () {
    const spy = jest.fn();

    beforeEach(function () {
      renderGlobalModal();
      renderWithTheme(
        <ResolveActions
          onUpdate={spy}
          hasRelease={false}
          orgSlug="org-1"
          projectSlug="proj-1"
          shouldConfirm
          confirmMessage="Are you sure???"
        />
      );
    });

    it('renders', function () {
      expect(screen.getByRole('button', {name: 'Resolve'})).toBeInTheDocument();
    });

    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('displays confirmation modal with message provided', async function () {
      const button = screen.getByRole('button', {name: 'Resolve'});
      await userEvent.click(button);

      const message = await screen.findByText('Are you sure???');
      expect(message).toBeInTheDocument();
      expect(spy).not.toHaveBeenCalled();

      const allButtons = screen.getAllByRole('button', {name: 'Resolve'});
      const confirmButton = allButtons.find(btn => btn.closest('[role="dialog"]'));
      await userEvent.click(confirmButton);

      await waitFor(() => expect(spy).toHaveBeenCalled());
    });
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('can resolve in "another version"', async function () {
    const onUpdate = jest.fn();
    MockApiClient.addMockResponse({
      url: '/projects/org-slug/project-slug/releases/',
      body: [TestStubs.Release()],
    });

    renderGlobalModal();
    const {container} = renderWithTheme(
      <ResolveActions
        hasRelease
        orgSlug="org-slug"
        projectSlug="project-slug"
        onUpdate={onUpdate}
      />
    );

    const dropdownButton = screen.getByRole('button', {name: 'More resolve options'});
    await userEvent.click(dropdownButton);

    const anotherVersionLink = await screen.findByText('Another version…');
    await userEvent.click(anotherVersionLink);

    // Wait for modal to appear
    const versionSelect = await screen.findByText('sentry-android-shop@1.2.0');
    expect(versionSelect).toBeInTheDocument();

    await selectByValue(container, 'sentry-android-shop@1.2.0', {
      selector: 'SelectAsyncControl[name="version"]',
    });

    const form = container.querySelector('form');
    await userEvent.click(form.querySelector('button[type="submit"]'));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith({
        status: 'resolved',
        statusDetails: {
          inRelease: 'sentry-android-shop@1.2.0',
        },
      });
    });
  });
});
