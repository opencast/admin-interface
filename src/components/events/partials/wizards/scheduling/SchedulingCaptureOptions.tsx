import { useTranslation } from "react-i18next";
import SchedulingInputs from "./SchedulingInputs";
import {
	CaptureOptionLists,
	CaptureOptionSelection,
	captureOptions,
} from "../../../../../slices/recordingSlice";

/**
 * Renders a row for every option of a capture agent that can be chosen for an event, in the same way as the inputs
 */
const SchedulingCaptureOptions = ({
	agent,
	selection,
	disabled,
}: {
	agent: CaptureOptionLists | undefined,
	selection: CaptureOptionSelection,
	// Only show what is selected
	disabled: boolean,
}) => {
	const { t } = useTranslation();

	return (
		<>
			{captureOptions.map(({ field, list, label }) => {
				const options = agent?.[list] ?? [];
				if (options.length === 0) {
					return null;
				}

				return (
					<tr key={field}>
						<td>{t(label)}</td>
						<td>
							{field === "deviceContent" && (
								<p>{t("CAPTURE_AGENT.OPTIONS.CONTENT_NOTICE")}</p>
							)}
							{disabled
								? options.filter(option => selection[field].includes(option.id)).map(option => (
									<span key={option.id}>
										{t(option.value, option.id)}
										<br />
									</span>
								))
								: <SchedulingInputs name={field} inputs={options} />}
						</td>
					</tr>
				);
			})}
		</>
	);
};

export default SchedulingCaptureOptions;
