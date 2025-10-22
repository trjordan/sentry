import React from 'react';

import {
  renderGlobalModal,
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import FeatureTourModal from 'app/components/modals/featureTourModal';

// Mock document.createRange which is used by userEvent
document.createRange = () => {
  const range = {
    setStart: jest.fn(),
    setEnd: jest.fn(),
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
    getBoundingClientRect: jest.fn(() => ({
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: 0,
      height: 0,
    })),
    getClientRects: jest.fn(() => []),
    cloneRange: jest.fn(function () {
      return this;
    }),
  };
  return range;
};

const steps = [
  {
    title: 'First',
    body: 'First step',
    image: <em data-testid="step-image">Image</em>,
    actions: (
      <a href="#" data-testid="step-action">
        additional action
      </a>
    ),
  },
  {title: 'Second', body: 'Second step'},
];

describe('FeatureTourModal', function () {
  let onAdvance, onCloseModal;

  beforeEach(function () {
    onAdvance = jest.fn();
    onCloseModal = jest.fn();
  });

  it('shows the modal on click', async function () {
    renderWithTheme(
      <FeatureTourModal steps={steps} onAdvance={onAdvance} onCloseModal={onCloseModal}>
        {({showModal}) => (
          <a href="#" onClick={showModal} data-testid="reveal">
            Open
          </a>
        )}
      </FeatureTourModal>
    );

    // No modal showing initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click to show modal
    await userEvent.click(screen.getByTestId('reveal'));

    await renderGlobalModal();

    // Modal is now showing (there are multiple dialogs, so we use getAllByRole)
    const dialogs = screen.getAllByRole('dialog');
    expect(dialogs.length).toBeGreaterThan(0);
    // The actual modal should have class "modal"
    const modal = dialogs.find(d => d.classList.contains('modal'));
    expect(modal).toBeInTheDocument();
  });

  it('advances on click', async function () {
    renderWithTheme(
      <FeatureTourModal steps={steps} onAdvance={onAdvance} onCloseModal={onCloseModal}>
        {({showModal}) => (
          <a href="#" onClick={showModal} data-testid="reveal">
            Open
          </a>
        )}
      </FeatureTourModal>
    );

    await userEvent.click(screen.getByTestId('reveal'));
    await renderGlobalModal();

    // Should start on the first step.
    expect(
      screen.getByRole('heading', {level: 4, name: steps[0].title})
    ).toBeInTheDocument();

    // Advance to the next step.
    await userEvent.click(screen.getByTestId('next-step'));

    // Should move to next step.
    expect(
      screen.getByRole('heading', {level: 4, name: steps[1].title})
    ).toBeInTheDocument();
    expect(onAdvance).toHaveBeenCalled();
  });

  it('shows step content', async function () {
    renderWithTheme(
      <FeatureTourModal steps={steps} onAdvance={onAdvance} onCloseModal={onCloseModal}>
        {({showModal}) => (
          <a href="#" onClick={showModal} data-testid="reveal">
            Open
          </a>
        )}
      </FeatureTourModal>
    );

    await userEvent.click(screen.getByTestId('reveal'));
    await renderGlobalModal();

    // Should show title, image and actions
    expect(screen.getByRole('heading', {level: 4})).toHaveTextContent(steps[0].title);
    expect(screen.getByTestId('step-image')).toBeInTheDocument();
    expect(screen.getByTestId('step-action')).toBeInTheDocument();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
  });

  it('last step shows done', async function () {
    renderWithTheme(
      <FeatureTourModal steps={steps} onAdvance={onAdvance} onCloseModal={onCloseModal}>
        {({showModal}) => (
          <a href="#" onClick={showModal} data-testid="reveal">
            Open
          </a>
        )}
      </FeatureTourModal>
    );

    await userEvent.click(screen.getByTestId('reveal'));
    await renderGlobalModal();

    // Advance to the the last step.
    await userEvent.click(screen.getByTestId('next-step'));

    // Click the done
    await userEvent.click(screen.getByTestId('complete-tour'));

    // Wait for the ModalStore action to propagate.
    await waitFor(() => {
      expect(onAdvance).toHaveBeenCalledTimes(1);
      expect(onCloseModal).toHaveBeenCalledTimes(1);
    });
  });

  it('last step shows doneText and uses doneUrl', async function () {
    const props = {doneText: 'Finished', doneUrl: 'http://example.org'};
    renderWithTheme(
      <FeatureTourModal
        steps={steps}
        onAdvance={onAdvance}
        onCloseModal={onCloseModal}
        {...props}
      >
        {({showModal}) => (
          <a href="#" onClick={showModal} data-testid="reveal">
            Open
          </a>
        )}
      </FeatureTourModal>
    );

    await userEvent.click(screen.getByTestId('reveal'));
    await renderGlobalModal();

    // Advance to the the last step.
    await userEvent.click(screen.getByTestId('next-step'));

    // Ensure button looks right
    const button = screen.getByTestId('complete-tour');
    expect(button).toHaveTextContent(props.doneText);
    expect(button).toHaveAttribute('href', props.doneUrl);

    // Click the done
    await userEvent.click(button);

    // Wait for the ModalStore action to propagate.
    await waitFor(() => {
      expect(onCloseModal).toHaveBeenCalledTimes(1);
    });
  });

  it('close button dismisses modal', async function () {
    renderWithTheme(
      <FeatureTourModal steps={steps} onAdvance={onAdvance} onCloseModal={onCloseModal}>
        {({showModal}) => (
          <a href="#" onClick={showModal} data-testid="reveal">
            Open
          </a>
        )}
      </FeatureTourModal>
    );

    await userEvent.click(screen.getByTestId('reveal'));
    await renderGlobalModal();

    // Find and click close button
    const closeButton = screen.getByRole('button', {name: ''});
    await userEvent.click(closeButton);

    // Wait for the ModalStore action to propagate.
    await waitFor(() => {
      expect(onCloseModal).toHaveBeenCalled();
    });
  });
});
