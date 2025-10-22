import React from 'react';

import {renderWithTheme, screen, waitFor, act, fireEvent} from 'sentry-test/reactTestingLibrary';

import {Client} from 'app/api';
import ConfigStore from 'app/stores/configStore';
import App from 'app/views/app';

describe('Sudo Modal', function () {
  beforeEach(function () {
    Client.clearMockResponses();
    Client.addMockResponse({
      url: '/internal/health/',
      body: {
        problems: [],
      },
    });
    Client.addMockResponse({
      url: '/assistant/?v2',
      body: [],
    });
    Client.addMockResponse({
      url: '/organizations/',
      body: [TestStubs.Organization()],
    });
    Client.addMockResponse({
      url: '/organizations/org-slug/',
      method: 'DELETE',
      statusCode: 401,
      body: {
        detail: {
          code: 'sudo-required',
          username: 'test@test.com',
        },
      },
    });
    Client.addMockResponse({
      url: '/authenticators/',
      body: [],
    });
  });

  it('can delete an org with sudo flow', async function () {
    ConfigStore.set('user', {
      ...ConfigStore.get('user'),
      hasPasswordAuth: true,
    });
    renderWithTheme(<App>{<div>placeholder content</div>}</App>, {
      context: TestStubs.routerContext(),
    });

    const api = new Client();
    const successCb = jest.fn();
    const errorCb = jest.fn();

    // No Modal
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Should return w/ `sudoRequired`
    api.request('/organizations/org-slug/', {
      method: 'DELETE',
      success: successCb,
      error: errorCb,
    });

    // Wait for modal to appear with password input
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Should have Modal + input
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeInTheDocument();

    // Original callbacks should not have been called
    expect(successCb).not.toHaveBeenCalled();
    expect(errorCb).not.toHaveBeenCalled();

    // Clear mocks and allow DELETE
    Client.clearMockResponses();
    const orgDeleteMock = Client.addMockResponse({
      url: '/organizations/org-slug/',
      method: 'DELETE',
      statusCode: 200,
    });
    const sudoMock = Client.addMockResponse({
      url: '/auth/',
      method: 'PUT',
      statusCode: 200,
    });

    expect(sudoMock).not.toHaveBeenCalled();

    // "Sudo" auth
    await act(async () => {
      fireEvent.change(passwordInput, {target: {value: 'password'}});
    });

    const submitButton = screen.getByRole('button', {name: /confirm password/i});
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sudoMock).toHaveBeenCalledWith(
        '/auth/',
        expect.objectContaining({
          method: 'PUT',
          data: {
            password: 'password',
          },
        })
      );
    });

    // Retry API request
    await waitFor(() => {
      expect(successCb).toHaveBeenCalled();
    });
    expect(orgDeleteMock).toHaveBeenCalledWith(
      '/organizations/org-slug/',
      expect.objectContaining({
        method: 'DELETE',
      })
    );

    // Sudo Modal should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows button to redirect if user does not have password auth', async function () {
    ConfigStore.set('user', {
      ...ConfigStore.get('user'),
      hasPasswordAuth: false,
    });
    renderWithTheme(<App>{<div>placeholder content</div>}</App>, {
      context: TestStubs.routerContext(),
    });

    const api = new Client();
    const successCb = jest.fn();
    const errorCb = jest.fn();

    // No Modal
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Should return w/ `sudoRequired`
    api.request('/organizations/org-slug/', {
      method: 'DELETE',
      success: successCb,
      error: errorCb,
    });

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Should have no password input
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();

    // Should have redirect button
    const redirectButton = screen.getByRole('link');
    expect(redirectButton).toHaveAttribute('href', expect.stringMatching('/auth/login/?next=%2F'));
  });
});
