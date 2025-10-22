import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import AwsLambdaFunctionSelect from 'app/views/integrationPipeline/awsLambdaFunctionSelect';

describe('AwsLambdaFunctionSelect', () => {
  let lambdaFunctions;
  let mockRequest;
  let consoleWarnSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    // Suppress MobX warnings in tests
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockRequest = MockApiClient.addMockResponse({
      url: '/extensions/aws_lambda/setup/',
      body: {},
    });

    lambdaFunctions = [
      {FunctionName: 'lambdaA', Runtime: 'nodejs12.x'},
      {FunctionName: 'lambdaB', Runtime: 'nodejs10.x'},
      {FunctionName: 'lambdaC', Runtime: 'nodejs10.x'},
    ];
    renderWithTheme(<AwsLambdaFunctionSelect lambdaFunctions={lambdaFunctions} />);
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
  it('choose lambdas', async () => {
    await userEvent.click(screen.getByRole('checkbox', {name: 'lambdaB'}));
    await userEvent.click(screen.getByRole('button', {name: 'Finish Setup'}));

    expect(mockRequest).toHaveBeenCalledWith(
      '/extensions/aws_lambda/setup/',
      expect.objectContaining({
        data: {lambdaA: true, lambdaB: false, lambdaC: true},
      })
    );
  });
});
