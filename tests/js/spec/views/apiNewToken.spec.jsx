import React from 'react';

import {render} from 'sentry-test/reactTestingLibrary';

import ApiNewToken from 'app/views/settings/account/apiNewToken';

describe('ApiNewToken', function () {
  describe('render()', function () {
    it('renders', function () {
      const {container} = render(<ApiNewToken params={{}} />, {
        context: TestStubs.routerContext(),
      });
      expect(container).toMatchSnapshot();
    });
  });
});
