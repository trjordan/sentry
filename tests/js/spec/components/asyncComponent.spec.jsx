import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

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
    const {container} = renderWithTheme(<TestAsyncComponent />);

    // Check that exactly one div is rendered with the text 'hi'
    const divs = container.querySelectorAll('div');
    expect(divs).toHaveLength(1);
    expect(divs[0]).toHaveTextContent('hi');
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
    const {container} = renderWithTheme(<TestAsyncComponent />);

    // Check that LoadingError component is rendered with the correct text
    const loadingError = container.querySelector(
      '[data-test-id="loading-error-message"]'
    );
    expect(loadingError).toBeInTheDocument();
    expect(loadingError).toHaveTextContent('oops there was a problem');
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

      const ref = React.createRef();
      renderWithTheme(<MultiRouteComponent ref={ref} />);

      expect(ref.current.state.loading).toEqual(true);
      expect(ref.current.state.remainingRequests).toEqual(2);

      jest.advanceTimersByTime(40);
      expect(ref.current.state.loading).toEqual(true);
      expect(ref.current.state.remainingRequests).toEqual(2);

      jest.advanceTimersByTime(40);
      expect(ref.current.state.loading).toEqual(true);
      expect(ref.current.state.remainingRequests).toEqual(1);
      expect(mockOnAllEndpointsSuccess).not.toHaveBeenCalled();

      jest.advanceTimersByTime(40);
      expect(ref.current.state.loading).toEqual(false);
      expect(ref.current.state.remainingRequests).toEqual(0);
      expect(mockOnAllEndpointsSuccess).toHaveBeenCalled();

      jest.restoreAllMocks();
    });
  });
});
