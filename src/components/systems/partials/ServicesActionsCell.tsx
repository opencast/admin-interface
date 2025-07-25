import { loadServicesIntoTable } from "../../../thunks/tableThunks";
import { useAppDispatch } from "../../../store";
import { Service, fetchServices, restartService } from "../../../slices/serviceSlice";
import { IconButton } from "../../shared/IconButton";

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
		await dispatch(restartService({ host: row.hostname, serviceType: row.name }));
		await dispatch(fetchServices());
		dispatch(loadServicesIntoTable());
	};

	return (
		row.status !== "SYSTEMS.SERVICES.STATUS.NORMAL" ? (
			<IconButton
				callback={() => onClickRestart()}
				iconClassname={"sanitize fa fa-undo"}
				editAccessRole={"ROLE_UI_SERVICES_STATUS_EDIT"}
				tooltipText={"SYSTEMS.SERVICES.TABLE.SANITIZE"}
			/>
		) : <></>
	);
};

export default ServicesActionCell;
