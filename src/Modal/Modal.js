import React, { Component } from 'react';
import './Modal.css';


// Modal that displays message to user
class Modal extends Component {
  constructor(props) {
    super(props);

    this.closeModal = this.closeModal.bind(this);
  }

  /* Add event listener that detects clicks outside of modal to close it if
  component gets updated to display modal */
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.display !== this.props.display) {
      document.addEventListener('click', this.closeModal, false);

      return true;
    }

    return false;
  }

  // Hide modal when user clicks close button
  closeModal(e) {
    // Do nothing if user clicks in modal (and not on close button)
    if (this.node.contains(e.target) &&
      !e.target.classList.contains('close-button')) {
        return;
    }

    // Remove event listener that detects clicks outside of modal to close it
    document.removeEventListener('click', this.closeModal, false);

    return this.props.onCloseModal();
  }

  render() {
    return (
      <div
        className={'modal-container' + (this.props.display ? '' : ' hidden')}>

          <div
            className="modal d-flex flex-column"
            ref={node => this.node = node}>

              <button
                className="close-button"
                onClick={this.closeModal}>X</button>

              <div className={'modal-body d-flex align-items-center ' +
                'justify-content-center'}>

                  <div className={this.props.status}>

                    <i className={'far ' +
                      (this.props.status === 'fail' ? 'fa-times-circle' :
                      'fa-check-circle') + ' modal-icon'}>
                    </i>

                    <div className="modal-message">
                      {this.props.message}
                    </div>

                  </div>
              </div>

          </div>

      </div>
    );
  }
}

export default Modal;
