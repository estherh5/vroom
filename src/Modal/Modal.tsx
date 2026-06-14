import { useEffect, useRef } from "react";
import "./Modal.css";

import type { ServerStatus } from "../types";

interface Props {
  display: boolean;
  message: string | null;
  status: ServerStatus | null;
  onCloseModal: () => void;
}

// Modal that displays a message to the user.
export default function Modal({ display, message, status, onCloseModal }: Props) {
  const nodeRef = useRef<HTMLDivElement>(null);

  // While displayed, close the modal on any click outside of it (clicks
  // inside the modal, except the close button, are ignored).
  useEffect(() => {
    if (!display) {
      return;
    }

    const closeModal = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        nodeRef.current?.contains(target) &&
        !target.classList.contains("close-button")
      ) {
        return;
      }
      onCloseModal();
    };

    document.addEventListener("click", closeModal, false);
    return () => document.removeEventListener("click", closeModal, false);
  }, [display, onCloseModal]);

  return (
    <div className={"modal-container" + (display ? "" : " hidden")}>
      <div className="modal d-flex flex-column" ref={nodeRef}>
        <button className="close-button" onClick={onCloseModal}>
          X
        </button>

        <div className="modal-body d-flex align-items-center justify-content-center">
          <div className={status ?? undefined}>
            <i
              className={
                "far " +
                (status === "fail" ? "fa-times-circle" : "fa-check-circle") +
                " modal-icon"
              }
            ></i>

            <div className="modal-message">{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
