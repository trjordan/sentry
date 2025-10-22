import React from 'react';

import {
  fireEvent,
  renderWithTheme,
  screen,
  tick,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import {closeModal, openModal} from 'app/actionCreators/modal';
import GlobalModal from 'app/components/globalModal';

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

describe('GlobalModal', function () {
  it('renders', function () {
    const {unmount} = renderWithTheme(<GlobalModal />);
    unmount();
  });

  it('uses actionCreators to open and close Modal', async function () {
    renderWithTheme(<GlobalModal />);

    openModal(() => <div id="modal-test">Hi</div>);

    await tick();

    const dialogs = await screen.findAllByRole('dialog');
    const modal = dialogs.find(d => d.classList.contains('modal'));
    expect(modal).toBeInTheDocument();
    expect(screen.getByText('Hi')).toBeInTheDocument();

    closeModal();
    await tick();

    // Modal should be removed from DOM after closing
    await waitFor(() => {
      const updatedDialogs = screen.queryAllByRole('dialog');
      const updatedModal = updatedDialogs.find(d => d.classList.contains('modal'));
      expect(updatedModal).toBeUndefined();
    });
  });

  it('calls onClose handler when modal is clicked out of', async function () {
    renderWithTheme(<GlobalModal />);
    const closeSpy = jest.fn();

    openModal(
      ({Header}) => (
        <div id="modal-test">
          <Header closeButton>Header</Header>Hi
        </div>
      ),
      {onClose: closeSpy}
    );

    await tick();

    // Find close button within the modal - react-bootstrap's close button is a button with class 'close'
    const dialogs = await screen.findAllByRole('dialog');
    const modal = dialogs.find(d => d.classList.contains('modal'));
    const closeButton = modal.querySelector('button.close');

    // Use fireEvent instead of userEvent for the close button
    if (closeButton) {
      fireEvent.click(closeButton);
      await tick();
      expect(closeSpy).toHaveBeenCalled();
    } else {
      throw new Error('Close button not found');
    }
  });

  it('calls onClose handler when closeModal prop is called', async function () {
    renderWithTheme(<GlobalModal />);
    const closeSpy = jest.fn();

    openModal(({closeModal: cm}) => <button onClick={cm}>Close</button>, {
      onClose: closeSpy,
    });

    await tick();

    const button = await screen.findByRole('button', {name: 'Close'});
    await userEvent.click(button);

    await tick();

    expect(closeSpy).toHaveBeenCalled();
  });
});
