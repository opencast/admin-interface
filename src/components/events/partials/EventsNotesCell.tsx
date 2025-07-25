import React from "react";
import {
	deleteComment as deleteOneComment,
	saveComment as saveNewComment,
	updateComment as updateNewComment } from "../../../slices/eventDetailsSlice";
import { updatePages } from "../../../thunks/tableThunks";
import { useAppDispatch } from "../../../store";
import { Event } from "../../../slices/eventSlice";

/**
 * This component renders the location cells of events in the table view
 */
const EventsNotesCell = ({
	row,
}: {
	row: Event
}) => {
	const notesCommentReason = "EVENTS.EVENTS.DETAILS.COMMENTS.REASONS.ADMINUI_NOTES";

	const dispatch = useAppDispatch();

	// Return early if comments are not loaded yet
	if (!row.comments) {
		return <></>;
	}

	const comments = row.comments.filter(comment => comment.reason === notesCommentReason);

	const createComment = (event: React.FocusEvent<HTMLTextAreaElement>) => {
		if (!event.target.value || !row.id) {
			return;
		}
		dispatch(saveNewComment({ eventId: row.id, commentText: event.target.value, commentReason: notesCommentReason }))
		.then(() => {
			dispatch(updatePages());
		});
	 };

	const updateComment = (event: React.ChangeEvent<HTMLTextAreaElement>, commentId: number) => {
		if (!event.target.value || !row.id || !commentId) {
			return;
		}
		dispatch(updateNewComment({ eventId: row.id, commentId, commentText: event.target.value, commentReason: notesCommentReason }));
	};

	const deleteComment = (event: React.FocusEvent<HTMLTextAreaElement>, commentId: number) => {
		if (!row.id || !commentId) {
			return;
		}
		if (event.target.value === "") {
			dispatch(deleteOneComment({ eventId: row.id, commentId }))
			.then(() => {
				dispatch(updatePages());
			});
		}
	};

	return (
		<div className="comment-container" key={row.id}>
			{comments.length === 0 &&
				<textarea
					className="textarea"
					onBlur={createComment}
				>
				</textarea>
			}
			{comments.map((comment, key) => (
				<div className="comment" key={row.id + key}>
					<hr />
					<textarea
						className="textarea"
						defaultValue={comment.text}
						onChange={e => updateComment(e, comment.id)}
						onBlur={e => deleteComment(e, comment.id)}
					></textarea>
				</div>
			))}
		</div>
	);
};

export default EventsNotesCell;
