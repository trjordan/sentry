import React from 'react';

import {fireEvent, render, screen} from 'sentry-test/reactTestingLibrary';

import ApiTokenRow from 'app/views/settings/account/apiTokenRow';

describe('ApiTokenRow', function () {
  it('renders', function () {
    const {container} = render(
      <ApiTokenRow onRemove={() => {}} token={TestStubs.ApiToken()} />,
      {context: TestStubs.routerContext()}
    );

    // Should be loading
    expect(container).toMatchSnapshot();
  });

  it('calls onRemove callback when trash can is clicked', function () {
    const cb = jest.fn();
    render(<ApiTokenRow onRemove={cb} token={TestStubs.ApiToken()} />, {
      context: TestStubs.routerContext(),
    });

    fireEvent.click(screen.getByRole('button'));
    expect(cb).toHaveBeenCalled();
  });
});
