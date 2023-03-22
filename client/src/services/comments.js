import { makeRequest } from "./makeRequests";

export function createComment({ postId, message, parentId }) {
  // console.log(postId, message, "create comment");
  return makeRequest(`posts/${postId}/comments`, {
    method: "POST",
    data: { message, parentId },
  });
}

export function updateComment({ postId, message, id }) {
  return makeRequest(`posts/${postId}/comments/${id}`, {
    method: "PUT",
    data: { message },
  });
}

export function deleteComment({ postId, id }) {
  return makeRequest(`posts/${postId}/comments/${id}`, {
    method: "DELETE",
  });
}

export function toggleCommentLike({ id, postId }) {
  return makeRequest(`/posts/${postId}/comments/${id}/toggleLike`, {
    method: "POST",
  });
}
