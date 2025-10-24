import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import User from 'app/components/events/contexts/user/user';
import {FILTER_MASK} from 'app/constants';

describe('User', function () {
  it("displays filtered values but doesn't use them for avatar", function () {
    const user1 = {
      id: '26',
      name: FILTER_MASK,
    };

    const {getByTestId, getByText, unmount} = renderWithTheme(<User data={user1} />);
    expect(getByTestId('user-context-name-value')).toHaveTextContent(FILTER_MASK);
    expect(getByText('?')).toBeInTheDocument();
    unmount();

    const user2 = {
      id: '26',
      email: FILTER_MASK,
    };

    const {
      getByTestId: getByTestId2,
      getByText: getByText2,
      unmount: unmount2,
    } = renderWithTheme(<User data={user2} />);
    expect(getByTestId2('user-context-email-value')).toHaveTextContent(FILTER_MASK);
    expect(getByText2('?')).toBeInTheDocument();
    unmount2();

    const user3 = {
      id: '26',
      username: FILTER_MASK,
    };

    const {getByTestId: getByTestId3, getByText: getByText3} = renderWithTheme(
      <User data={user3} />
    );
    expect(getByTestId3('user-context-username-value')).toHaveTextContent(FILTER_MASK);
    expect(getByText3('?')).toBeInTheDocument();
  });
});
