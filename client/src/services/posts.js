import { makeRequest } from "./makeRequests";

export function getPosts() {
  return makeRequest("/posts");
}

export function getPost(id) {
  // console.log(id);
  return makeRequest(`/posts/${id}`);
}

export function createPost({ title, body }) {
  console.log(title, body, "createPost");
  return makeRequest("/posts", {
    method: "POST",
    data: { title, body },
  });
}
