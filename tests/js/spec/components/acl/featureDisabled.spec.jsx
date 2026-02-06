import React from 'react';

import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FeatureDisabled from 'app/components/acl/featureDisabled';
import {PanelAlert} from 'app/components/panels';

describe('FeatureDisabled', function () {
  const routerContext = TestStubs.routerContext();

  it('renders', function () {
    render(
      <FeatureDisabled
        features={['organization:my-features']}
        featureName="Some Feature"
      />,
      {context: routerContext}
    );

    expect(
      screen.getByText(/This feature is not enabled on your Sentry installation\./)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Help/i})).toBeInTheDocument();
  });

  it('renders with custom message', function () {
    const customMessage = 'custom message';
    render(
      <FeatureDisabled
        message={customMessage}
        features={['organization:my-features']}
        featureName="Some Feature"
      />,
      {context: routerContext}
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders as an Alert', function () {
    render(
      <FeatureDisabled
        alert
        features={['organization:my-features']}
        featureName="Some Feature"
      />,
      {context: routerContext}
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders with custom alert component', function () {
    render(
      <FeatureDisabled
        alert={PanelAlert}
        features={['organization:my-features']}
        featureName="Some Feature"
      />,
      {context: routerContext}
    );

    // PanelAlert renders with role="alert"
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays instructions when help is clicked', async function () {
    render(
      <FeatureDisabled
        alert
        features={['organization:my-features']}
        featureName="Some Feature"
      />,
      {context: routerContext}
    );

    await userEvent.click(screen.getByRole('button', {name: /Help/i}));

    expect(screen.getByText(/Enable this feature on your sentry installation/)).toBeInTheDocument();
  });
});
