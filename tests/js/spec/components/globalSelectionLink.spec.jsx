import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import GlobalSelectionLink from 'app/components/globalSelectionLink';

const path = 'http://some.url/';

describe('GlobalSelectionLink', function () {
  it('has global selection values in query', function () {
    const query = {
      project: ['foo', 'bar'],
      environment: 'staging',
    };

    const router = TestStubs.router({location: {query}});

    const {container} = renderWithTheme(
      <GlobalSelectionLink to={path}>Go somewhere!</GlobalSelectionLink>,
      {context: {router, location: router.location}}
    );

    const link = screen.getByRole('link', {name: 'Go somewhere!'});
    expect(link).toBeInTheDocument();

    // Access the React component props via the container
    const linkElement = container.querySelector('a');
    expect(linkElement).toHaveAttribute('href', expect.stringContaining(path));
  });

  it('does not have global selection values in query', function () {
    const router = TestStubs.router({location: {query: {}}});

    const {container} = renderWithTheme(
      <GlobalSelectionLink to={path}>Go somewhere!</GlobalSelectionLink>,
      {context: {router, location: router.location}}
    );

    const link = screen.getByRole('link', {name: 'Go somewhere!'});
    expect(link).toBeInTheDocument();

    const linkElement = container.querySelector('a');
    expect(linkElement).toHaveAttribute('href', path);
  });

  it('combines query parameters with custom query', function () {
    const query = {
      project: ['foo', 'bar'],
      environment: 'staging',
    };
    const customQuery = {query: 'something'};

    const router = TestStubs.router({location: {query}});

    const {container} = renderWithTheme(
      <GlobalSelectionLink to={{pathname: path, query: customQuery}}>
        Go somewhere!
      </GlobalSelectionLink>,
      {context: {router, location: router.location}}
    );

    const link = screen.getByRole('link', {name: 'Go somewhere!'});
    expect(link).toBeInTheDocument();

    // Verify the link contains the combined query parameters
    const linkElement = container.querySelector('a');
    const href = linkElement?.getAttribute('href') || '';
    // Array query params are serialized as comma-separated values
    expect(href).toContain('project=foo%2Cbar');
    expect(href).toContain('environment=staging');
    expect(href).toContain('query=something');
  });

  it('combines query parameters with no query', function () {
    const query = {
      project: ['foo', 'bar'],
      environment: 'staging',
    };

    const router = TestStubs.router({location: {query}});

    const {container} = renderWithTheme(
      <GlobalSelectionLink to={{pathname: path}}>Go somewhere!</GlobalSelectionLink>,
      {context: {router, location: router.location}}
    );

    const link = screen.getByRole('link', {name: 'Go somewhere!'});
    expect(link).toBeInTheDocument();

    // Verify the link contains the query parameters
    const linkElement = container.querySelector('a');
    const href = linkElement?.getAttribute('href') || '';
    // Array query params are serialized as comma-separated values
    expect(href).toContain('project=foo%2Cbar');
    expect(href).toContain('environment=staging');
  });
});
