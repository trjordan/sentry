import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import {Client} from 'app/api';
import AsyncComponent from 'app/components/asyncComponent';

describe('AsyncComponent', function () {
  class TestAsyncComponent extends AsyncComponent {
    shouldRenderBadRequests = true;

    constructor(props) {
      super(props);
      this.state = {};
    }

    getEndpoints() {
      return [['data', '/some/path/to/something/']];
    }

    renderBody() {
      return <div>{this.state.data.message}</div>;
    }
  }

  it('renders on successful request', function () {
    Client.clearMockResponses();
    Client.addMockResponse({
      url: '/some/path/to/something/',
      method: 'GET',
      body: {
        message: 'hi',
      },
    });
    renderWithTheme(<TestAsyncComponent />);

    expect(screen.getByText('hi')).toBeInTheDocument();
  });

  it('renders error message', function () {
    Client.clearMockResponses();
    Client.addMockResponse({
      url: '/some/path/to/something/',
      method: 'GET',
      body: {
        detail: 'oops there was a problem',
      },
      statusCode: 400,
    });
    renderWithTheme(<TestAsyncComponent />);

    expect(screen.getByText('oops there was a problem')).toBeInTheDocument();
  });

  describe('multi-route component', () => {
    class MultiRouteComponent extends TestAsyncComponent {
      getEndpoints() {
        return [
          ['data', '/some/path/to/something/'],
          ['project', '/another/path/here'],
        ];
      }
    }

    it('calls onLoadAllEndpointsSuccess when all endpoints have been loaded', () => {
      jest.useFakeTimers();
      jest.spyOn(Client.prototype, 'request').mockImplementation((url, options) => {
        const timeout = url.includes('something') ? 100 : 50;
        setTimeout(
          () =>
            options.success({
              message: 'good',
            }),
          timeout
        );
      });
      const mockOnAllEndpointsSuccess = jest.spyOn(
        MultiRouteComponent.prototype,
        'onLoadAllEndpointsSuccess'
      );

      const {container} = renderWithTheme(<MultiRouteComponent />);

      // Should show loading indicator initially
      expect(container.querySelector('.loading-indicator')).toBeInTheDocument();

      // After 40ms, still loading - no requests completed yet
      jest.advanceTimersByTime(40);
      expect(container.querySelector('.loading-indicator')).toBeInTheDocument();
      expect(mockOnAllEndpointsSuccess).not.toHaveBeenCalled();

      // After 80ms total, first request completes (50ms timeout)
      jest.advanceTimersByTime(40);
      expect(container.querySelector('.loading-indicator')).toBeInTheDocument();
      expect(mockOnAllEndpointsSuccess).not.toHaveBeenCalled();

      // After 120ms total, second request completes (100ms timeout)
      jest.advanceTimersByTime(40);
      expect(container.querySelector('.loading-indicator')).not.toBeInTheDocument();
      expect(mockOnAllEndpointsSuccess).toHaveBeenCalled();

      jest.restoreAllMocks();
    });
  });
});
