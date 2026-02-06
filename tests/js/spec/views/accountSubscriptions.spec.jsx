import {render, screen} from 'sentry-test/reactTestingLibrary';
import userEvent from '@testing-library/user-event';

import {Client} from 'app/api';
import AccountSubscriptions from 'app/views/settings/account/accountSubscriptions';

const ENDPOINT = '/users/me/subscriptions/';

describe('AccountSubscriptions', function () {
  beforeEach(function () {
    Client.clearMockResponses();
  });

  it('renders empty', function () {
    Client.addMockResponse({
      url: ENDPOINT,
      body: [],
    });
    const {container} = render(<AccountSubscriptions />);

    expect(container).toMatchSnapshot();
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

    const {container} = render(<AccountSubscriptions />);

    expect(container).toMatchSnapshot();

    expect(mock).not.toHaveBeenCalled();

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
