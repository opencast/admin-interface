import { useTranslation } from "react-i18next";
import DropDown from "../../../../shared/DropDown";
import { Recording } from "../../../../../slices/recordingSlice";
import { formatCaptureAgentForDropdown } from "../../../../../utils/dropDownUtils";
import { ParseKeys } from "i18next";

const SchedulingLocation = ({
	location,
	inputDevices,
	disabled,
	title,
	placeholder,
	callback,
}: {
	location: string,
	inputDevices: Recording[]
	disabled: boolean
	title: ParseKeys
	placeholder: ParseKeys
	callback: (value: string) => void
}) => {
	const { t } = useTranslation();

	return (
		<tr>
			<td>
				{t(title)}{" "}
				<i className="required">*</i>
			</td>
			{/* one options for each capture agents that has input options
			*
			* This is the 19th input field.
			*/}
			<td className="editable ng-isolated-scope">
				<DropDown
					value={location}
					text={location}
					options={formatCaptureAgentForDropdown(inputDevices)}
					required={true}
					handleChange={element => {
						if (element) {
							callback(element.value);
						}
					}}
					placeholder={t(placeholder)}
					disabled={disabled}
				/>
			</td>
		</tr>
	);
};

export default SchedulingLocation;
