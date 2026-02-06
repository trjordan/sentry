import React from 'react';

import {fireEvent, render, screen, waitFor} from 'sentry-test/reactTestingLibrary';

import ApiApplications from 'app/views/settings/account/apiApplications';

describe('ApiApplications', function () {
  const routerContext = TestStubs.routerContext();

  beforeEach(function () {
    MockApiClient.clearMockResponses();
  });

  it('renders empty', async function () {
    MockApiClient.addMockResponse({
      url: '/api-applications/',
      body: [],
    });

    render(<ApiApplications />, {context: routerContext});

    await waitFor(() => {
      expect(
        screen.getByText("You haven't created any applications yet.")
      ).toBeInTheDocument();
    });
  });

  it('renders', async function () {
    MockApiClient.addMockResponse({
      url: '/api-applications/',
      body: [TestStubs.ApiApplication()],
    });

    const {container} = render(<ApiApplications />, {context: routerContext});

    // Wait for the application to load
    await waitFor(() => {
      expect(screen.getByText('Test API Application')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('creates application', async function () {
    MockApiClient.addMockResponse({
      url: '/api-applications/',
      body: [],
    });

    const createMock = MockApiClient.addMockResponse({
      url: '/api-applications/',
      method: 'POST',
      body: TestStubs.ApiApplication({
        id: '234',
      }),
    });

    render(<ApiApplications />, {context: routerContext});

    // Wait for initial render
    await waitFor(() => {
      expect(
        screen.getByText("You haven't created any applications yet.")
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', {name: /Create New Application/}));

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledWith(
        '/api-applications/',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('deletes application', async function () {
    MockApiClient.addMockResponse({
      url: '/api-applications/',
      body: [TestStubs.ApiApplication({id: '123'})],
    });

    const deleteMock = MockApiClient.addMockResponse({
      url: '/api-applications/123/',
      method: 'DELETE',
      body: {},
    });

    render(<ApiApplications />, {context: routerContext});

    // Wait for application to load
    await waitFor(() => {
      expect(screen.getByText('Test API Application')).toBeInTheDocument();
    });

    // Find and click the Remove button
    fireEvent.click(screen.getByRole('button', {name: 'Remove'}));

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalledWith(
        '/api-applications/123/',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});
