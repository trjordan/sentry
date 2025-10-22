import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import PanelTable from 'app/components/panels/panelTable';

describe('PanelTable', function () {
  const createWrapper = (props = {}) =>
    renderWithTheme(
      <PanelTable
        headers={[<div key="1">1</div>, <div key="2">2</div>, <div key="3">3</div>]}
        {...props}
      >
        <div data-test-id="cell">Cell 1</div>
        <div data-test-id="cell">Cell 2</div>
        <div data-test-id="cell">Cell 3</div>
      </PanelTable>
    );

  it('renders headers', function () {
    const {container} = createWrapper();

    expect(container.querySelectorAll('[role="columnheader"]')).toHaveLength(3);

    // 3 divs from headers, 3 from "body"
    expect(screen.getAllByTestId('cell')).toHaveLength(3);

    expect(container.querySelector('[role="columnheader"]')).toHaveTextContent('1');
  });

  it('renders loading', function () {
    const {container} = createWrapper({isLoading: true});

    // Does not render content
    expect(screen.queryAllByTestId('cell')).toHaveLength(0);

    // renders loading - LoadingIndicator uses data-testid not data-test-id
    expect(
      container.querySelector('[data-testid="loading-indicator"]')
    ).toBeInTheDocument();
  });

  it('renders custom loader', function () {
    const {container} = createWrapper({
      isLoading: true,
      loader: <span data-test-id="custom-loader">loading</span>,
    });

    // Does not render content
    expect(screen.queryAllByTestId('cell')).toHaveLength(0);

    // no default loader - LoadingIndicator uses data-testid not data-test-id
    expect(
      container.querySelector('[data-testid="loading-indicator"]')
    ).not.toBeInTheDocument();

    // has custom loader
    expect(screen.getByTestId('custom-loader')).toBeInTheDocument();
  });

  it('ignores empty state when loading', function () {
    const {container} = createWrapper({isLoading: true, isEmpty: true});

    // renders loading - LoadingIndicator uses data-testid not data-test-id
    expect(
      container.querySelector('[data-testid="loading-indicator"]')
    ).toBeInTheDocument();
    expect(screen.queryByText('I am empty inside')).not.toBeInTheDocument();
  });

  it('renders empty state with custom message', function () {
    createWrapper({isEmpty: true, emptyMessage: 'I am empty inside'});

    // Does not render content
    expect(screen.queryAllByTestId('cell')).toHaveLength(0);

    // renders empty state
    expect(screen.getByText('I am empty inside')).toBeInTheDocument();
  });

  it('children can be a render function', function () {
    renderWithTheme(
      <PanelTable
        headers={[<div key="1">1</div>, <div key="2">2</div>, <div key="3">3</div>]}
      >
        {() => <p>I am child</p>}
      </PanelTable>
    );

    expect(screen.getByText('I am child')).toBeInTheDocument();
  });
});
