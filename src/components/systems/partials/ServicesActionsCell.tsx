import { loadServicesIntoTable } from "../../../thunks/tableThunks";
import { useAppDispatch } from "../../../store";
import { Service, fetchServices, restartService } from "../../../slices/serviceSlice";
import ButtonLikeAnchor from "../../shared/ButtonLikeAnchor";
import { LuRotateCcw } from "react-icons/lu";

/**
 * This component renders the action cells of services in the table view
 */
const ServicesActionCell = ({
	row,
}: {
	row: Service
}) => {
	const dispatch = useAppDispatch();

	const onClickRestart = async () => {
		restartService({ host: row.hostname, serviceType: row.name });
		await dispatch(fetchServices());
		dispatch(loadServicesIntoTable());
	};

	return (
		row.status !== "SYSTEMS.SERVICES.STATUS.NORMAL" ? (
			<ButtonLikeAnchor
				onClick={() => onClickRestart()}
				className={"action-cell-button"}
				editAccessRole={"ROLE_UI_SERVICES_STATUS_EDIT"}
				// tooltipText={"SYSTEMS.SERVICES.TABLE.SANITIZE"} // Disabled due to performance concerns
			>
				<LuRotateCcw className="darkgrey"/>
			</ButtonLikeAnchor>
		) : <></>
	);
};

export default ServicesActionCell;
