import { useTranslation } from "react-i18next";
import cn from "classnames";
import { Step, StepButton, StepLabel, Stepper } from "@mui/material";
import {
	isSummaryReachable,
	stepLabelStyle,
	stepperStyle,
} from "../../../utils/wizardUtils";
import CustomStepIcon from "./CustomStepIcon";
import { checkAcls } from "../../../slices/aclSlice";
import { useAppDispatch } from "../../../store";
import { ParseKeys } from "i18next";
import { TransformedAcl } from "../../../slices/aclDetailsSlice";

export type WizardStep = {
	translation: ParseKeys,
	name: string,
}

/**
 * This components renders the stepper navigation of new resource wizards
 */
const WizardStepper = ({
	steps,
	activePageIndex,
	setActivePage,
	completed,
	setCompleted,
	acls,
	isValid = false,
}: {
	steps: WizardStep[],
	activePageIndex: number,
	setActivePage: (num: number) => void,
	completed: Record<number, boolean>,
	setCompleted: (rec: Record<number, boolean>) => void,
	acls?: TransformedAcl[], // If there is an acl page
	isValid: boolean,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const handleOnClick = (key: number) => {
		if (isSummaryReachable(key, steps, completed)) {
			if (acls) {
				const check = dispatch(checkAcls(acls));
				if (!check) {
					return;
				}
			}

			if (isValid) {
				const updatedCompleted = completed;
				updatedCompleted[activePageIndex] = true;
				setCompleted(updatedCompleted);
				// If all previous pages have been completed
				if (Object.values(updatedCompleted)
						.filter((_, index) => index > key)
						.every(value => value)
				) {
					setActivePage(key);
				}
			}

			if (!isValid) {
				if (completed[key]) {
					setActivePage(key);
				}
			}
		}
	};

	return (
		<Stepper
			activeStep={activePageIndex}
			nonLinear
			alternativeLabel
			connector={<></>}
			sx={stepperStyle.root}
			className={cn("step-by-step")}
		>
			{steps.map((label, key) =>
				<Step key={label.translation} completed={completed[key]}>
					<StepButton onClick={() => handleOnClick(key)}>
						<StepLabel sx={stepLabelStyle.root} StepIconComponent={CustomStepIcon}>
							{t(label.translation)}
						</StepLabel>
					</StepButton>
				</Step>,
			)}
		</Stepper>
	);
};

export default WizardStepper;
