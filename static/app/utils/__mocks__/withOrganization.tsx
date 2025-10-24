import React from 'react';

import SentryTypes from 'app/sentryTypes';

declare const TestStubs;

const withOrganizationMock = WrappedComponent =>
  class WithOrganizationMockWrapper extends React.Component {
    static contextTypes = {
      organization: SentryTypes.Organization,
    };
    render() {
      return (
        <WrappedComponent
          organization={this.props.organization || this.context.organization}
          {...this.props}
        />
      );
    }
  };

const isLightweightOrganization = () => {};

export default withOrganizationMock;
export {isLightweightOrganization};
