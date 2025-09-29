import { useRef } from "react";
import ModalContent from "./ModalContent";

/**
 * This component
 */
const ModalContentTable = ({
	modalContentChildren,
	modalContentClassName,
	modalBodyChildren,
	children,
}: {
	modalContentChildren?: React.ReactNode
	modalContentClassName?: string
	modalBodyChildren?: React.ReactNode
	children: React.ReactNode
}) => {

	 // Store the last blurred/focused element
  	const lastFocusedRef = useRef<HTMLElement | null>(null);
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const active = document.activeElement as HTMLElement | null;
      if (event.key === "Escape") {
        if (active && event.currentTarget.contains(active)) {
          lastFocusedRef.current = active; // store the last focused element
          active.blur();
        }
      }
    };
  return (
		<ModalContent
			modalContentChildren={modalContentChildren}
			modalContentClassName={modalContentClassName}
		>
			{modalBodyChildren}
			<div className="full-col" onKeyDown={handleKeyDown}>
				{children}
			</div>
		</ModalContent>
	);
};

export default ModalContentTable;
