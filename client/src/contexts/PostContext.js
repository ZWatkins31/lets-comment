import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getPost } from "../services/posts";

// contains all of the information for our post as well as the comments on the post
// allows us to add/delete/edit/nest comments

const Context = React.createContext();

export function usePost() {
  return useContext(Context);
}

export function PostProvider({ children }) {
  const { id } = useParams();

  const { loading, error, value: post } = useAsync(() => getPost(id), [id]);

  const [comments, setComments] = useState([]); // local array of comments

  const commentsByParentId = useMemo(() => {
    const group = {};
    comments.forEach((comment) => {
      group[comment.parentId] ||= [];
      group[comment.parentId].push(comment);
    });
    return group;
  }, [comments]); // console.log(commentsByParentId);

  // when we render/load a post, set comments state variable to the post's comments
  useEffect(() => {
    if (post?.comments == null) return;
    setComments(post.comments);
  }, [post?.comments]);

  function getReplies(parentId) {
    return commentsByParentId[parentId];
  }

  function createLocalComment(comment) {
    setComments((prevComments) => {
      return [comment, ...prevComments];
    });
  }

  return (
    <Context.Provider
      value={{
        post: { id, ...post },
        rootComments: commentsByParentId[null],
        getReplies,
        createLocalComment,
      }}
    >
      {loading ? (
        <h1>Loading...</h1>
      ) : error ? (
        <h1 className="error-msg">{error}</h1>
      ) : (
        children
      )}
    </Context.Provider>
  );
}
