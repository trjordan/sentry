import React from 'react';

import {renderWithTheme, screen, waitFor} from 'sentry-test/reactTestingLibrary';

import DiffModal from 'app/components/modals/diffModal';

describe('DiffModal', function () {
  const modalRenderProps = {
    Body: p => p.children,
    Header: p => p.children,
    Footer: p => p.children,
    closeModal: jest.fn(),
  };

  beforeEach(function () {
    MockApiClient.clearMockResponses();
    
    // Mock API responses for IssueDiff component
    MockApiClient.addMockResponse({
      url: '/issues/123/events/latest/',
      body: {
        eventID: 'event123',
      },
    });
    MockApiClient.addMockResponse({
      url: '/issues/234/events/latest/',
      body: {
        eventID: 'event234',
      },
    });
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('renders', async function () {
    const project = TestStubs.ProjectDetails();

    MockApiClient.addMockResponse({
      url: `/projects/123/${project.slug}/events/event123/`,
      body: {
        entries: [{type: 'exception', data: {values: []}}],
      },
    });

    MockApiClient.addMockResponse({
      url: `/projects/123/${project.slug}/events/event234/`,
      body: {
        entries: [{type: 'exception', data: {values: []}}],
      },
    });

    const {container} = renderWithTheme(
      <DiffModal
        orgId="123"
        baseIssueId="123"
        targetIssueId="234"
        project={project}
        Body={({children}) => <div>{children}</div>}
      />
    );

    // Initially shows loading indicator
    expect(container.querySelector('.loading-indicator')).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(container.querySelector('.loading-indicator')).not.toBeInTheDocument();
    });
  });
});
