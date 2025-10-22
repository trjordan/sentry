import React from 'react';

import {
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import {Client} from 'app/api';
import AccountSubscriptions from 'app/views/settings/account/accountSubscriptions';

const ENDPOINT = '/users/me/subscriptions/';

describe('AccountSubscriptions', function () {
  beforeEach(function () {
    Client.clearMockResponses();
  });

  it('renders empty', async function () {
    Client.addMockResponse({
      url: ENDPOINT,
      body: [],
    });
    renderWithTheme(<AccountSubscriptions />, {
      context: TestStubs.routerContext().context,
    });

    await waitFor(() => {
      expect(
        screen.getByText(/There's no subscription backend present/i)
      ).toBeInTheDocument();
    });
  });

  it('renders list and can toggle', async function () {
    Client.addMockResponse({
      url: ENDPOINT,
      body: TestStubs.Subscriptions(),
    });
    const mock = Client.addMockResponse({
      url: ENDPOINT,
      method: 'PUT',
    });

    renderWithTheme(<AccountSubscriptions />, {
      context: TestStubs.routerContext().context,
    });

    // Wait for subscriptions to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });

    expect(mock).not.toHaveBeenCalled();

    // Find the first switch and click it
    const switches = screen.getAllByRole('checkbox');
    await userEvent.click(switches[0]);

    expect(mock).toHaveBeenCalledWith(
      ENDPOINT,
      expect.objectContaining({
        method: 'PUT',
        data: {
          listId: 2,
          subscribed: false,
        },
      })
    );
  });
});
