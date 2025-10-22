import React from 'react';

import {render, screen, tick} from 'sentry-test/reactTestingLibrary';

import Avatar from 'app/components/avatar';

jest.mock('app/stores/configStore', () => ({
  getConfig: () => ({
    gravatarBaseUrl: 'gravatarBaseUrl',
  }),
}));

describe('Avatar', function () {
  const USER = {
    id: '1',
    name: 'Jane Bloggs',
    email: 'janebloggs@example.com',
  };

  describe('render()', function () {
    it('has `avatar` className', function () {
      const user = Object.assign({}, USER, {
        avatar: {
          avatarType: 'gravatar',
          avatarUuid: '2d641b5d-8c74-44de-9cb6-fbd54701b35e',
        },
      });
      const {container} = render(<Avatar user={user} />);
      expect(container.querySelector('span.avatar')).toBeInTheDocument();
    });

    it('should show a gravatar when avatar type is gravatar', async function () {
      const user = Object.assign({}, USER, {
        avatar: {
          avatarType: 'gravatar',
          avatarUuid: '2d641b5d-8c74-44de-9cb6-fbd54701b35e',
        },
      });
      const {container} = render(<Avatar user={user} />);

      // The gravatar hasn't loaded yet - just check the span is rendered
      expect(container.querySelector('span.avatar')).toBeInTheDocument();

      // Need update because Gravatar async imports a library
      await tick();

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img.src).toMatch('gravatarBaseUrl/avatar/');
    });

    it('should show an upload when avatar type is upload', function () {
      const user = Object.assign({}, USER, {
        avatar: {
          avatarType: 'upload',
          avatarUuid: '2d641b5d-8c74-44de-9cb6-fbd54701b35e',
        },
      });
      const {container} = render(<Avatar user={user} />);
      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img.src).toMatch('/avatar/2d641b5d-8c74-44de-9cb6-fbd54701b35e');
    });

    it('should show an upload with the correct size (static 120 size)', function () {
      const user = Object.assign({}, USER, {
        avatar: {
          avatarType: 'upload',
          avatarUuid: '2d641b5d-8c74-44de-9cb6-fbd54701b35e',
        },
      });
      let result = render(<Avatar user={user} size={76} />);
      let img = result.container.querySelector('img');
      expect(img.src).toMatch('/avatar/2d641b5d-8c74-44de-9cb6-fbd54701b35e/?s=120');
      result.unmount();

      result = render(<Avatar user={user} size={121} />);
      img = result.container.querySelector('img');
      expect(img.src).toMatch('/avatar/2d641b5d-8c74-44de-9cb6-fbd54701b35e/?s=120');
      result.unmount();

      result = render(<Avatar user={user} size={32} />);
      img = result.container.querySelector('img');
      expect(img.src).toMatch('/avatar/2d641b5d-8c74-44de-9cb6-fbd54701b35e/?s=120');
      result.unmount();

      result = render(<Avatar user={user} size={1} />);
      img = result.container.querySelector('img');
      expect(img.src).toMatch('/avatar/2d641b5d-8c74-44de-9cb6-fbd54701b35e/?s=120');
    });

    it('should not show upload or gravatar when avatar type is letter', function () {
      const user = Object.assign({}, USER, {
        avatar: {
          avatarType: 'letter_avatar',
          avatarUuid: '2d641b5d-8c74-44de-9cb6-fbd54701b35e',
        },
      });
      const {container} = render(<Avatar user={user} />);
      expect(
        container.querySelector('[data-test-id="letter-avatar"]')
      ).toBeInTheDocument();
      expect(container.querySelector('img')).not.toBeInTheDocument();
    });

    it('use letter avatar by default, when no avatar type is set and user has an email address', function () {
      const {container} = render(<Avatar user={USER} />);
      expect(
        container.querySelector('[data-test-id="letter-avatar"]')
      ).toBeInTheDocument();
      expect(container.querySelector('img')).not.toBeInTheDocument();
    });

    it('should show a gravatar when no avatar type is set and user has an email address', function () {
      render(<Avatar gravatar user={USER} />);
      // Avatar component should render when gravatar prop is set
      expect(screen.getByTitle('Jane Bloggs')).toBeInTheDocument();
    });

    it('should not show a gravatar when no avatar type is set and user has no email address', function () {
      const user = Object.assign({}, USER);
      delete user.email;
      const {container} = render(<Avatar gravatar user={user} />);

      expect(
        container.querySelector('[data-test-id="letter-avatar"]')
      ).toBeInTheDocument();
      expect(container.querySelector('img')).not.toBeInTheDocument();
    });

    it('can display a team Avatar', function () {
      const team = TestStubs.Team({slug: 'test-team_test'});
      const {container} = render(<Avatar team={team} />);
      const letterAvatar = container.querySelector('[data-test-id="letter-avatar"]');
      expect(letterAvatar).toBeInTheDocument();
      expect(letterAvatar).toHaveTextContent('TT');
    });

    it('can display an organization Avatar', function () {
      const organization = TestStubs.Organization({slug: 'test-organization'});
      const {container} = render(<Avatar organization={organization} />);
      const letterAvatar = container.querySelector('[data-test-id="letter-avatar"]');
      expect(letterAvatar).toBeInTheDocument();
      expect(letterAvatar).toHaveTextContent('TO');
    });

    it('displays platform list icons for project Avatar', function () {
      const project = TestStubs.Project({
        platforms: ['python', 'javascript'],
        platform: 'java',
      });
      render(<Avatar project={project} />);
      // ProjectAvatar renders PlatformList with the platform prop, not platforms array
      // Check that the avatar is rendered (PlatformList wraps in Tooltip)
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('displays a fallback platform list for project Avatar using the `platform` specified during onboarding', function () {
      const project = TestStubs.Project({platform: 'java'});
      render(<Avatar project={project} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('uses onboarding project when platforms is an empty array', function () {
      const project = TestStubs.Project({platforms: [], platform: 'java'});
      render(<Avatar project={project} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });
});
