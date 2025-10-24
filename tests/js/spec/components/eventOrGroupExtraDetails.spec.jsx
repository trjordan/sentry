import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import EventOrGroupExtraDetails from 'app/components/eventOrGroupExtraDetails';

import {initializeOrg} from '../../sentry-test/initializeOrg';

describe('EventOrGroupExtraDetails', function () {
  const {organization, router, routerContext} = initializeOrg();

  it('renders last and first seen', function () {
    const {container} = renderWithTheme(
      <EventOrGroupExtraDetails
        organization={organization}
        router={router}
        params={{orgId: organization.slug}}
        data={{
          orgId: 'orgId',
          projectId: 'projectId',
          groupId: 'groupId',
          lastSeen: '2017-07-25T22:56:12Z',
          firstSeen: '2017-07-01T02:06:02Z',
        }}
      />,
      {context: routerContext.context}
    );

    expect(container).toMatchSnapshot();
  });

  it('renders only first seen', function () {
    const {container} = renderWithTheme(
      <EventOrGroupExtraDetails
        organization={organization}
        router={router}
        params={{orgId: organization.slug}}
        data={{
          orgId: 'orgId',
          projectId: 'projectId',
          groupId: 'groupId',
          firstSeen: '2017-07-01T02:06:02Z',
        }}
      />,
      {context: routerContext.context}
    );

    expect(container).toMatchSnapshot();
  });

  it('renders only last seen', function () {
    const {container} = renderWithTheme(
      <EventOrGroupExtraDetails
        organization={organization}
        router={router}
        params={{orgId: organization.slug}}
        data={{
          orgId: 'orgId',
          projectId: 'projectId',
          groupId: 'groupId',
          lastSeen: '2017-07-25T22:56:12Z',
        }}
      />,
      {context: routerContext.context}
    );

    expect(container).toMatchSnapshot();
  });

  it('renders all details', function () {
    const {container} = renderWithTheme(
      <EventOrGroupExtraDetails
        organization={organization}
        router={router}
        params={{orgId: organization.slug}}
        data={{
          orgId: 'orgId',
          projectId: 'projectId',
          groupId: 'groupId',
          lastSeen: '2017-07-25T22:56:12Z',
          firstSeen: '2017-07-01T02:06:02Z',
          numComments: 14,
          shortId: 'shortId',
          logger: 'javascript logger',
          annotations: ['annotation1', 'annotation2'],
          assignedTo: {
            name: 'Assignee Name',
          },
          status: 'resolved',
        }}
      />,
      {context: routerContext.context}
    );

    expect(container).toMatchSnapshot();
  });

  it('renders assignee and status', function () {
    const {container} = renderWithTheme(
      <EventOrGroupExtraDetails
        organization={organization}
        router={router}
        params={{orgId: organization.slug}}
        data={{
          orgId: 'orgId',
          projectId: 'projectId',
          groupId: 'groupId',
          lastSeen: '2017-07-25T22:56:12Z',
          firstSeen: '2017-07-01T02:06:02Z',
          numComments: 14,
          shortId: 'shortId',
          logger: 'javascript logger',
          annotations: ['annotation1', 'annotation2'],
          assignedTo: {
            name: 'Assignee Name',
          },
          status: 'resolved',
          showStatus: true,
        }}
        showAssignee
      />,
      {context: routerContext.context}
    );

    expect(container).toMatchSnapshot();
  });

  it('details when mentioned', function () {
    const {container} = renderWithTheme(
      <EventOrGroupExtraDetails
        organization={organization}
        router={router}
        params={{orgId: organization.slug}}
        data={{
          orgId: 'orgId',
          projectId: 'projectId',
          groupId: 'groupId',
          lastSeen: '2017-07-25T22:56:12Z',
          firstSeen: '2017-07-01T02:06:02Z',
          numComments: 14,
          shortId: 'shortId',
          logger: 'javascript logger',
          annotations: ['annotation1', 'annotation2'],
          subscriptionDetails: {reason: 'mentioned'},
        }}
      />,
      {context: routerContext.context}
    );

    expect(container).toMatchSnapshot();
  });
});
