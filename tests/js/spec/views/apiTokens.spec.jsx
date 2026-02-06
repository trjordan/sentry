import React from 'react';

import {fireEvent, render, screen} from 'sentry-test/reactTestingLibrary';

import {Client} from 'app/api';
import {ApiTokens} from 'app/views/settings/account/apiTokens';

const organization = TestStubs.Organization();

describe('ApiTokens', function () {
  const routerContext = TestStubs.routerContext();

  beforeEach(function () {
    Client.clearMockResponses();
  });

  it('renders empty result', function () {
    Client.addMockResponse({
      url: '/api-tokens/',
      body: null,
    });

    const {container} = render(<ApiTokens organization={organization} />, {
      context: routerContext,
    });

    // Should be loading
    expect(container).toMatchSnapshot();
  });

  it('renders with result', function () {
    Client.addMockResponse({
      url: '/api-tokens/',
      body: [TestStubs.ApiToken()],
    });

    const {container} = render(<ApiTokens organization={organization} />, {
      context: routerContext,
    });

    // Should be loading
    expect(container).toMatchSnapshot();
  });

  it('can delete token', function () {
    Client.addMockResponse({
      url: '/api-tokens/',
      body: [TestStubs.ApiToken()],
    });

    const mock = Client.addMockResponse({
      url: '/api-tokens/',
      method: 'DELETE',
    });

    expect(mock).not.toHaveBeenCalled();

    render(<ApiTokens organization={organization} />, {
      context: routerContext,
    });

    fireEvent.click(screen.getByRole('button', {name: 'Remove'}));

    // Should be loading
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(
      '/api-tokens/',
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });
});
