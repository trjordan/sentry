import React from 'react';

import {render, screen, within} from 'sentry-test/reactTestingLibrary';

import GlobalModal from 'app/components/globalModal';

/**
 * Renders the GlobalModal component using React Testing Library.
 * Returns the RTL render result.
 */
export async function renderGlobalModal(options) {
  const result = render(<GlobalModal />, options);
  await tick();

  return result;
}

/**
 * @deprecated Use renderGlobalModal instead. This alias exists for backward
 * compatibility during the Enzyme to RTL migration.
 */
export const mountGlobalModal = renderGlobalModal;

/**
 * Helper to get the modal dialog element when it's visible.
 */
export function getGlobalModal() {
  return screen.getByRole('dialog');
}

/**
 * Helper to query within the modal.
 */
export function withinGlobalModal() {
  return within(screen.getByRole('dialog'));
}
