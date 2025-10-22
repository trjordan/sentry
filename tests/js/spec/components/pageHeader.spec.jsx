import {render, screen} from 'sentry-test/reactTestingLibrary';

import PageHeading from 'app/components/pageHeading';

describe('PageHeading', function () {
  it('renders', function () {
    render(<PageHeading>New Header</PageHeading>);
    expect(screen.getByRole('heading', {name: 'New Header'})).toBeInTheDocument();
  });
});
