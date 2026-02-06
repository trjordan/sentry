import React from 'react';

import {render, screen, waitFor} from 'sentry-test/reactTestingLibrary';

import AccountDetails from 'app/views/settings/account/accountDetails';

jest.mock('scroll-to-element', () => 'scroll-to-element');

const mockUserDetails = params => {
  MockApiClient.clearMockResponses();

  MockApiClient.addMockResponse({
    url: '/users/me/',
    method: 'GET',
    body: TestStubs.UserDetails(params),
  });
};

describe('AccountDetails', function () {
  beforeEach(function () {
    mockUserDetails();
  });

  it('renders', async function () {
    render(<AccountDetails location={{}} />, {context: TestStubs.routerContext()});

    // Wait for data to load and check for name input
    await waitFor(() => {
      expect(screen.getByRole('textbox', {name: /name/i})).toBeInTheDocument();
    });

    // Stacktrace order, language, timezone, theme - SelectControl renders as combobox
    expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(1);
  });

  it('has username field if it is different than email', async function () {
    mockUserDetails({username: 'different@example.com'});
    render(<AccountDetails location={{}} />, {context: TestStubs.routerContext()});

    await waitFor(() => {
      expect(screen.getByRole('textbox', {name: /username/i})).toBeInTheDocument();
    });

    const usernameInput = screen.getByRole('textbox', {name: /username/i});
    expect(usernameInput).not.toBeDisabled();
  });

  describe('Managed User', function () {
    it('does not have password fields', async function () {
      mockUserDetails({isManaged: true});
      render(<AccountDetails location={{}} />, {context: TestStubs.routerContext()});

      await waitFor(() => {
        expect(screen.getByRole('textbox', {name: /name/i})).toBeInTheDocument();
      });

      expect(screen.queryByLabelText(/^password$/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/verify password/i)).not.toBeInTheDocument();
    });

    it('has disabled username field if it is different than email', async function () {
      mockUserDetails({isManaged: true, username: 'different@example.com'});
      render(<AccountDetails location={{}} />, {context: TestStubs.routerContext()});

      await waitFor(() => {
        expect(screen.getByRole('textbox', {name: /username/i})).toBeInTheDocument();
      });

      const usernameInput = screen.getByRole('textbox', {name: /username/i});
      expect(usernameInput).toBeDisabled();
    });
  });
});
