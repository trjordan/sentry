import React from 'react';
import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import GlobalModal from 'app/components/globalModal';

export async function mountGlobalModal(context) {
  const {container} = renderWithTheme(<GlobalModal />, context);
  await waitFor(() => {
    expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
  });

  return {
    container,
  };
}
