import React from 'react';

import {render} from 'sentry-test/reactTestingLibrary';

import {Form} from 'app/components/forms';

describe('Form', function () {
  describe('render()', function () {
    it('renders with children', function () {
      const {container} = render(
        <Form onSubmit={() => {}}>
          <hr />
        </Form>
      );
      // Basic structure check instead of snapshot
      expect(container.querySelector('form')).toBeInTheDocument();
      expect(container.querySelector('hr')).toBeInTheDocument();
      expect(container.querySelector('button[type="submit"]')).toBeInTheDocument();
    });
  });
});
