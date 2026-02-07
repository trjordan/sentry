import React from 'react';

import {mountWithTheme} from 'sentry-test/enzyme';

import FeatureDisabled from 'app/components/acl/featureDisabled';
import {PanelAlert} from 'app/components/panels';

describe('FeatureDisabled', function () {
  it('renders', function () {
    const wrapper = mountWithTheme(
      <FeatureDisabled
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    expect(wrapper.text()).toMatch(/This feature is not enabled on your Sentry installation/);
    expect(wrapper.find('Button').first().exists()).toBe(true);
  });

  it('renders with custom message', function () {
    const customMessage = 'custom message';
    const wrapper = mountWithTheme(
      <FeatureDisabled
        message={customMessage}
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    expect(wrapper.text()).toMatch(customMessage);
  });

  it('renders as an Alert', function () {
    const wrapper = mountWithTheme(
      <FeatureDisabled
        alert
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    // Alert renders with a ref-warning class
    expect(wrapper.find('.ref-warning').exists()).toBe(true);
  });

  it('renders with custom alert component', function () {
    const wrapper = mountWithTheme(
      <FeatureDisabled
        alert={PanelAlert}
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    // PanelAlert renders with a ref-warning class (inherits from Alert)
    expect(wrapper.find('.ref-warning').exists()).toBe(true);
  });

  it('displays instructions when help is clicked', function () {
    const wrapper = mountWithTheme(
      <FeatureDisabled
        alert
        features={['organization:my-features']}
        featureName="Some Feature"
      />
    );

    const helpButton = wrapper.find('Button').first();
    helpButton.simulate('click');

    expect(wrapper.text()).toMatch(/Enable this feature on your sentry installation/);
  });
});
