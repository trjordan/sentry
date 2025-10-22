import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import MemberBadge from 'app/components/idBadge/memberBadge';

describe('MemberBadge', function () {
  let member;
  beforeEach(() => {
    member = TestStubs.Member();
  });

  it('renders with link when member and orgId are supplied', function () {
    renderWithTheme(<MemberBadge member={member} orgId="orgId" />);

    expect(screen.getByText('Foo Bar')).toBeInTheDocument();
    expect(screen.getByText('foo@example.com')).toBeInTheDocument();
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('does not use a link when useLink = false', function () {
    renderWithTheme(<MemberBadge member={member} useLink={false} orgId="orgId" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('does not use a link when orgId = null', function () {
    renderWithTheme(<MemberBadge member={member} useLink />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('can display alternate display names/emails', function () {
    renderWithTheme(
      <MemberBadge
        member={member}
        displayName="Other Display Name"
        displayEmail="Other Display Email"
      />
    );

    expect(screen.getByText('Other Display Name')).toBeInTheDocument();
    expect(screen.getByText('Other Display Email')).toBeInTheDocument();
  });

  it('can coalesce using username', function () {
    member.user = TestStubs.User({
      name: null,
      email: null,
      username: 'the-batman',
    });

    renderWithTheme(<MemberBadge member={member} />);

    expect(screen.getByText(member.user.username)).toBeInTheDocument();
    expect(screen.queryByText('foo@example.com')).not.toBeInTheDocument();
  });

  it('can coalesce using ipaddress', function () {
    member.user = TestStubs.User({
      name: null,
      email: null,
      username: null,
      ipAddress: '127.0.0.1',
    });
    renderWithTheme(<MemberBadge member={member} />);

    expect(screen.getByText(member.user.ipAddress)).toBeInTheDocument();
    expect(screen.queryByText('foo@example.com')).not.toBeInTheDocument();
  });

  it('can hide email address', function () {
    renderWithTheme(<MemberBadge member={member} hideEmail />);

    expect(screen.queryByText('foo@example.com')).not.toBeInTheDocument();
  });

  it('renders when a member without a user to passed to member', function () {
    renderWithTheme(<MemberBadge member={{...member, user: null}} />);

    expect(screen.getByText('Sentry 1 Name')).toBeInTheDocument();
  });
});
