import React from 'react';
import Cookies from 'js-cookie';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import Role from 'app/components/acl/role';
import ConfigStore from 'app/stores/configStore';

describe('Role', function () {
  const organization = TestStubs.Organization({
    role: 'admin',
    availableRoles: [
      {
        id: 'member',
        name: 'Member',
      },
      {
        id: 'admin',
        name: 'Admin',
      },
      {
        id: 'manager',
        name: 'Manager',
      },
      {
        id: 'owner',
        name: 'Owner',
      },
    ],
  });

  beforeEach(function () {
    ConfigStore.init();
    ConfigStore.config = {
      user: {isSuperuser: false},
    };
  });

  describe('as render prop', function () {
    const childrenMock = jest.fn().mockReturnValue(null);
    beforeEach(function () {
      childrenMock.mockClear();
    });

    it('has a sufficient role', function () {
      renderWithTheme(
        <Role organization={organization} role="admin">
          {childrenMock}
        </Role>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasRole: true,
      });
    });

    it('has an unsufficient role', function () {
      renderWithTheme(
        <Role organization={organization} role="manager">
          {childrenMock}
        </Role>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasRole: false,
      });
    });

    it('gives access to a superuser with unsufficient role', function () {
      ConfigStore.config.user = {isSuperuser: true};
      Cookies.set = jest.fn();

      renderWithTheme(
        <Role organization={organization} role="owner">
          {childrenMock}
        </Role>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasRole: true,
      });
      expect(Cookies.set).toHaveBeenCalledWith('su', 'test');
      ConfigStore.config.user = {isSuperuser: false};
    });

    it('does not give access to a made up role', function () {
      renderWithTheme(
        <Role organization={organization} role="abcdefg">
          {childrenMock}
        </Role>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasRole: false,
      });
    });

    it('handles no user', function () {
      const user = {...ConfigStore.config.user};
      ConfigStore.config.user = undefined;
      renderWithTheme(
        <Role organization={organization} role="member">
          {childrenMock}
        </Role>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasRole: false,
      });
      ConfigStore.config.user = user;
    });

    it('handles no availableRoles', function () {
      renderWithTheme(
        <Role role="member" organization={{...organization, availableRoles: undefined}}>
          {childrenMock}
        </Role>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasRole: false,
      });
    });
  });

  describe('as React node', function () {
    it('has a sufficient role', function () {
      renderWithTheme(
        <Role organization={organization} role="member">
          <div>The Child</div>
        </Role>
      );

      expect(screen.getByText('The Child')).toBeInTheDocument();
    });

    it('has an unsufficient role', function () {
      renderWithTheme(
        <Role organization={organization} role="owner">
          <div>The Child</div>
        </Role>
      );

      expect(screen.queryByText('The Child')).not.toBeInTheDocument();
    });
  });
});
