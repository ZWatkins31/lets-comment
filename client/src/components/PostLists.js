import { Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getPosts } from "../services/posts";
import { FaPlus } from "react-icons/fa";

export default function PostList() {
  const { loading, error, value: posts } = useAsync(getPosts);

  if (loading) return <h1>Loading</h1>;
  if (error) return <h1 className="error-msg">{error}</h1>;

  return (
    <div className="hero">
      <div>
        <h1 className="title">Let's Comment!</h1>
        <p>Add or click on a post to view!</p>
      </div>

      {posts.map((post) => {
        return (
          <h3 key={post.id}>
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </h3>
        );
      })}
      <a className="add-btn" href="/posts/new">
        <span>
          <FaPlus />
        </span>
        Add Post
      </a>
    </div>
  );
}
