import React from 'react';

import {
  renderGlobalModal,
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
  within,
} from 'sentry-test/reactTestingLibrary';

import {Client} from 'app/api';
import RepositoryRow from 'app/components/repositoryRow';

describe('RepositoryRow', function () {
  beforeEach(function () {
    Client.clearMockResponses();
  });

  const repository = TestStubs.Repository();
  const pendingRepo = TestStubs.Repository({
    status: 'pending_deletion',
  });
  const api = new Client();

  describe('rendering with access', function () {
    const organization = TestStubs.Organization({
      access: ['org:integrations'],
    });

    it('displays provider information', function () {
      renderWithTheme(
        <RepositoryRow repository={repository} api={api} orgId={organization.slug} />,
        {
          context: {organization},
        }
      );

      expect(screen.getByText(repository.name)).toBeInTheDocument();
      expect(screen.getByText('github.com/example/repo-name')).toBeInTheDocument();

      // Trash button should display enabled
      const deleteButton = screen.getByRole('button', {name: /delete/i});
      expect(deleteButton).toBeEnabled();

      // No cancel button
      expect(screen.queryByTestId('repo-cancel')).not.toBeInTheDocument();
    });

    it('displays cancel pending button', function () {
      renderWithTheme(
        <RepositoryRow repository={pendingRepo} api={api} orgId={organization.slug} />,
        {
          context: {organization},
        }
      );

      // Trash button should be disabled
      const deleteButton = screen.getByRole('button', {name: /delete/i});
      expect(deleteButton).toHaveAttribute('aria-disabled', 'true');

      // Cancel button active
      const cancelButton = screen.getByTestId('repo-cancel');
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).toBeEnabled();
    });
  });

  describe('rendering without access', function () {
    const organization = TestStubs.Organization({
      access: ['org:write'],
    });

    it('displays disabled trash', function () {
      renderWithTheme(
        <RepositoryRow repository={repository} api={api} orgId={organization.slug} />,
        {
          context: {organization},
        }
      );

      // Trash button should be disabled
      const deleteButton = screen.getByRole('button', {name: /delete/i});
      expect(deleteButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('displays disabled cancel', function () {
      renderWithTheme(
        <RepositoryRow repository={pendingRepo} api={api} orgId={organization.slug} />,
        {
          context: {organization},
        }
      );

      // Cancel should be disabled
      const cancelButton = screen.getByTestId('repo-cancel');
      expect(cancelButton).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('deletion', function () {
    const organization = TestStubs.Organization({
      access: ['org:integrations'],
    });

    it('sends api request on delete', async function () {
      const deleteRepo = Client.addMockResponse({
        url: `/organizations/${organization.slug}/repos/${repository.id}/`,
        method: 'DELETE',
        statusCode: 204,
        body: {},
      });

      renderWithTheme(
        <RepositoryRow repository={repository} api={api} orgId={organization.slug} />,
        {
          context: {organization},
        }
      );

      const deleteButton = screen.getByRole('button', {name: /delete/i});
      await userEvent.click(deleteButton);

      await renderGlobalModal();

      // Confirm modal
      const dialogs = screen.getAllByRole('dialog');
      const modal = dialogs.find(d => d.classList.contains('modal'));
      const confirmButton = within(modal).getByRole('button', {name: /confirm/i});
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(deleteRepo).toHaveBeenCalled();
      });
    });
  });

  describe('cancel deletion', function () {
    const organization = TestStubs.Organization({
      access: ['org:integrations'],
    });

    it('sends api request to cancel', async function () {
      const cancel = Client.addMockResponse({
        url: `/organizations/${organization.slug}/repos/${pendingRepo.id}/`,
        method: 'PUT',
        statusCode: 204,
        body: {},
      });

      renderWithTheme(
        <RepositoryRow repository={pendingRepo} api={api} orgId={organization.slug} />,
        {
          context: {organization},
        }
      );

      const cancelButton = screen.getByTestId('repo-cancel');
      await userEvent.click(cancelButton);

      await waitFor(() => {
        expect(cancel).toHaveBeenCalled();
      });
    });
  });
});
