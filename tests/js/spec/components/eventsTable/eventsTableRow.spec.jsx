import React from 'react';

import {render, screen} from 'sentry-test/reactTestingLibrary';

import {EventsTableRow} from 'app/components/eventsTable/eventsTableRow';

describe('EventsTableRow', function () {
  it('renders', function () {
    render(
      <table>
        <tbody>
          <EventsTableRow
            organization={TestStubs.Organization()}
            tagList={[]}
            {...{orgId: 'orgId', projectId: 'projectId', groupId: 'groupId'}}
            event={TestStubs.DetailedEvents()[0]}
          />
        </tbody>
      </table>,
      {context: TestStubs.routerContext()}
    );

    // Verify the table row renders
    expect(screen.getByRole('row')).toBeInTheDocument();
  });
});
