import React from 'react';

import {
  render,
  renderGlobalModal,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import AccountSecurity from 'app/views/settings/account/accountSecurity';
import AccountSecurityWrapper from 'app/views/settings/account/accountSecurity/accountSecurityWrapper';

const ENDPOINT = '/users/me/authenticators/';
const ORG_ENDPOINT = '/organizations/';
const AUTH_ENDPOINT = '/auth/';

describe('AccountSecurity', function () {
  beforeEach(function () {
    jest.spyOn(window.location, 'assign').mockImplementation(() => {});

    MockApiClient.clearMockResponses();
    MockApiClient.addMockResponse({
      url: ORG_ENDPOINT,
      body: TestStubs.Organizations(),
    });
  });

  afterEach(function () {
    window.location.assign.mockRestore();
  });

  it('renders empty', function () {
    MockApiClient.addMockResponse({
      url: ENDPOINT,
      body: [],
    });

    render(
      <AccountSecurityWrapper>
        <AccountSecurity />
      </AccountSecurityWrapper>
    );

    expect(screen.getByText(/no available authenticators to add/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Two-factor authentication is required/i)
    ).not.toBeInTheDocument();
  });

  it('renders a primary interface that is enrolled', function () {
    MockApiClient.addMockResponse({
      url: ENDPOINT,
      body: [TestStubs.Authenticators().Totp({configureButton: 'Info'})],
    });

    render(
      <AccountSecurityWrapper>
        <AccountSecurity />
      </AccountSecurityWrapper>
    );

    expect(screen.getByText('Authenticator App')).toBeInTheDocument();

    // There should be an "Info" button
    expect(screen.getByRole('button', {name: /info/i})).toBeInTheDocument();

    // Remove button
    expect(screen.getByRole('button', {name: /delete/i})).toBeInTheDocument();

    // No TwoFactorRequired warning (user is enrolled)
    expect(
      screen.queryByText(/Two-factor authentication is required/i)
    ).not.toBeInTheDocument();
  });

  it('can delete enrolled authenticator', async function () {
    MockApiClient.addMockResponse({
      url: ENDPOINT,
      body: [
        TestStubs.Authenticators().Totp({
          authId: '15',
          configureButton: 'Info',
        }),
      ],
    });

    const deleteMock = MockApiClient.addMockResponse({
      url: `${ENDPOINT}15/`,
      method: 'DELETE',
    });

    expect(deleteMock).not.toHaveBeenCalled();

    render(
      <AccountSecurityWrapper>
        <AccountSecurity />
      </AccountSecurityWrapper>
    );

    // next authenticators request should have totp disabled
    const authenticatorsMock = MockApiClient.addMockResponse({
      url: ENDPOINT,
      body: [
        TestStubs.Authenticators().Totp({
          isEnrolled: false,
          authId: '15',
          configureButton: 'Info',
        }),
      ],
    });

    // This will open confirm modal
    await userEvent.click(screen.getByRole('button', {name: /delete/i}));

    // Confirm
    const modal = await renderGlobalModal();
    await userEvent.click(modal.getByRole('button', {name: /confirm/i}));

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalled();
    });

    // Should only have been called once
    expect(authenticatorsMock).toHaveBeenCalledTimes(1);

    // No enrolled authenticators - TwoFactorRequired should now appear
    await waitFor(() => {
      expect(
        screen.getByText(/Two-factor authentication is required/i)
      ).toBeInTheDocument();
    });
  });

  it('can remove one of multiple 2fa methods when org requires 2fa', async function () {
    MockApiClient.addMockResponse({
      url: ENDPOINT,
      body: [
        TestStubs.Authenticators().Totp({
          authId: '15',
          configureButton: 'Info',
        }),
        TestStubs.Authenticators().U2f(),
      ],
    });
    MockApiClient.addMockResponse({
      url: ORG_ENDPOINT,
      body: TestStubs.Organizations({require2FA: true}),
    });
    const deleteMock = MockApiClient.addMockResponse({
      url: `${ENDPOINT}15/`,
      method: 'DELETE',
    });

    expect(deleteMock).not.toHaveBeenCalled();

    render(
      <AccountSecurityWrapper>
        <AccountSecurity />
      </AccountSecurityWrapper>
    );

    // Get all delete buttons; we want the first one
    const deleteButtons = screen.getAllByRole('button', {name: /delete/i});

    // This will open confirm modal
    await userEvent.click(deleteButtons[0]);

    // Confirm
    const modal = await renderGlobalModal();
    await userEvent.click(modal.getByRole('button', {name: /confirm/i}));

    expect(deleteMock).toHaveBeenCalled();
  });

  it('can not remove last 2fa method when org requires 2fa', async function () {
    MockApiClient.addMockResponse({
      url: ENDPOINT,
      body: [
        TestStubs.Authenticators().Totp({
          authId: '15',
          configureButton: 'Info',
        }),
      ],
    });
    MockApiClient.addMockResponse({
      url: ORG_ENDPOINT,
      body: TestStubs.Organizations({require2FA: true}),
    });
    const deleteMock = MockApiClient.addMockResponse({
      url: `${ENDPOINT}15/`,
      method: 'DELETE',
    });

    expect(deleteMock).not.toHaveBeenCalled();

    render(
      <AccountSecurityWrapper>
        <AccountSecurity />
      </AccountSecurityWrapper>
    );

    // Delete button should be disabled
    const deleteButton = screen.getByRole('button', {name: /delete/i});
    expect(deleteButton).toBeDisabled();

    // Verify tooltip contains the org names
    const container = deleteButton.closest('[data-test-id]')?.parentElement;
    if (container) {
      expect(container.textContent).toContain('test 1 and test 2');
    }

    // Click should not open modal or trigger API call
    await userEvent.click(deleteButton);

    expect(deleteMock).not.toHaveBeenCalled();
  });

  it('renders a primary interface that is not enrolled', function () {
    MockApiClient.addMockResponse({
      url: ENDPOINT,
      body: [TestStubs.Authenticators().Totp({isEnrolled: false})],
    });

    render(
      <AccountSecurityWrapper>
        <AccountSecurity />
      </AccountSecurityWrapper>
    );

    expect(screen.getByText('Authenticator App')).toBeInTheDocument();
    // There should be an "Add" button
    expect(screen.getByRole('button', {name: /add/i})).toBeInTheDocument();

    // user is not 2fa enrolled
    expect(
      screen.getByText(/Two-factor authentication is required/i)
    ).toBeInTheDocument();
  });

  it('renders a backup interface that is not enrolled', function () {
    MockApiClient.addMockResponse({
      url: ENDPOINT,
      body: [TestStubs.Authenticators().Recovery({isEnrolled: false})],
    });

    render(
      <AccountSecurityWrapper>
        <AccountSecurity />
      </AccountSecurityWrapper>
    );

    expect(screen.getByText('Recovery Codes')).toBeInTheDocument();

    // There should be no details button
    expect(screen.queryByRole('button', {name: /view codes/i})).not.toBeInTheDocument();

    // user is not 2fa enrolled
    expect(
      screen.getByText(/Two-factor authentication is required/i)
    ).toBeInTheDocument();
  });

  it('renders a backup interface that is enrolled', function () {
    MockApiClient.addMockResponse({
      url: ENDPOINT,
      body: [TestStubs.Authenticators().Recovery({isEnrolled: true})],
    });

    render(
      <AccountSecurityWrapper>
        <AccountSecurity />
      </AccountSecurityWrapper>
    );

    expect(screen.getByText('Recovery Codes')).toBeInTheDocument();
    // There should be a "View Codes" button
    expect(screen.getByRole('button', {name: /view codes/i})).toBeInTheDocument();
  });

  it('can change password', async function () {
    MockApiClient.addMockResponse({
      url: ENDPOINT,
      body: [TestStubs.Authenticators().Recovery({isEnrolled: false})],
    });

    const url = '/users/me/password/';
    const mock = MockApiClient.addMockResponse({
      url,
      method: 'PUT',
    });

    render(
      <AccountSecurityWrapper>
        <AccountSecurity />
      </AccountSecurityWrapper>
    );

    await userEvent.type(screen.getByLabelText(/current password/i), 'oldpassword');
    await userEvent.type(screen.getByLabelText(/new password$/i), 'newpassword');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'newpassword');

    await userEvent.click(screen.getByRole('button', {name: /change password/i}));

    await waitFor(() => {
      expect(mock).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          method: 'PUT',
          data: {
            password: 'oldpassword',
            passwordNew: 'newpassword',
            passwordVerify: 'newpassword',
          },
        })
      );
    });

    // user is not 2fa enrolled
    expect(
      screen.getByText(/Two-factor authentication is required/i)
    ).toBeInTheDocument();
  });

  it('requires current password to be entered', async function () {
    MockApiClient.addMockResponse({
      url: ENDPOINT,
      body: [TestStubs.Authenticators().Recovery({isEnrolled: false})],
    });
    const url = '/users/me/password/';
    const mock = MockApiClient.addMockResponse({
      url,
      method: 'PUT',
    });

    render(
      <AccountSecurityWrapper>
        <AccountSecurity />
      </AccountSecurityWrapper>
    );

    await userEvent.type(screen.getByLabelText(/new password$/i), 'newpassword');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'newpassword');

    await userEvent.click(screen.getByRole('button', {name: /change password/i}));

    expect(mock).not.toHaveBeenCalled();
    // user is not 2fa enrolled
    expect(
      screen.getByText(/Two-factor authentication is required/i)
    ).toBeInTheDocument();
  });

  it('can expire all sessions', async function () {
    MockApiClient.addMockResponse({
      url: ENDPOINT,
      body: [TestStubs.Authenticators().Recovery({isEnrolled: false})],
    });
    const mock = MockApiClient.addMockResponse({
      url: AUTH_ENDPOINT,
      body: {all: true},
      method: 'DELETE',
      status: 204,
    });

    render(
      <AccountSecurityWrapper>
        <AccountSecurity />
      </AccountSecurityWrapper>
    );

    await userEvent.click(screen.getByRole('button', {name: /sign out of all devices/i}));

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith('/auth/login/');
    });
    expect(mock).toHaveBeenCalled();
  });
});
