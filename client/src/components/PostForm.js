import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAsyncFn } from "../hooks/useAsync";
import { createPost } from "../services/posts";

export function PostForm() {
  const navigate = useNavigate();

  const initialState = { title: "", body: "" };
  const [formData, setFormData] = useState(initialState);

  const createPostFn = useAsyncFn(createPost);

  // Updates the state of the form whenever the user makes changes to it
  function handleChange({ target }) {
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  }

  function handleSubmit({ title, body }) {
    console.log({ title, body }, "handle submit");
    createPost({ title, body }).then(() => navigate(-1));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(formData);
      }}
      className="post-form"
    >
      <div>
        <div className="mt-1 form-input form-input-title">
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Post Title"
            required={true}
            value={formData.title}
            onChange={handleChange}
          />
        </div>
        <div className="mt-1 form-input form-input-body">
          <textarea
            id="body"
            name="body"
            type="text"
            placeholder="Post Body"
            required={true}
            value={formData.body}
            onChange={handleChange}
          />
        </div>
        <div>
          <button className="add-btn mt-1 mr-1" type="submit">
            Create Post
          </button>
          <button
            className="cancle-btn mt-1"
            type="button"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </div>
      {/* <div className="error-msg">{error}</div> */}
    </form>
  );
}
