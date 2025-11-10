import { FaCircle, FaDotCircle } from "react-icons/fa";
import { StepIconProps } from "@mui/material";

/**
 * Component that renders icons of Stepper depending on completeness of steps
 */
const CustomStepIcon = (props: StepIconProps) => {
	const { completed, active } = props;

	return (
		<div className="custom-step-icon">
			{completed ? (
				<FaCircle className={active ? "active" : ""} />
			) : (
				<FaDotCircle className={active ? "active" : ""} />
			)}
		</div>
	);
};

export default CustomStepIcon;
