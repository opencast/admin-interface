import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import ReactDOM from "react-dom";
import { useHotkeys } from "react-hotkeys-hook";
import { availableHotkeys } from "../../../configs/hotkeysConfig";
import { useTranslation } from "react-i18next";
import ButtonLikeAnchor from "../ButtonLikeAnchor";
import { FocusTrap } from "focus-trap-react";
import { LuX } from "react-icons/lu";

export type ModalProps = {
  open?: boolean;
  // Having this return false will prevent the modal from closing
  closeCallback?: () => boolean;
  /** If true, the first element in the modal automatically be focused. If false,
   * no element is initially focused */
  initialFocus?: false | string;
  header: string;
  classId: string;
  className?: string;
};

export type ModalHandle = {
  open: () => void;
  close?: () => void;
  isOpen?: () => boolean;
};

export const Modal = forwardRef<ModalHandle, PropsWithChildren<ModalProps>>(
  (
    { open = false, closeCallback, header, classId, className, children },
    ref,
  ) => {
    const { t } = useTranslation();

    const [isOpen, setOpen] = useState(open);
    const close = useCallback(() => {
      if (closeCallback !== undefined && !closeCallback()) {
        // Don't close modal
        return;
      }
      setOpen(false);
    }, [closeCallback]);

    useImperativeHandle(
      ref,
      () => ({
        isOpen: () => isOpen,
        open: () => setOpen(true),
        close,
      }),
      [close, isOpen],
    );

    useHotkeys(
      availableHotkeys.general.CLOSE_MODAL.sequence,
      close,
      {
        description:
          t(availableHotkeys.general.CLOSE_MODAL.description) ?? undefined,
      },
      [ref],
    );

	return ReactDOM.createPortal(
		isOpen &&
			<FocusTrap>
				<div>
					<div className="modal-animation modal-overlay" />
					<section
						id={classId}
						className={className ? className : "modal wizard modal-animation"}
					>
						<header>
							<ButtonLikeAnchor
								className="close-modal"
								onClick={close}
								tabIndex={0}
							>
								<LuX />
							</ButtonLikeAnchor>
							<h2>
								{header}
							</h2>
						</header>

							{children}
					</section>
				</div>
			</FocusTrap>,
		document.body,
	);

});
