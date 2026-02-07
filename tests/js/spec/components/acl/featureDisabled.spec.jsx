import React from 'react';
import userEvent from '@testing-library/user-event';

import {render, screen} from 'sentry-test/reactTestingLibrary';

import FeatureDisabled from 'app/components/acl/featureDisabled';
import {PanelAlert} from 'app/components/panels';

describe('FeatureDisabled', function () {
  it('renders', function () {
    render(
      <FeatureDisabled
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    expect(screen.getByText(/This feature is not enabled on your Sentry installation/)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Help/})).toBeInTheDocument();
  });

  it('renders with custom message', function () {
    const customMessage = 'custom message';
    render(
      <FeatureDisabled
        message={customMessage}
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders as an Alert', function () {
    render(
      <FeatureDisabled
        alert
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    // Alert renders with a ref-warning class
    expect(document.querySelector('.ref-warning')).toBeInTheDocument();
  });

  it('renders with custom alert component', function () {
    render(
      <FeatureDisabled
        alert={PanelAlert}
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    // PanelAlert renders with a ref-warning class (inherits from Alert)
    expect(document.querySelector('.ref-warning')).toBeInTheDocument();
  });

  it('displays instructions when help is clicked', async function () {
    render(
      <FeatureDisabled
        alert
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    const helpButton = screen.getByRole('button', {name: /Help/});
    await userEvent.click(helpButton);

    expect(screen.getByText(/Enable this feature on your sentry installation/)).toBeInTheDocument();
  });
});
