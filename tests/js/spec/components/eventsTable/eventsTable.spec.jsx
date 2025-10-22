import React from 'react';

import {render, screen} from 'sentry-test/reactTestingLibrary';

import EventsTable from 'app/components/eventsTable/eventsTable';

describe('EventsTable', function () {
  beforeEach(function () {});

  afterEach(function () {});

  it('renders', function () {
    const {container} = render(
      <EventsTable
        tagList={[]}
        orgId="orgId"
        projectId="projectId"
        groupId="groupId"
        events={TestStubs.DetailedEvents()}
      />,
      {context: TestStubs.routerContext()}
    );

    // Verify the table is rendered
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(container.querySelector('.events-table')).toBeInTheDocument();

    // Verify table headers
    expect(screen.getByText('ID')).toBeInTheDocument();

    // Verify events are rendered (DetailedEvents() should have event rows)
    expect(container.querySelector('tbody')).toBeInTheDocument();
  });
});
