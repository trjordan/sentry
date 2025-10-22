import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import Button from 'app/components/button';
import Collapsible from 'app/components/collapsible';

const items = [1, 2, 3, 4, 5, 6, 7].map(i => <div key={i}>Item {i}</div>);

describe('Collapsible', function () {
  it('collapses items', function () {
    renderWithTheme(<Collapsible>{items}</Collapsible>);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
    expect(screen.getByText('Item 5')).toBeInTheDocument();
    expect(screen.queryByText('Item 6')).not.toBeInTheDocument();
    expect(screen.queryByText('Item 7')).not.toBeInTheDocument();

    expect(screen.getByRole('button', {name: 'Show 2 hidden items'})).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Collapse'})).not.toBeInTheDocument();
  });

  it('expands items', async function () {
    renderWithTheme(<Collapsible>{items}</Collapsible>);

    // expand
    await userEvent.click(screen.getByRole('button', {name: 'Show 2 hidden items'}));

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 5')).toBeInTheDocument();
    expect(screen.getByText('Item 6')).toBeInTheDocument();
    expect(screen.getByText('Item 7')).toBeInTheDocument();

    // collapse back
    await userEvent.click(screen.getByRole('button', {name: 'Collapse'}));

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 5')).toBeInTheDocument();
    expect(screen.queryByText('Item 6')).not.toBeInTheDocument();
    expect(screen.queryByText('Item 7')).not.toBeInTheDocument();
  });

  it('respects maxVisibleItems prop', function () {
    renderWithTheme(<Collapsible maxVisibleItems={2}>{items}</Collapsible>);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.queryByText('Item 3')).not.toBeInTheDocument();
  });

  it('does not collapse items below threshold', function () {
    renderWithTheme(<Collapsible maxVisibleItems={100}>{items}</Collapsible>);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 7')).toBeInTheDocument();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('takes custom buttons', async function () {
    renderWithTheme(
      <Collapsible
        collapseButton={({onCollapse}) => (
          <Button onClick={onCollapse}>Custom Collapse</Button>
        )}
        expandButton={({onExpand, numberOfHiddenItems}) => (
          <Button onClick={onExpand} aria-label="Expand">
            Custom Expand {numberOfHiddenItems}
          </Button>
        )}
      >
        {items}
      </Collapsible>
    );

    expect(screen.getAllByRole('button')).toHaveLength(1);

    // custom expand
    await userEvent.click(screen.getByRole('button', {name: 'Expand'}));

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 5')).toBeInTheDocument();
    expect(screen.getByText('Item 6')).toBeInTheDocument();
    expect(screen.getByText('Item 7')).toBeInTheDocument();

    // custom collapse back
    await userEvent.click(screen.getByRole('button', {name: 'Custom Collapse'}));

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 5')).toBeInTheDocument();
    expect(screen.queryByText('Item 6')).not.toBeInTheDocument();
    expect(screen.queryByText('Item 7')).not.toBeInTheDocument();
  });
});
