import React from 'react';
import pick from 'lodash/pick';

import {fireEvent, renderWithTheme, screen, tick} from 'sentry-test/reactTestingLibrary';

import IntegrationOrganizationLink from 'app/views/integrationOrganizationLink';

describe('IntegrationOrganizationLink', () => {
  let getOrgsMock, getOrgMock, getProviderMock, org1, org1Lite, org2, org2Lite;
  beforeEach(() => {
    MockApiClient.clearMockResponses();
    org1 = TestStubs.Organization({
      slug: 'org1',
      name: 'Organization 1',
    });

    org2 = TestStubs.Organization({
      slug: 'org2',
      name: 'Organization 2',
    });

    org1Lite = pick(org1, ['slug', 'name', 'id']);
    org2Lite = pick(org2, ['slug', 'name', 'id']);

    getOrgsMock = MockApiClient.addMockResponse({
      url: '/organizations/',
      body: [org1Lite, org2Lite],
    });
  });

  it('selecting org from dropdown loads the org through the API', async () => {
    getOrgMock = MockApiClient.addMockResponse({
      url: `/organizations/${org2.slug}/`,
      body: org2,
    });

    getProviderMock = MockApiClient.addMockResponse({
      url: `/organizations/${org2.slug}/config/integrations/?provider_key=vercel`,
      body: {providers: [TestStubs.VercelProvider()]},
    });

    const routerContext = TestStubs.routerContext();
    const {container} = renderWithTheme(
      <IntegrationOrganizationLink params={{integrationSlug: 'vercel'}} />,
      {context: routerContext.context}
    );

    expect(getOrgsMock).toHaveBeenCalled();
    expect(getOrgMock).not.toHaveBeenCalled();

    await tick();

    // Find the Control div that wraps the input
    const control = container.querySelector('[class*="control"]');
    if (control) {
      // Trigger the react-select mouseDown event to open the menu
      fireEvent.mouseDown(control, {target: {tagName: 'INPUT'}});
    }
    // Focus the input to fully open the menu
    const input = container.querySelector('input');
    if (input) {
      fireEvent.focus(input);
    }

    // Wait a tick for the menu to render
    await tick();

    // Find and click the org2 option
    const org2Option = screen.getByText(org2.name);
    fireEvent.click(org2Option);

    await tick();

    expect(getProviderMock).toHaveBeenCalled();
    expect(getOrgMock).toHaveBeenCalled();
  });
});
