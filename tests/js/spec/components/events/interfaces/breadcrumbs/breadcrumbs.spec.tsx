import React from 'react';

import {
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import BreadcrumbsInterface from 'app/components/events/interfaces/breadcrumbs';

describe('BreadcrumbsInterface', () => {
  let props;

  beforeEach(() => {
    props = {
      // @ts-ignore Cannot find TestStubs
      organization: TestStubs.Organization(),
      event: {
        entries: [],
        id: '4',
      },
      type: 'blah',
      data: {
        values: [
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'hey', category: 'error', level: 'info'},
          {message: 'hello', category: 'default', level: 'extreme'},
          {message: 'bye', category: 'default', level: 'extreme'},
          {message: 'ok', category: 'error', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
        ],
      },
    };
  });

  describe('filterCrumbs', () => {
    it('should filter crumbs based on crumb message', async () => {
      renderWithTheme(<BreadcrumbsInterface {...props} />);

      const searchInput = screen.getByPlaceholderText('Search breadcrumbs');

      // First verify we can see some 'sup' messages
      const supElements = screen.queryAllByText('sup');
      expect(supElements.length).toBeGreaterThan(0);

      // Type a search that won't match anything
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'nomatchforthis{enter}');
      // Wait for the component to update - check that the original content is gone
      await waitFor(() => {
        const supElementsAfterFilter = screen.queryAllByText('sup');
        expect(supElementsAfterFilter.length).toBe(0);
      });

      // Clear and type a new search
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'sup{enter}');
      await waitFor(() => {
        // Should show breadcrumbs that contain 'sup'
        const supElementsAgain = screen.queryAllByText('sup');
        expect(supElementsAgain.length).toBeGreaterThan(0);
      });
    });

    it('should filter crumbs based on crumb level', async () => {
      renderWithTheme(<BreadcrumbsInterface {...props} />);

      const searchInput = screen.getByPlaceholderText('Search breadcrumbs');

      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'extreme{enter}');
      await waitFor(() => {
        // Should show breadcrumbs that contain 'extreme' in level
        const supElements = screen.queryAllByText('sup');
        expect(supElements.length).toBeGreaterThan(0);
      });
    });

    it('should filter crumbs based on crumb category', async () => {
      renderWithTheme(<BreadcrumbsInterface {...props} />);

      const searchInput = screen.getByPlaceholderText('Search breadcrumbs');

      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'error{enter}');
      await waitFor(() => {
        // Should show breadcrumbs with category 'error'
        // 'hey' has category 'error'
        const heyElements = screen.queryAllByText('hey');
        expect(heyElements.length).toBeGreaterThan(0);
        // 'ok' has category 'error'
        const okElements = screen.queryAllByText('ok');
        expect(okElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('render', () => {
    it('should display the correct number of crumbs with no filter', () => {
      props.data.values = props.data.values.slice(0, 4);
      renderWithTheme(<BreadcrumbsInterface {...props} />);

      // Count the number of breadcrumb items rendered
      // ListBody components are wrapped in divs, so we look for the message text
      expect(screen.getByText('sup')).toBeInTheDocument();
      expect(screen.getByText('hey')).toBeInTheDocument();
      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(screen.getByText('bye')).toBeInTheDocument();
    });

    it('should display the correct number of crumbs with a filter', async () => {
      props.data.values = props.data.values.slice(0, 4);
      renderWithTheme(<BreadcrumbsInterface {...props} />);

      // Verify all items are initially displayed
      expect(screen.getByText('sup')).toBeInTheDocument();
      expect(screen.getByText('hey')).toBeInTheDocument();
      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(screen.getByText('bye')).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText('Search breadcrumbs');

      await userEvent.type(searchInput, 'hello{enter}');

      await waitFor(() => {
        // After filtering for 'hello', only 'hello' should be visible
        expect(screen.getByText('hello')).toBeInTheDocument();
        // Check that visible count has changed (we're filtering something)
        const allMessages = screen.getAllByText(/sup|hey|hello|bye/);
        // Before: 4 items, after filtering for 'hello' should have just 1
        expect(allMessages.length).toBe(1);
      });
    });

    it('should not crash if data contains a toString attribute', () => {
      // Regression test: A "toString" property in data should not falsely be
      // used to coerce breadcrumb data to string. This would cause a TypeError.
      const data = {nested: {toString: 'hello'}};
      props.data.values = [{message: 'sup', category: 'default', level: 'info', data}];
      renderWithTheme(<BreadcrumbsInterface {...props} />);

      expect(screen.getByText('sup')).toBeInTheDocument();
    });
  });
});
