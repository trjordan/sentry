import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import DeployBadge from 'app/components/deployBadge';

const deploy = {
  name: '85fedddce5a61a58b160fa6b3d6a1a8451e94eb9 to prod',
  url: null,
  environment: 'production',
  dateStarted: null,
  dateFinished: '2020-05-11T18:12:00.025928Z',
  id: '6348842',
};

describe('DeployBadge', function () {
  it('renders', function () {
    const {container} = renderWithTheme(<DeployBadge deploy={deploy} />);

    expect(screen.getByText('production')).toBeInTheDocument();
    expect(
      container.querySelector('svg[data-test-id="icon-open"]')
    ).not.toBeInTheDocument();
  });

  it('renders with icon and link', function () {
    const projectId = 1;

    const {container} = renderWithTheme(
      <DeployBadge
        deploy={deploy}
        orgSlug="sentry"
        version="1.2.3"
        projectId={projectId}
      />,
      {
        context: {
          router: TestStubs.router(),
        },
      }
    );

    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      '/organizations/sentry/issues/?project=1&environment=production&query=release%3A1.2.3'
    );
    expect(screen.getByText('production')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
