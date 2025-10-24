import React from 'react';

import {renderWithTheme, screen, waitFor, fireEvent} from 'sentry-test/reactTestingLibrary';

import RecoveryOptionsModal from 'app/components/modals/recoveryOptionsModal';

describe('RecoveryOptionsModal', function () {
  const closeModal = jest.fn();
  const onClose = jest.fn();

  beforeEach(function () {
    MockApiClient.clearMockResponses();
    MockApiClient.addMockResponse({
      url: '/users/me/authenticators/',
      method: 'GET',
      body: TestStubs.AllAuthenticators(),
    });
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('can redirect to recovery codes if user skips backup phone setup', async function () {
    renderWithTheme(
      <RecoveryOptionsModal
        Body={p => p.children}
        Header={p => p.children}
        Footer={p => p.children}
        authenticatorName="Authenticator App"
        closeModal={closeModal}
        onClose={onClose}
      />
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Add a Phone Number')).toBeInTheDocument();
    });

    // Initially, Get Recovery Codes button should not exist
    expect(screen.queryByText('Get Recovery Codes')).not.toBeInTheDocument();

    // skip backup phone setup
    const skipButton = screen.getByText('Skip this step');
    fireEvent.click(skipButton);

    // Now Get Recovery Codes button should appear
    await waitFor(() => {
      expect(screen.getByText('Get Recovery Codes')).toBeInTheDocument();
    });

    const mockId = TestStubs.Authenticators().Recovery().authId;
    const getCodesButton = screen.getByText('Get Recovery Codes').closest('a');
    expect(getCodesButton).toHaveAttribute(
      'href',
      expect.stringMatching(`/settings/account/security/mfa/${mockId}/`)
    );

    fireEvent.click(getCodesButton);
    expect(closeModal).toHaveBeenCalled();
  });

  it('can redirect to backup phone setup', async function () {
    renderWithTheme(
      <RecoveryOptionsModal
        Body={p => p.children}
        Header={p => p.children}
        Footer={p => p.children}
        authenticatorName="Authenticator App"
        closeModal={closeModal}
        onClose={onClose}
      />
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Add a Phone Number')).toBeInTheDocument();
    });

    const addPhoneButton = screen.getByText('Add a Phone Number').closest('a');
    expect(addPhoneButton).toHaveAttribute(
      'href',
      expect.stringMatching('/settings/account/security/mfa/sms/enroll/')
    );

    fireEvent.click(addPhoneButton);
    expect(closeModal).toHaveBeenCalled();
  });

  it('skips backup phone setup if text message authenticator unavailable', async function () {
    MockApiClient.clearMockResponses();
    MockApiClient.addMockResponse({
      url: '/users/me/authenticators/',
      method: 'GET',
      body: [TestStubs.Authenticators().Totp(), TestStubs.Authenticators().Recovery()],
    });

    renderWithTheme(
      <RecoveryOptionsModal
        Body={p => p.children}
        Header={p => p.children}
        Footer={p => p.children}
        authenticatorName="Authenticator App"
        closeModal={closeModal}
        onClose={onClose}
      />
    );

    // Wait for component to load and verify Get Recovery Codes button is displayed
    await waitFor(() => {
      expect(screen.getByText('Get Recovery Codes')).toBeInTheDocument();
    });

    const mockId = TestStubs.Authenticators().Recovery().authId;
    const getCodesButton = screen.getByText('Get Recovery Codes').closest('a');
    expect(getCodesButton).toHaveAttribute(
      'href',
      expect.stringMatching(`/settings/account/security/mfa/${mockId}/`)
    );

    // Skip and Add Phone buttons should not exist
    expect(screen.queryByText('Skip this step')).not.toBeInTheDocument();
    expect(screen.queryByText('Add a Phone Number')).not.toBeInTheDocument();
  });
});
