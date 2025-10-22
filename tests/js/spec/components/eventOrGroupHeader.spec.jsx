import React from 'react';

import {initializeOrg} from 'sentry-test/initializeOrg';
import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import EventOrGroupHeader from 'app/components/eventOrGroupHeader';

const data = {
  metadata: {
    type: 'metadata type',
    directive: 'metadata directive',
    uri: 'metadata uri',
    value: 'metadata value',
    message: 'metadata message',
  },
  culprit: 'culprit',
};

describe('EventOrGroupHeader', function () {
  const {organization, router, routerContext: _routerContext} = initializeOrg({
    router: {orgId: 'orgId'},
  });

  describe('Group', function () {
    const groupData = {
      ...data,
      level: 'error',
      id: 'id',
    };

    it('renders with `type = error`', function () {
      renderWithTheme(
        <EventOrGroupHeader
          organization={organization}
          router={router}
          params={{orgId: 'orgId'}}
          location={router.location}
          data={{
            ...groupData,
            type: 'error',
          }}
        />
      );

      expect(screen.getByText('metadata value')).toBeInTheDocument();
    });

    it('renders with `type = csp`', function () {
      renderWithTheme(
        <EventOrGroupHeader
          organization={organization}
          router={router}
          params={{orgId: 'orgId'}}
          location={router.location}
          data={{
            ...groupData,
            ...{
              type: 'csp',
            },
          }}
        />
      );

      expect(screen.getByText('metadata directive')).toBeInTheDocument();
    });

    it('renders with `type = default`', function () {
      renderWithTheme(
        <EventOrGroupHeader
          organization={organization}
          router={router}
          params={{orgId: 'orgId'}}
          location={router.location}
          data={{
            ...groupData,
            type: 'default',
            metadata: {
              ...groupData.metadata,
              title: 'metadata title',
            },
          }}
        />
      );

      expect(screen.getByText('metadata title')).toBeInTheDocument();
    });

    it('renders metadata values in message for error events', function () {
      renderWithTheme(
        <EventOrGroupHeader
          organization={organization}
          router={router}
          params={{orgId: 'orgId'}}
          location={router.location}
          data={{
            ...groupData,
            type: 'error',
          }}
        />
      );
      expect(screen.getByText('metadata value')).toBeInTheDocument();
    });

    it('renders location', function () {
      renderWithTheme(
        <EventOrGroupHeader
          organization={organization}
          router={router}
          params={{orgId: 'orgId'}}
          location={router.location}
          data={{
            metadata: {
              filename: 'path/to/file.swift',
            },
            platform: 'swift',
            type: 'error',
          }}
        />
      );
      expect(screen.getByText(/in/)).toBeInTheDocument();
      expect(screen.getByText('path/to/file.swift')).toBeInTheDocument();
    });
  });

  describe('Event', function () {
    const eventData = {
      ...data,
      id: 'id',
      eventID: 'eventID',
      groupID: 'groupID',
      culprit: undefined,
    };

    it('renders with `type = error`', function () {
      renderWithTheme(
        <EventOrGroupHeader
          organization={organization}
          router={router}
          params={{orgId: 'orgId'}}
          location={router.location}
          data={{
            ...eventData,
            type: 'error',
          }}
        />
      );

      expect(screen.getByText('metadata value')).toBeInTheDocument();
    });

    it('renders with `type = csp`', function () {
      renderWithTheme(
        <EventOrGroupHeader
          organization={organization}
          router={router}
          params={{orgId: 'orgId'}}
          location={router.location}
          data={{
            ...eventData,
            type: 'csp',
          }}
        />
      );

      expect(screen.getByText('metadata directive')).toBeInTheDocument();
    });

    it('renders with `type = default`', function () {
      renderWithTheme(
        <EventOrGroupHeader
          organization={organization}
          router={router}
          params={{orgId: 'orgId'}}
          location={router.location}
          data={{
            ...eventData,
            type: 'default',
            metadata: {
              ...eventData.metadata,
              title: 'metadata title',
            },
          }}
        />
      );

      expect(screen.getByText('metadata title')).toBeInTheDocument();
    });

    it('hides level tag', function () {
      renderWithTheme(
        <EventOrGroupHeader
          organization={organization}
          router={router}
          params={{orgId: 'orgId'}}
          location={router.location}
          projectId="projectId"
          hideLevel
          data={{
            ...eventData,
            type: 'default',
            metadata: {
              ...eventData.metadata,
              title: 'metadata title',
            },
          }}
        />
      );

      expect(screen.getByText('metadata title')).toBeInTheDocument();
    });

    it('keeps sort in link when query has sort', function () {
      renderWithTheme(
        <EventOrGroupHeader
          organization={organization}
          data={{
            ...eventData,
            type: 'default',
          }}
          {...router}
          location={{
            ...router.location,
            query: {
              ...router.location.query,
              sort: 'freq',
            },
          }}
        />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', expect.stringContaining('sort=freq'));
      expect(link).toHaveAttribute('href', expect.stringContaining('_allp=1'));
    });

    it('lack of project adds allp parameter', function () {
      const query = {};

      const {container} = renderWithTheme(
        <EventOrGroupHeader
          organization={organization}
          router={router}
          params={{orgId: 'orgId'}}
          location={{...router.location, query}}
          data={{
            ...eventData,
            type: 'default',
          }}
        />
      );

      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', expect.stringContaining('_allp=1'));
    });
  });
});
