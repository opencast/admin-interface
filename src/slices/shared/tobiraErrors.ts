import { AxiosError } from "axios";
import { NOTIFICATION_CONTEXT_TOBIRA } from "../../configs/modalConfig";
import { AppDispatch } from "../../store";
import { addNotification } from "../notificationSlice";


// All Tobira fetch endpoints are using the same return codes which are handled in the same way.
// So this should be fine to reuse. In the case of `503` I decided not to log the complete error,
// as it isn't really helpful and might not even be considered as one (see TODO comment below).
export const handleTobiraError = (response: AxiosError, dispatch: AppDispatch) => {
    const data = response;

    if (data.status === 503) {
        // TODO: figure out what to do:
        // 503 means Tobira is not configured or there is an error in the configuration.
        // Opencast unfortunately doesn't know the difference.
        // If it's not configured, we don't want to show a notification, but if it is and there's
        // an error, we obviously should. For now this just throws the error, logs the presumed reason
        // and hides the Tobira tab.

        // dispatch(addNotification({
        //     type: "warning",
        //     key: "TOBIRA_NOT_CONFIGURED",
        //     duration: -1,
        //     parameter: null,
        //     context: NOTIFICATION_CONTEXT,
        // }));

        throw Error(response.message);
    } else if (data.status === 500) {
        dispatch(addNotification({
            type: "error",
            key: "TOBIRA_SERVER_ERROR",
            duration: -1,
            context: NOTIFICATION_CONTEXT_TOBIRA,
            noDuplicates: true,
        }));

        throw Error(response.message);
    } else if (data.status === 404) {
        dispatch(addNotification({
            type: "warning",
            key: "TOBIRA_NOT_FOUND",
            duration: -1,
            context: NOTIFICATION_CONTEXT_TOBIRA,
            noDuplicates: true,
        }));

        throw Error(response.message);
    }
};
