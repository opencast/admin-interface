import { stepIcon } from "../../../utils/wizardUtils";
import { FaCircle, FaDotCircle } from "react-icons/fa";
import { StepIconProps } from "@mui/material";

/**
 * Component that renders icons of Stepper depending on completeness of steps
 */
const CustomStepIcon = (props: StepIconProps) => {
	const { completed, active } = props;

	return (
		<div style={stepIcon.root}>
			{completed ? (
				<FaCircle style={{ ...stepIcon.circle, ...(active && stepIcon.circleActive) }}/>
			) : (
				<FaDotCircle style={{ ...stepIcon.circle, ...(active && stepIcon.circleActive) }} />
			)}
		</div>
	);
};

export default CustomStepIcon;
