/**
 * This component
 */
const ModalContent = ({
	modalContentChildren,
	modalContentClassName,
	children,
}: {
	modalContentChildren?: React.ReactNode
	modalContentClassName?: string
	children: React.ReactNode
}) => {


  return (
		<div className={modalContentClassName ?? "modal-content"}>
			{modalContentChildren}
			<div className="modal-body">
					{children}
			</div>
		</div>
	);
};

export default ModalContent;
