import React from 'react';

import {
  fireEvent,
  renderWithTheme,
  screen,
  within,
} from 'sentry-test/reactTestingLibrary';

import {Client} from 'app/api';
import PlatformPicker from 'app/components/platformPicker';

describe('PlatformPicker', function () {
  beforeEach(function () {
    this.stubbedApiRequest = jest.spyOn(Client.prototype, 'request');
  });

  afterEach(function () {
    Client.prototype.request.mockRestore();
  });

  describe('render()', function () {
    const baseProps = {
      platform: '',
      setPlatform: () => {},
      location: {query: {}},
    };

    it('should only render Mobile platforms under Mobile tab', function () {
      const props = {
        ...baseProps,
      };

      const router = TestStubs.router();
      renderWithTheme(<PlatformPicker {...props} />, {context: {router}});

      // Click on the Mobile tab
      const mobileTab = screen.getByText('Mobile');
      fireEvent.click(mobileTab);

      // Check that mobile platforms are rendered and java is not
      expect(screen.queryByTestId('platform-java')).not.toBeInTheDocument();
      expect(screen.getByTestId('platform-apple-ios')).toBeInTheDocument();
      expect(screen.getByTestId('platform-react-native')).toBeInTheDocument();
    });

    it('should render renderPlatformList with Python when filtered with py', function () {
      const props = {
        ...baseProps,
      };

      const router = TestStubs.router();
      renderWithTheme(<PlatformPicker {...props} />, {context: {router}});

      // Type 'py' in the filter input
      const filterInput = screen.getByPlaceholderText('Filter Platforms');
      fireEvent.change(filterInput, {target: {value: 'py'}});

      // Check that python platforms are shown and java is not
      expect(screen.queryByTestId('platform-java')).not.toBeInTheDocument();
      expect(screen.getByTestId('platform-python-flask')).toBeInTheDocument();
    });

    it('should render renderPlatformList with Native when filtered with c++ alias', function () {
      const props = {
        ...baseProps,
      };

      const router = TestStubs.router();
      renderWithTheme(<PlatformPicker {...props} />, {context: {router}});

      // Type 'c++' in the filter input
      const filterInput = screen.getByPlaceholderText('Filter Platforms');
      fireEvent.change(filterInput, {target: {value: 'c++'}});

      // Check that native platform is shown (c++ is an alias for native)
      expect(screen.getByTestId('platform-native')).toBeInTheDocument();
    });

    it('should render renderPlatformList with community SDKs message if platform not found', function () {
      const props = {
        ...baseProps,
      };

      const router = TestStubs.router();
      renderWithTheme(<PlatformPicker {...props} />, {context: {router}});

      // Type a filter that won't match any platform
      const filterInput = screen.getByPlaceholderText('Filter Platforms');
      fireEvent.change(filterInput, {target: {value: 'aaaaaa'}});

      // Check that EmptyMessage is displayed
      expect(screen.getByText(/We don't have an SDK for that yet!/i)).toBeInTheDocument();
    });

    it('should update State.tab onClick when particular tab is clicked', function () {
      const props = {
        ...baseProps,
      };

      const router = TestStubs.router();
      renderWithTheme(<PlatformPicker {...props} />, {context: {router}});

      // Find the 'All' tab (last tab) and click it
      const allTab = screen.getByText('All');

      // Initially, 'Popular' tab should be active (has active class)
      const popularTab = screen.getByText('Popular');
      expect(popularTab.parentElement).toHaveClass('active');

      // Click the 'All' tab
      fireEvent.click(allTab);

      // Now 'All' tab should be active
      expect(allTab.parentElement).toHaveClass('active');
    });

    it('should clear the platform when clear is clicked', function () {
      const props = {
        ...baseProps,
        platform: 'java',
        setPlatform: jest.fn(),
      };

      const router = TestStubs.router();
      renderWithTheme(<PlatformPicker {...props} />, {context: {router}});

      // Find the clear button within the selected platform card
      const platformCard = screen.getByTestId('platform-java');
      const clearButton = within(platformCard).getByRole('button');

      fireEvent.click(clearButton);
      expect(props.setPlatform).toHaveBeenCalledWith(null);
    });
  });
});
