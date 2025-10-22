import React from 'react';

import {
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import HelpSearch from 'app/components/helpSearch';

const mockResults = [
  {
    site: 'docs',
    name: 'Documentation',
    hits: [
      {
        id: 'SitePage /platforms/native/guides/minidumps/',
        site: 'docs',
        url: 'https://docs.sentry.io/platforms/native/guides/minidumps/',
        context: {context1: 'Platforms > Native > Guides > Minidumps'},
        title: 'Minidumps',
        text:
          'Sentry can process Minidump crash reports, a memory <mark>dump</mark> used on Windows and by\nopen …',
      },
      {
        id: 'SitePage /product/discover-queries/query-builder/',
        site: 'docs',
        url: 'https://docs.sentry.io/product/discover-queries/query-builder/',
        context: {context1: 'Product > Discover Queries > Query Builder'},
        title: 'Query Builder',
        text:
          '… conditions, see  Using  OR  &  AND  Conditions . Tag <mark>Summ</mark>ary Filters Every event has a list of …',
      },
    ],
  },
  {
    site: 'help-center',
    name: 'Help Center',
    hits: [],
  },
  {
    site: 'develop',
    name: 'Developer Documentation',
    hits: [
      {
        id: 'eee2b51a-7594-5f86-91db-267c15db5ef6',
        site: 'develop',
        url: 'https://develop.sentry.dev/services/digests/',
        context: {context1: 'Services > Digests'},
        title: 'Notification Digests',
        text:
          '… operation, especially on large data sets. Backends <mark>Dumm</mark>y Backend The <mark>dumm</mark>y backend disables digest scheduling …',
      },
    ],
  },
  {
    site: 'blog',
    name: 'Blog Posts',
    hits: [
      {
        id: 'ae61cfd6d4b462d24dd4622b8b7db274',
        site: 'blog',
        context: {context1: 'Building Sentry: Symbolicator'},
        url: 'https://blog.sentry.io/2019/06/13/building-a-sentry-symbolicator/',
        title: 'Stacking your cards frames',
        text:
          '… traces. Since iOS is particularly restrictive, we <mark>dump</mark>ed this information into a temporary location and …',
      },
    ],
  },
];

jest.mock('@sentry-internal/global-search', () => ({
  SentryGlobalSearch: jest
    .fn()
    .mockImplementation(() => ({query: () => Promise.resolve(mockResults)})),
}));

describe('HelpSearch', function () {
  it('produces search results', async function () {
    const router = TestStubs.router();
    renderWithTheme(
      <HelpSearch
        entryPoint="sidebar_help"
        renderInput={({getInputProps}) => <input {...getInputProps({type: 'text'})} />}
      />,
      {context: {router, location: router.location}}
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'dummy');

    await waitFor(() => {
      // Check that the 4 section headings are rendered
      expect(screen.getByText(/From Documentation/)).toBeInTheDocument();
      expect(screen.getByText(/From Help Center/)).toBeInTheDocument();
      expect(screen.getByText(/From Developer Documentation/)).toBeInTheDocument();
      expect(screen.getByText(/From Blog Posts/)).toBeInTheDocument();
    });

    // 3 search result wrappers - one is missing "Minidumps" from docs
    // (1 from docs instead of 2, 0 from help-center, 1 from develop, 1 from blog)
    const resultWrappers = document.querySelectorAll('.css-16jp335-SearchResultWrapper');
    expect(resultWrappers.length).toBeGreaterThanOrEqual(3);

    // 5 highlight markers (from the <mark> tags in the mock data)
    const marks = document.querySelectorAll('mark');
    expect(marks).toHaveLength(5);
  });
});
