import React from 'react';
import {render} from '@testing-library/react';

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

    it('has access', function () {
      render(<Access organization={organization}>{childrenMock}</Access>);

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

    it('has no access when requireAll and missing one', function () {
      render(
        <Access organization={organization} access={['org:write', 'project:write']}>
          {childrenMock}
        </Access>
      );

      expect(childrenMock).toHaveBeenCalledWith({
        hasAccess: false,
        hasSuperuser: false,
      });
    });

    it('has access when requireAll is false and has one of the access levels', function () {
      render(
        <Access
          organization={organization}
          access={['org:write', 'project:write']}
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

    it('handles no user', function () {
      // Regression test for the share sheet.
      ConfigStore.config = {
        user: null,
      };

      render(<Access organization={organization}>{childrenMock}</Access>);

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
      const {container} = render(
        <Access organization={organization} access={['project:write']}>
          <div>The Child</div>
        </Access>
      );

      expect(container.textContent).toBe('The Child');
    });

    it('has superuser', function () {
      ConfigStore.config = {
        user: {isSuperuser: true},
      };
      const {container} = render(
        <Access organization={organization} isSuperuser>
          <div>The Child</div>
        </Access>
      );

      expect(container.textContent).toBe('The Child');
    });

    it('has no access', function () {
      const {container} = render(
        <Access organization={organization} access={['org:write']}>
          <div>The Child</div>
        </Access>
      );

      expect(container.textContent).toBe('');
    });

    it('has no superuser', function () {
      ConfigStore.config = {
        user: {isSuperuser: false},
      };
      const {container} = render(
        <Access organization={organization} isSuperuser>
          <div>The Child</div>
        </Access>
      );
      expect(container.textContent).toBe('');
    });
  });
});
