import React from 'react';

import {render, screen, fireEvent} from 'sentry-test/reactTestingLibrary';

import AwsLambdaCloudformation from 'app/views/integrationPipeline/awsLambdaCloudformation';

describe('AwsLambdaCloudformation', () => {
  let windowAssignMock;

  beforeEach(() => {
    windowAssignMock = jest.fn();
    window.location.assign = windowAssignMock;
  });

  it('submits the form with correct URL parameters', () => {
    render(
      <AwsLambdaCloudformation
        baseCloudformationUrl="https://console.aws.amazon.com/cloudformation/home#/stacks/create/review"
        templateUrl="https://example.com/cloudformation-template.json"
        stackName="Sentry-Monitoring-Stack"
        regionList={['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2']}
        accountNumber=""
        region=""
        initialStepNumber={0}
        awsExternalId="my-external-id"
      />
    );

    // Fill in the AWS Account Number field
    const accountInput = screen.getByRole('textbox', {name: /aws account number/i});
    fireEvent.change(accountInput, {target: {value: '599817902985'}});
    fireEvent.blur(accountInput);

    // Select a region using the SelectField
    // The react-select input has id="react-select-N-input", we can find it by its autocomplete attribute
    const regionSelect = document.querySelector('input[id^="react-select"][aria-autocomplete="list"]');
    fireEvent.focus(regionSelect);
    fireEvent.keyDown(regionSelect, {key: 'ArrowDown', code: 'ArrowDown'});
    fireEvent.click(screen.getByText('us-east-2'));

    // Click the Next button to submit
    fireEvent.click(screen.getByRole('button', {name: 'Next'}));

    expect(windowAssignMock).toHaveBeenCalledWith(
      expect.stringContaining('accountNumber=599817902985')
    );
    expect(windowAssignMock).toHaveBeenCalledWith(
      expect.stringContaining('region=us-east-2')
    );
    expect(windowAssignMock).toHaveBeenCalledWith(
      expect.stringContaining('awsExternalId=my-external-id')
    );
  });
});
