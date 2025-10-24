import React from 'react';

import {render} from 'sentry-test/reactTestingLibrary';

import HttpRenderer from 'app/components/events/interfaces/breadcrumbs/data/http';
import {BreadcrumbLevelType, BreadcrumbType} from 'app/types/breadcrumbs';

describe('HttpRenderer', () => {
  describe('render', () => {
    it('should work', () => {
      const {getByTestId, getByText} = render(
        <HttpRenderer
          searchTerm=""
          breadcrumb={{
            type: BreadcrumbType.HTTP,
            level: BreadcrumbLevelType.INFO,
            data: {
              method: 'POST',
              url: 'http://example.com/foo',
              // status_code 0 is possible via broken client-side XHR; should still render as '[0]'
              status_code: 0,
            },
          }}
        />
      );

      // Check for the method (POST)
      expect(getByText('POST')).toBeInTheDocument();

      // Check for the URL link
      const linkElement = getByTestId('http-renderer-external-link');
      expect(linkElement).toHaveTextContent('http://example.com/foo');
      expect(linkElement).toHaveAttribute('href', 'http://example.com/foo');

      // Check for the status code
      expect(getByTestId('http-renderer-status-code')).toHaveTextContent('[0]');
    });

    it("shouldn't blow up if crumb.data is missing", () => {
      const {queryByTestId, queryByRole} = render(
        <HttpRenderer
          searchTerm=""
          breadcrumb={{
            category: 'xhr',
            type: BreadcrumbType.HTTP,
            level: BreadcrumbLevelType.INFO,
          }}
        />
      );

      // Should render without crashing but with no content
      expect(queryByRole('link')).not.toBeInTheDocument();
      expect(queryByTestId('http-renderer-external-link')).not.toBeInTheDocument();
      expect(queryByTestId('http-renderer-status-code')).not.toBeInTheDocument();
    });

    it("shouldn't blow up if url is not a string", () => {
      const {queryByTestId, getByText} = render(
        <HttpRenderer
          searchTerm=""
          breadcrumb={{
            category: 'xhr',
            type: BreadcrumbType.HTTP,
            level: BreadcrumbLevelType.INFO,
            data: {
              method: 'GET',
            },
          }}
        />
      );

      // Should render method but no URL or status code
      expect(getByText('GET')).toBeInTheDocument();

      expect(queryByTestId('http-renderer-external-link')).not.toBeInTheDocument();
      expect(queryByTestId('http-renderer-status-code')).not.toBeInTheDocument();
    });
  });
});
