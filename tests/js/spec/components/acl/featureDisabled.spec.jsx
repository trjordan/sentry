import React from 'react';

import {render, screen} from 'sentry-test/reactTestingLibrary';
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
      screen.getByText(/This feature is not enabled on your Sentry installation./)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Help'})).toBeInTheDocument();
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
    const {container} = render(
      <FeatureDisabled
        alert
        features={['organization:my-features']}
        featureName="Some Feature"
      />,
      {context: routerContext}
    );

    // Alert component adds ref-{type} class, in this case ref-warning
    expect(container.querySelector('.ref-warning')).toBeInTheDocument();
  });

  it('renders with custom alert component', function () {
    const {container} = render(
      <FeatureDisabled
        alert={PanelAlert}
        features={['organization:my-features']}
        featureName="Some Feature"
      />,
      {context: routerContext}
    );

    // PanelAlert also renders with ref-warning class
    expect(container.querySelector('.ref-warning')).toBeInTheDocument();
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

    await userEvent.click(screen.getByRole('button', {name: 'Help'}));

    expect(screen.getByText(/Enable this feature on your sentry installation/)).toBeInTheDocument();
  });
});
