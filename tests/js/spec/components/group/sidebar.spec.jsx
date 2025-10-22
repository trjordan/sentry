import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import GroupSidebar from 'app/components/group/sidebar';

describe('GroupSidebar', function () {
  let group = TestStubs.Group({tags: TestStubs.Tags()});
  const organization = TestStubs.Organization();
  const project = TestStubs.Project();
  const environment = {name: 'production', displayName: 'Production', id: '1'};
  let tagsMock;

  const routerContext = TestStubs.routerContext([
    {
      organization,
    },
  ]);

  beforeEach(function () {
    MockApiClient.addMockResponse({
      url: '/projects/org-slug/project-slug/events/1/committers/',
      body: {committers: []},
    });

    MockApiClient.addMockResponse({
      url: '/projects/org-slug/project-slug/events/1/owners/',
      body: {
        owners: [],
        rules: [],
      },
    });

    MockApiClient.addMockResponse({
      url: '/groups/1/integrations/',
      body: [],
    });

    MockApiClient.addMockResponse({
      url: '/issues/1/participants/',
      body: [],
    });

    MockApiClient.addMockResponse({
      url: '/issues/1/',
      body: group,
    });

    MockApiClient.addMockResponse({
      url: '/issues/1/current-release/',
      body: {},
    });

    MockApiClient.addMockResponse({
      url: '/groups/1/external-issues/',
      body: [],
    });

    tagsMock = MockApiClient.addMockResponse({
      url: '/issues/1/tags/',
      body: TestStubs.Tags(),
    });
  });

  afterEach(function () {
    MockApiClient.clearMockResponses();
  });

  describe('sidebar', function () {
    it('should make a request to the /tags/ endpoint to get top values', function () {
      renderWithTheme(
        <GroupSidebar
          group={group}
          project={project}
          organization={organization}
          event={TestStubs.Event()}
          environments={[environment]}
        />,
        {context: routerContext[0]}
      );
      expect(tagsMock).toHaveBeenCalled();
    });
  });

  describe('renders with tags', function () {
    it('renders', async function () {
      const {container} = renderWithTheme(
        <GroupSidebar
          group={group}
          project={project}
          organization={organization}
          event={TestStubs.Event()}
          environments={[environment]}
        />,
        {context: routerContext[0]}
      );

      // Wait for async data to load - wait for a consistent element to appear
      await screen.findByText('Production');

      // Check for tag distribution meters
      expect(
        container.querySelectorAll('[data-test-id="group-tag-distribution-meter"]')
      ).toHaveLength(5);
    });
  });

  describe('renders without tags', function () {
    beforeEach(function () {
      group = TestStubs.Group();

      MockApiClient.addMockResponse({
        url: '/issues/1/',
        body: group,
      });
      MockApiClient.addMockResponse({
        url: '/issues/1/tags/',
        body: [],
      });
    });

    it('renders no tags', async function () {
      const {container} = renderWithTheme(
        <GroupSidebar
          group={group}
          organization={organization}
          project={project}
          event={TestStubs.Event()}
          environments={[environment]}
        />,
        {context: routerContext[0]}
      );

      // Wait for component to load - use text instead of testid
      await screen.findByText('No tags found in the selected environments');

      expect(
        container.querySelectorAll('[data-test-id="group-tag-distribution-meter"]')
      ).toHaveLength(0);
    });

    it('renders empty text', async function () {
      renderWithTheme(
        <GroupSidebar
          group={group}
          organization={organization}
          project={project}
          event={TestStubs.Event()}
          environments={[environment]}
        />,
        {context: routerContext[0]}
      );

      const noTagsElement = await screen.findByText(
        'No tags found in the selected environments'
      );
      expect(noTagsElement).toBeInTheDocument();
    });
  });

  describe('environment toggle', function () {
    it('re-requests tags with correct environment', async function () {
      const stagingEnv = {name: 'staging', displayName: 'Staging', id: '2'};

      const {rerender} = renderWithTheme(
        <GroupSidebar
          group={group}
          project={project}
          organization={organization}
          event={TestStubs.Event()}
          environments={[environment]}
        />,
        {context: routerContext[0]}
      );

      expect(tagsMock).toHaveBeenCalledTimes(1);

      rerender(
        <GroupSidebar
          group={group}
          project={project}
          organization={organization}
          event={TestStubs.Event()}
          environments={[stagingEnv]}
        />
      );

      expect(tagsMock).toHaveBeenCalledTimes(2);
      expect(tagsMock).toHaveBeenCalledWith(
        '/issues/1/tags/',
        expect.objectContaining({
          query: expect.objectContaining({
            environment: ['staging'],
          }),
        })
      );
    });
  });
});
