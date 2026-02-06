import {render} from 'sentry-test/reactTestingLibrary';

import {Client} from 'app/api';
import AccountAuthorizations from 'app/views/settings/account/accountAuthorizations';

describe('AccountAuthorizations', function () {
  beforeEach(function () {
    Client.clearMockResponses();
  });

  it('renders empty', function () {
    Client.addMockResponse({
      url: '/api-authorizations/',
      method: 'GET',
      body: [],
    });

    const {container} = render(<AccountAuthorizations />);

    expect(container).toMatchSnapshot();
  });
});
