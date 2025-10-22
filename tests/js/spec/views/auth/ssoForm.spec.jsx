import React from 'react';
import {browserHistory} from 'react-router';

import {
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import SsoForm from 'app/views/auth/ssoForm';

async function doSso(apiRequest) {
  const orgInput = screen.getByRole('textbox', {name: /organization id/i});
  await userEvent.type(orgInput, 'org123');

  const continueButton = screen.getByRole('button', {name: /continue/i});
  await userEvent.click(continueButton);

  expect(apiRequest).toHaveBeenCalledWith(
    '/auth/sso-locate/',
    expect.objectContaining({data: {organization: 'org123'}})
  );
}

describe('SsoForm', function () {
  const routerContext = TestStubs.routerContext();
  const api = new MockApiClient();

  it('renders', function () {
    const authConfig = {
      serverHostname: 'testserver',
    };

    renderWithTheme(<SsoForm api={api} authConfig={authConfig} />, {
      context: routerContext.context,
    });

    expect(
      screen.getByText((content, element) => {
        return (
          element?.className === 'help-block' &&
          element?.textContent ===
            'Your ID is the slug after the hostname. e.g. testserver/acme is acme.'
        );
      })
    ).toBeInTheDocument();
  });

  it('handles errors', async function () {
    const mockRequest = MockApiClient.addMockResponse({
      url: '/auth/sso-locate/',
      method: 'POST',
      statusCode: 400,
      body: {
        detail: 'Invalid org name',
      },
    });

    const authConfig = {};

    const {container} = renderWithTheme(<SsoForm api={api} authConfig={authConfig} />, {
      context: routerContext.context,
    });

    await doSso(mockRequest);

    await waitFor(() => {
      expect(container.querySelector('.alert')).toBeInTheDocument();
    });
  });

  it('handles success', async function () {
    const mockRequest = MockApiClient.addMockResponse({
      url: '/auth/sso-locate/',
      method: 'POST',
      statusCode: 200,
      body: {
        nextUri: '/next/',
      },
    });

    const authConfig = {};

    renderWithTheme(<SsoForm api={api} authConfig={authConfig} />, {
      context: routerContext.context,
    });

    await doSso(mockRequest);

    expect(browserHistory.push).toHaveBeenCalledWith({pathname: '/next/'});
  });
});
