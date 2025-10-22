import React from 'react';
import * as qs from 'query-string';

import {
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
  fireEvent,
} from 'sentry-test/reactTestingLibrary';

import AwsLambdaCloudformation from 'app/views/integrationPipeline/awsLambdaCloudformation';

describe('AwsLambdaCloudformation', () => {
  let windowAssignMock;
  beforeEach(() => {
    windowAssignMock = jest.fn();
    window.location.assign = windowAssignMock;
    window.localStorage.setItem('AWS_EXTERNAL_ID', 'my-id');
  });
  it('submit arn', async () => {
    const {container} = renderWithTheme(
      <AwsLambdaCloudformation
        baseCloudformationUrl="https://console.aws.amazon.com/cloudformation/home#/stacks/create/review"
        templateUrl="https://example.com/file.json"
        stackName="Sentry-Monitoring-Stack"
        regionList={['us-east-1', 'us-west-1']}
        accountNumber=""
        region=""
        initialStepNumber={0}
        organization={TestStubs.Organization()}
      />
    );
    
    await userEvent.click(screen.getByRole('button', {name: "I've created the stack"}));

    await userEvent.type(
      screen.getByRole('textbox', {name: 'AWS Account Number'}),
      '599817902985'
    );

    // SelectField/react-select: querySelector finds first control which may be wrong one
    // Let's get all controls and find the one with input[name="region"]
    const regionInput = container.querySelector('input[name="region"]');
    const regionControl = regionInput?.closest('[class*="control"]');
    
    if (regionControl && regionInput) {
      // Dispatch mousedown like enzyme does
      fireEvent.mouseDown(regionControl, {target: {tagName: 'INPUT'}});
      // Also try focus directly
      fireEvent.focus(regionInput);
      
      // Give the menu time to render
      await waitFor(() => {
        return screen.queryByText('us-west-1') !== null;
      });
      
      // Click the option by text
      const usWest1Option = screen.getByText('us-west-1');
      fireEvent.click(usWest1Option);
    }

    await userEvent.click(screen.getByRole('button', {name: 'Next'}));

    // Wait for the form submission
    await waitFor(() => {
      expect(windowAssignMock).toHaveBeenCalled();
    });

    const {
      location: {origin},
    } = window;

    const query = qs.stringify({
      accountNumber: '599817902985',
      region: 'us-west-1',
      awsExternalId: 'my-id',
    });

    await waitFor(() => {
      expect(windowAssignMock).toHaveBeenCalledWith(
        `${origin}/extensions/aws_lambda/setup/?${query}`
      );
    });
  });
});
