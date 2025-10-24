import React from 'react';

import {render, screen} from 'sentry-test/reactTestingLibrary';

import AvatarList from 'app/components/avatar/avatarList';

describe('AvatarList', function () {
  it('renders with user avatars', function () {
    const users = [TestStubs.User({id: '1'}), TestStubs.User({id: '2'})];

    render(<AvatarList users={users} />);
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.queryByText(/other users/i)).not.toBeInTheDocument();
  });

  it('renders with collapsed avatar count if > 5 users', function () {
    const users = [
      TestStubs.User({id: '1'}),
      TestStubs.User({id: '2'}),
      TestStubs.User({id: '3'}),
      TestStubs.User({id: '4'}),
      TestStubs.User({id: '5'}),
      TestStubs.User({id: '6'}),
    ];

    render(<AvatarList users={users} />);
    expect(screen.getAllByRole('img')).toHaveLength(5);
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
});
