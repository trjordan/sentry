import React from 'react';

import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import Access from 'app/components/acl/access';
import ConfigStore from 'app/stores/configStore';

describe('Access', function () {
  const organization = TestStubs.Organization({
    access: ['project:write', 'project:read'],
  });

  describe('as render prop', function () {
    const childrenMock = jest.fn().mockReturnValue(null);
    beforeEach(function () {
      childrenMock.mockClear();
    });

    it('has access when requireAll is false', function () {
      render(
        <Access
          organization={organization}
          access={['project:write', 'project:read', 'org:read']}
          requireAll={false}
        >
          {childrenMock}
        </Access>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasAccess: true,
        hasSuperuser: false,
      });
    });

    it('has access', function () {
      render(
        <Access organization={organization} access={['project:write', 'project:read']}>
          {childrenMock}
        </Access>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasAccess: true,
        hasSuperuser: false,
      });
    });

    it('has no access', function () {
      render(
        <Access organization={organization} access={['org:write']}>
          {childrenMock}
        </Access>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasAccess: false,
        hasSuperuser: false,
      });
    });

    it('calls render function when no access', function () {
      const noAccessRenderer = jest.fn(() => null);
      render(
        <Access
          organization={organization}
          access={['org:write']}
          renderNoAccessMessage={noAccessRenderer}
        >
          {childrenMock}
        </Access>
      );

      expect(childrenMock).not.toHaveBeenCalled();
      expect(noAccessRenderer).toHaveBeenCalled();
    });

    it('can specify org from props', function () {
      render(
        <Access
          organization={TestStubs.Organization({access: ['org:write']})}
          access={['org:write']}
        >
          {childrenMock}
        </Access>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasAccess: true,
        hasSuperuser: false,
      });
    });

    it('handles no org/project', function () {
      render(
        <Access organization={organization} access={['org:write']}>
          {childrenMock}
        </Access>
      );

      expect(childrenMock).toHaveBeenCalledWith(
        expect.objectContaining({
          hasAccess: false,
          hasSuperuser: false,
        })
      );
    });

    it('handles no user', function () {
      // Regression test for the share sheet.
      ConfigStore.config = {
        user: null,
      };

      render(
        <Access organization={organization}>{childrenMock}</Access>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasAccess: true,
        hasSuperuser: false,
      });
    });

    it('is superuser', function () {
      ConfigStore.config = {
        user: {isSuperuser: true},
      };
      render(
        <Access organization={organization} isSuperuser>
          {childrenMock}
        </Access>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasAccess: true,
        hasSuperuser: true,
      });
    });

    it('is not superuser', function () {
      ConfigStore.config = {
        user: {isSuperuser: false},
      };
      render(
        <Access organization={organization} isSuperuser>
          {childrenMock}
        </Access>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasAccess: true,
        hasSuperuser: false,
      });
    });
  });

  describe('as React node', function () {
    it('has access', function () {
      render(
        <Access organization={organization} access={['project:write']}>
          <div>The Child</div>
        </Access>
      );

      expect(screen.getByText('The Child')).toBeInTheDocument();
    });

    it('has superuser', function () {
      ConfigStore.config = {
        user: {isSuperuser: true},
      };
      render(
        <Access organization={organization} isSuperuser>
          <div>The Child</div>
        </Access>
      );

      expect(screen.getByText('The Child')).toBeInTheDocument();
    });

    it('has no access', function () {
      render(
        <Access organization={organization} access={['org:write']}>
          <div>The Child</div>
        </Access>
      );

      expect(screen.queryByText('The Child')).not.toBeInTheDocument();
    });

    it('has no superuser', function () {
      ConfigStore.config = {
        user: {isSuperuser: false},
      };
      render(
        <Access organization={organization} isSuperuser>
          <div>The Child</div>
        </Access>
      );
      expect(screen.queryByText('The Child')).not.toBeInTheDocument();
    });
  });
});
