import React from 'react';

import {initializeOrg} from 'sentry-test/initializeOrg';
import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import GroupReleaseStats from 'app/components/group/releaseStats';
import ConfigStore from 'app/stores/configStore';

describe('GroupReleaseStats', function () {
  const {organization, project, routerContext} = initializeOrg();

  beforeAll(function () {
    // Set timezone for snapshot
    ConfigStore.loadInitialData({
      user: {
        options: {
          timezone: 'America/Los_Angeles',
        },
      },
    });
  });

  const createWrapper = props =>
    renderWithTheme(
      <GroupReleaseStats
        group={TestStubs.Group()}
        project={project}
        organization={organization}
        allEnvironments={TestStubs.Group()}
        environments={[]}
        {...props}
      />,
      {context: routerContext[0]}
    );

  it('renders all environments', function () {
    const {container} = createWrapper();
    expect(screen.getByTestId('env-label')).toHaveTextContent('All Environments');
    expect(
      container.querySelectorAll('[data-test-id="group-release-chart"]')
    ).toHaveLength(2);
    expect(container.querySelectorAll('[data-test-id="seen-info"]')).toHaveLength(2);
  });

  it('renders specific environments', function () {
    const {container} = createWrapper({environments: TestStubs.Environments()});
    expect(screen.getByTestId('env-label')).toHaveTextContent(
      'Production, Staging, STAGING'
    );
    expect(
      container.querySelectorAll('[data-test-id="group-release-chart"]')
    ).toHaveLength(2);
    expect(container.querySelectorAll('[data-test-id="seen-info"]')).toHaveLength(2);
  });
});
