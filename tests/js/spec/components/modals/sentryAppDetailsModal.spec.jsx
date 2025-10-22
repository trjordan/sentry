import React from 'react';

import {
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import SentryAppDetailsModal from 'app/components/modals/sentryAppDetailsModal';

describe('SentryAppDetailsModal', function () {
  let org;
  let sentryApp;
  let onInstall;
  let isInstalled;
  let closeModal;
  let sentryAppInteractionRequest;

  function render() {
    return renderWithTheme(
      <SentryAppDetailsModal
        sentryApp={sentryApp}
        organization={org}
        onInstall={onInstall}
        isInstalled={isInstalled}
        closeModal={closeModal}
      />
    );
  }

  beforeEach(() => {
    org = TestStubs.Organization();
    sentryApp = TestStubs.SentryApp();
    onInstall = jest.fn();
    isInstalled = false;
    closeModal = jest.fn();

    MockApiClient.addMockResponse({
      url: `/sentry-apps/${sentryApp.slug}/features/`,
      method: 'GET',
      body: [],
    });

    sentryAppInteractionRequest = MockApiClient.addMockResponse({
      url: `/sentry-apps/${sentryApp.slug}/interaction/`,
      method: 'POST',
      statusCode: 200,
      body: {},
    });
  });

  it('renders', async () => {
    render();
    await waitFor(() => {
      expect(screen.getByText(sentryApp.name)).toBeInTheDocument();
    });
  });

  it('records interaction request', () => {
    render();
    expect(sentryAppInteractionRequest).toHaveBeenCalledWith(
      `/sentry-apps/${sentryApp.slug}/interaction/`,
      expect.objectContaining({
        method: 'POST',
        data: {
          tsdbField: 'sentry_app_viewed',
        },
      })
    );
  });

  it('displays the Integrations description', async () => {
    render();
    await waitFor(() => {
      expect(screen.getByText(sentryApp.overview)).toBeInTheDocument();
    });
  });

  it('closes when Cancel is clicked', async () => {
    render();
    await userEvent.click(screen.getByRole('button', {name: 'Cancel'}));
    expect(closeModal).toHaveBeenCalled();
  });

  it('installs the Integration when Install is clicked', async () => {
    render();
    await userEvent.click(screen.getByRole('button', {name: 'Accept & Install'}));
    expect(onInstall).toHaveBeenCalled();
  });

  describe('when the User does not have permission to install Integrations', () => {
    beforeEach(() => {
      org = {...org, access: []};
    });

    it('does not display the Install button', () => {
      render();
      expect(
        screen.queryByRole('button', {name: 'Accept & Install'})
      ).not.toBeInTheDocument();
    });
  });

  describe('when the Integration is installed', () => {
    beforeEach(() => {
      isInstalled = true;
    });

    it('disabled the Install button', () => {
      render();
      expect(screen.getByRole('button', {name: 'Accept & Install'})).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });
  });

  describe('when the Integration requires no permissions', () => {
    beforeEach(() => {
      sentryApp = {...sentryApp, scopes: []};
    });

    it('does not render permissions', async () => {
      render();
      await waitFor(() => {
        expect(screen.queryByText('Permissions')).not.toBeInTheDocument();
      });
    });
  });
});
