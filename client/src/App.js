import { Route, Routes } from "react-router-dom";
import PostList from "./components/PostLists";
import { Post } from "./components/Post";
import { PostProvider } from "./contexts/PostContext";
import { PostForm } from "./components/PostForm";

function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/posts/new" element={<PostForm />} />
        <Route
          path="/posts/:id"
          element={
            <PostProvider>
              <Post />
            </PostProvider>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
