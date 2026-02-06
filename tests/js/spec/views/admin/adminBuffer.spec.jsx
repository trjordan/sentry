import React from 'react';

import {render} from 'sentry-test/reactTestingLibrary';

import AdminBuffer from 'app/views/admin/adminBuffer';

// TODO(dcramer): this doesnt really test anything as we need to
// mock the API Response/wait on it
describe('AdminBuffer', function () {
  describe('render()', function () {
    it('renders', function () {
      const {container} = render(<AdminBuffer params={{}} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
