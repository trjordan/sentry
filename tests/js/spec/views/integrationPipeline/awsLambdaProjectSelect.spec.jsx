import {render, screen, userEvent} from 'sentry-test/reactTestingLibrary';
import {selectByValue} from 'sentry-test/reactTestingLibrary';

import AwsLambdaProjectSelect from 'app/views/integrationPipeline/awsLambdaProjectSelect';

describe('AwsLambdaProjectSelect', () => {
  let projects;
  let windowAssignMock;
  beforeEach(() => {
    windowAssignMock = jest.fn();
    window.location.assign = windowAssignMock;
    projects = [
      TestStubs.Project(),
      TestStubs.Project({id: '53', name: 'My Proj', slug: 'my-proj'}),
    ];
    render(<AwsLambdaProjectSelect projects={projects} />);
  });
  it('submit project', async () => {
    await selectByValue('projectId', '53');
    await userEvent.click(screen.getByRole('button', {name: 'Next'}));

    const {
      location: {origin},
    } = window;
    expect(windowAssignMock).toHaveBeenCalledWith(
      `${origin}/extensions/aws_lambda/setup/?projectId=53`
    );
  });
});
