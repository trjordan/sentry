import React from 'react';

import {
  fireEvent,
  renderWithTheme,
  screen,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import {openModal} from 'app/actionCreators/modal';
import SuggestProjectCTA from 'app/components/suggestProjectCTA';
import ProjectsStore from 'app/stores/projectsStore';

jest.mock('app/actionCreators/modal');

function generateWrapperAndSetMocks(inputProps, mobileEventResp, promptResp) {
  const projects = inputProps?.projects ?? [TestStubs.Project({platform: 'javascript'})];

  jest.spyOn(ProjectsStore, 'getState').mockImplementation(() => ({
    projects,
    loading: false,
  }));

  const organization = TestStubs.Organization();

  MockApiClient.addMockResponse({
    url: `/prompts-activity/`,
    body: promptResp || {},
  });
  MockApiClient.addMockResponse({
    url: `/organizations/${organization.slug}/has-mobile-app-events/`,
    body: mobileEventResp,
  });

  const props = {
    organization,
    event: TestStubs.Event({
      entries: [{type: 'request', data: {headers: [['User-Agent', 'okhttp/123']]}}],
    }),
    ...inputProps,
  };
  return renderWithTheme(<SuggestProjectCTA {...props} />);
}

describe('SuggestProjectCTA', function () {
  it('user agent match and and open modal', async () => {
    generateWrapperAndSetMocks();

    const alert = await screen.findByText(/We have a sneaking suspicion/);
    expect(alert).toBeInTheDocument();

    const link = screen.getByText('Start Monitoring');
    fireEvent.click(link);

    expect(openModal).toHaveBeenCalled();
  });

  it('mobile event match', async () => {
    generateWrapperAndSetMocks(
      {
        event: TestStubs.Event({
          entries: [{type: 'request', data: {headers: [['User-Agent', 'sentry/123']]}}],
        }),
      },
      {browserName: 'okhttp'}
    );

    const alert = await screen.findByText(/We have a sneaking suspicion/);
    expect(alert).toBeInTheDocument();
  });

  it('user agent does not match', async () => {
    generateWrapperAndSetMocks({
      event: TestStubs.Event({
        entries: [{type: 'request', data: {headers: [['User-Agent', 'sentry/123']]}}],
      }),
    });

    await waitFor(() => {
      expect(screen.queryByText(/We have a sneaking suspicion/)).not.toBeInTheDocument();
    });
  });

  it('has mobile project', async () => {
    const projects = [TestStubs.Project({platform: 'android'})];
    generateWrapperAndSetMocks({
      projects,
    });

    await waitFor(() => {
      expect(screen.queryByText(/We have a sneaking suspicion/)).not.toBeInTheDocument();
    });
  });

  it('prompt is dismissed', async () => {
    generateWrapperAndSetMocks(undefined, undefined, {
      data: {dismissed_ts: 1234},
    });

    await waitFor(() => {
      expect(screen.queryByText(/We have a sneaking suspicion/)).not.toBeInTheDocument();
    });
  });
});
