import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import UserBadge from 'app/components/idBadge/userBadge';

describe('UserBadge', function () {
  const user = TestStubs.User();

  it('renders with no link when user is supplied', function () {
    const {container} = renderWithTheme(<UserBadge user={user} />);

    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText('Foo Bar')).toBeInTheDocument();
    expect(screen.getByText('foo@example.com')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('can display alternate display names/emails', function () {
    renderWithTheme(
      <UserBadge
        user={user}
        displayName="Other Display Name"
        displayEmail="Other Display Email"
      />
    );

    expect(screen.getByText('Other Display Name')).toBeInTheDocument();
    expect(screen.getByText('Other Display Email')).toBeInTheDocument();
  });

  it('can coalesce using username', function () {
    const username = TestStubs.User({
      name: null,
      email: null,
      username: 'the-batman',
    });
    renderWithTheme(<UserBadge user={username} />);

    expect(screen.getByText(username.username)).toBeInTheDocument();
  });

  it('can coalesce using ipaddress', function () {
    const ipUser = TestStubs.User({
      name: null,
      email: null,
      username: null,
      ipAddress: '127.0.0.1',
    });
    renderWithTheme(<UserBadge user={ipUser} />);

    expect(screen.getByText(ipUser.ipAddress)).toBeInTheDocument();
  });

  it('can coalesce using id', function () {
    const idUser = TestStubs.User({
      id: '99',
      name: null,
      email: null,
      username: null,
      ipAddress: null,
    });
    renderWithTheme(<UserBadge user={idUser} />);

    expect(screen.getByText(idUser.id)).toBeInTheDocument();
  });

  it('can hide email address', function () {
    renderWithTheme(<UserBadge user={user} hideEmail />);

    expect(screen.queryByText('foo@example.com')).not.toBeInTheDocument();
  });
});
