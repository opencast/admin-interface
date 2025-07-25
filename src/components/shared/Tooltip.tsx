import { useRef, useState } from "react";
import MuiTooltip, { TooltipProps } from "@mui/material/Tooltip";

export const Tooltip = (
	{ active = true, className, placement = "top", ...props }: TooltipProps & { active?: boolean },
) => {
	const [open, setOpen] = useState(false);

	const positionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
	const areaRef = useRef<HTMLDivElement>(null);

	const getBoundingClientRect = () => {
		 switch (placement) {
			 case "top":
					return new DOMRect(
						positionRef.current.x,
						areaRef.current?.getBoundingClientRect().y,
						0,
						positionRef.current.y,
					);
			 case "right":
				 return new DOMRect(
					 areaRef.current?.getBoundingClientRect().x,
					 positionRef.current.y,
					 areaRef.current?.getBoundingClientRect().width,
					 0,
				 );
			 case "bottom":
				 return new DOMRect(
					 positionRef.current.x,
					 areaRef.current?.getBoundingClientRect().y,
					 0,
					 areaRef.current?.getBoundingClientRect().height,
				 );
			 case "left":
				 return new DOMRect(
					 areaRef.current?.getBoundingClientRect().x,
					 positionRef.current.y,
					 areaRef.current?.getBoundingClientRect().width,
					 0,
				 );
			default: {
				const rect = areaRef.current?.getBoundingClientRect();
				if (!rect) {
					return new DOMRect();
				} else {
					return rect;
				}
			}
		}
	};

	return (
		<MuiTooltip
			{...props}
			open={open && active}
			onOpen={() => setOpen(true)}
			onClose={() => setOpen(false)}
			classes={{ popper: className }}
			arrow
			describeChild
			enterDelay={100}
			enterNextDelay={100}
			leaveDelay={150}
			placement={placement}
			ref={areaRef}
			onMouseOut={() => (positionRef.current = { x: -9999, y: -9999 })}
			onMouseMove={event => (positionRef.current = { x: event.clientX, y: event.clientY })}
			PopperProps={{
				anchorEl: {
					getBoundingClientRect,
				},
			}}
		/>
	);
};
