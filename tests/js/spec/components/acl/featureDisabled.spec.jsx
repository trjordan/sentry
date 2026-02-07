import React from 'react';

import {cache} from '@emotion/css'; // eslint-disable-line emotion/no-vanilla
import {CacheProvider, ThemeProvider} from '@emotion/react';
import {fireEvent, render, screen} from '@testing-library/react';

import FeatureDisabled from 'app/components/acl/featureDisabled';
import {PanelAlert} from 'app/components/panels';
import {lightTheme} from 'app/utils/theme';

function TestProviders({children}) {
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </CacheProvider>
  );
}

describe('FeatureDisabled', function () {
  it('renders', function () {
    render(
      <TestProviders>
        <FeatureDisabled
          features={['organization:my-features']}
          featureName="Some Feature"
        />
      </TestProviders>
    );

    expect(screen.getByText(/This feature is not enabled on your Sentry installation/)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Help/i})).toBeInTheDocument();
  });

  it('renders with custom message', function () {
    const customMessage = 'custom message';
    render(
      <TestProviders>
        <FeatureDisabled
          message={customMessage}
          features={['organization:my-features']}
          featureName="Some Feature"
        />
      </TestProviders>
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders as an Alert', function () {
    const {container} = render(
      <TestProviders>
        <FeatureDisabled
          alert
          features={['organization:my-features']}
          featureName="Some Feature"
        />
      </TestProviders>
    );

    // Alert renders with a ref-warning class
    expect(container.querySelector('.ref-warning')).toBeInTheDocument();
  });

  it('renders with custom alert component', function () {
    const {container} = render(
      <TestProviders>
        <FeatureDisabled
          alert={PanelAlert}
          features={['organization:my-features']}
          featureName="Some Feature"
        />
      </TestProviders>
    );

    // PanelAlert renders with a ref-warning class (inherits from Alert)
    expect(container.querySelector('.ref-warning')).toBeInTheDocument();
  });

  it('displays instructions when help is clicked', function () {
    render(
      <TestProviders>
        <FeatureDisabled
          alert
          features={['organization:my-features']}
          featureName="Some Feature"
        />
      </TestProviders>
    );

    const helpButton = screen.getByRole('button', {name: /Help/i});
    fireEvent.click(helpButton);

    expect(screen.getByText(/Enable this feature on your sentry installation/)).toBeInTheDocument();
  });
});
