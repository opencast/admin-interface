import { useTranslation } from "react-i18next";
import DropDown from "../../../../shared/DropDown";
import { hours, minutes } from "../../../../../configs/modalConfig";
import { formatTimeForDropdown } from "../../../../../utils/dropDownUtils";
import { getCurrentLanguageInformation } from "../../../../../utils/utils";
import { ParseKeys } from "i18next";

const SchedulingTime = ({
	hour,
	minute,
	disabled,
	title,
	hourPlaceholder,
	minutePlaceholder,
	callbackHour,
	callbackMinute,
	date,
}: {
	hour: string,
	minute: string,
	disabled: boolean
	title: ParseKeys
	hourPlaceholder: ParseKeys
	minutePlaceholder: ParseKeys
	callbackHour: (value: string) => void
	callbackMinute: (value: string) => void
	date?: string | Date
}) => {
	const { t } = useTranslation();
	// Get info about the current language and its date locale
	const currentLanguage = getCurrentLanguageInformation();

	return (
		<tr>
			<td>
				{t(title)}{" "}
				<i className="required">*</i>
			</td>
			<td className="editable ng-isolated-scope">
				{/* drop-down for hour */}
				<DropDown
					value={hour}
					text={hour}
					options={formatTimeForDropdown(hours)}
					required={true}
					handleChange={element => {
						if (element) {
							callbackHour(element.value);
							// TODO: Allow for ChangeMultiple for NewSourcePage
						}
					}}
					placeholder={t(hourPlaceholder)}
					disabled={disabled}
					customCSS={{ width: 70 }}
				/>

				{/* drop-down for minute */}
				<DropDown
					value={minute}
					text={minute}
					options={formatTimeForDropdown(minutes)}
					required={true}
					handleChange={element => {
						if (element) {
							callbackMinute(element.value);
						}
					}}
					placeholder={t(minutePlaceholder)}
					disabled={disabled}
					customCSS={{ width: 70 }}
				/>

				{/* Displays given date. Can be used to signify which date the
				  scheduling time belong to*/}
				{date &&
					<span style={{ marginLeft: "10px" }}>
						{new Date(date).toLocaleDateString(
							currentLanguage ? currentLanguage.dateLocale.code : undefined,
						)}
					</span>
				}
			</td>
		</tr>
	);

};

export default SchedulingTime;
