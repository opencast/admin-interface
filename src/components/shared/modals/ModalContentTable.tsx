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


  return (
		<ModalContent
			modalContentChildren={modalContentChildren}
			modalContentClassName={modalContentClassName}
		>
			{modalBodyChildren}
			<div className="full-col">
				{children}
			</div>
		</ModalContent>
	);
};

export default ModalContentTable;
