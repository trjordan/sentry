import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import {KeyValueTable, KeyValueTableRow} from 'app/components/keyValueTable';

describe('KeyValueTable', function () {
  it('basic', function () {
    const {container} = renderWithTheme(
      <KeyValueTable>
        <KeyValueTableRow keyName="Coffee" value="Black hot drink" />
        <KeyValueTableRow keyName="Milk" value={<a href="#">White cold drink</a>} />
      </KeyValueTable>
    );

    expect(container.querySelector('dl')).toBeInTheDocument();

    const dtElements = container.querySelectorAll('dt');
    expect(dtElements[0]).toHaveTextContent('Coffee');
    expect(dtElements[1]).toHaveTextContent('Milk');

    const ddElements = container.querySelectorAll('dd');
    expect(ddElements[0]).toHaveTextContent('Black hot drink');

    const link = container.querySelector('dd a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('White cold drink');
  });
});
