import { IconButton } from "./IconButton";
import { usePost } from "../contexts/PostContext";
import { FaEdit, FaHeart, FaRegHeart, FaReply, FaTrash } from "react-icons/fa";
import { CommentList } from "./CommentList";
import { useState } from "react";
import { useAsyncFn } from "../hooks/useAsync";
import { createComment, updateComment } from "../services/comments";
import { CommentForm } from "./CommentForm";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function Comment({ id, message, user, createdAt }) {
  const { post, getReplies, createLocalComment, updateLocalComment } =
    usePost();

  const childComments = getReplies(id);
  const [areChildrenHidden, setAreChildrenHidden] = useState(false);

  const [isReplying, setIsReplying] = useState(false);
  const createCommentFn = useAsyncFn(createComment);

  const [isEditing, setIsEditing] = useState(false);
  const updateCommentFn = useAsyncFn(updateComment);

  function onCommentReply(message) {
    return createCommentFn
      .execute({ postId: post.id, message, parentId: id })
      .then((comment) => {
        setIsReplying(false);
        createLocalComment(comment);
      });
  }

  function onCommentUpdate(message) {
    return updateCommentFn
      .execute({ postId: post.id, message, id })
      .then((comment) => {
        setIsEditing(false);
        // console.log(comment);
        updateLocalComment(id, comment.message);
      });
  }

  return (
    <>
      <div className="comment">
        <div className="header">
          <span className="name">{user.name}</span>
          <span className="date">
            {dateFormatter.format(Date.parse(createdAt))}
          </span>
        </div>
        {isEditing ? (
          <CommentForm
            autoFocus
            initialValue={message}
            onSubmit={onCommentUpdate}
            loading={updateCommentFn.loading}
            error={updateCommentFn.error}
          />
        ) : (
          <div className="message">{message}</div>
        )}
        <div className="footer">
          <IconButton Icon={FaHeart} aria-label="Like">
            2
          </IconButton>
          <IconButton
            Icon={FaReply}
            aria-label={isReplying ? "Cancel Reply" : "Reply"}
            onClick={() => setIsReplying((prev) => !prev)}
            isActive={isReplying}
          />
          <IconButton
            Icon={FaEdit}
            aria-label={isEditing ? "Cancel Edit" : "Edit"}
            onClick={() => setIsEditing((prev) => !prev)}
            isActive={isEditing}
          />
          <IconButton Icon={FaTrash} aria-label="Delete" color="danger" />
        </div>
      </div>
      {isReplying && (
        <div className="mt-1 ml-3">
          <CommentForm
            autoFocus
            onSubmit={onCommentReply}
            loading={createCommentFn.loading}
            error={createCommentFn.error}
          />
        </div>
      )}
      {childComments?.length > 0 && (
        <>
          <div
            className={`nested-comments-stack ${
              areChildrenHidden ? "hide" : ""
            }`}
          >
            <button
              className="collapse-line"
              aria-label="Hide Replies"
              onClick={() => {
                setAreChildrenHidden(true);
              }}
            />
            <div className="nested-comments">
              <CommentList comments={childComments} />
            </div>
          </div>
          <button
            className={`btn mt-1 ${!areChildrenHidden} ? "hide" : ""`}
            onClick={() => {
              setAreChildrenHidden(false);
            }}
          >
            Show Replies
          </button>
        </>
      )}
    </>
  );
}
