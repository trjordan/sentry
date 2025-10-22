import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import ContextData from 'app/components/contextData';

describe('ContextData', function () {
  describe('render()', function () {
    describe('strings', function () {
      it('should render urls w/ an additional <a> link', function () {
        const URL = 'https://example.org/foo/bar/';
        const {container} = renderWithTheme(<ContextData data={URL} />);

        const span = container.querySelector('span.val-string');
        expect(span).toHaveTextContent(URL);
        expect(screen.getByRole('link')).toHaveAttribute('href', URL);
      });
    });
  });
});
