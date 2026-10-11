import { useState, useEffect } from "react";
import API from "./api";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const menuItems = ["Dashboard", "Posts", "Pages", "Media", "Settings"];

  // Posts state
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

// Edit Post state
const [editingPostId, setEditingPostId] = useState(null);

const [editFormData, setEditFormData] = useState({
  title: "",
  content: "",
  featuredImage: "",
  status: "draft",
});

  // Create post form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    featuredImage: "",
    status: "draft",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch posts when the Posts tab is opened
  useEffect(() => {
    if (activeTab !== "Posts") return;

    let cancelled = false;

    async function fetchPosts() {
      setLoading(true);
      setError("");

      try {
        const response = await API.get("/posts");

        if (!cancelled) {
          // Supports APIs returning either an array
          // or an object containing a posts array.
          const data = response.data;
          const postList = Array.isArray(data) ? data : data.posts;

          setPosts(Array.isArray(postList) ? postList : []);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Could not load posts. Check whether the backend is running.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPosts();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Create a new blog post
  const handleCreatePost = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await API.post("/posts", formData);

      // Supports APIs returning the post directly
      // or returning { post: savedPost }.
      const newPost = response.data.post ?? response.data;

      if (!newPost?._id) {
        throw new Error("The API did not return the saved post.");
      }

      setPosts((currentPosts) => [
        newPost,
        ...currentPosts.filter((post) => post._id !== newPost._id),
      ]);

      setMessage("Post created successfully!");

      setFormData({
        title: "",
        content: "",
        featuredImage: "",
        status: "draft",
      });
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          err.message ||
          "Failed to create post. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };
  
const handleEditClick = (post) => {
  setEditingPostId(post._id);

  setEditFormData({
    title: post.title || "",
    content: post.content || "",
    featuredImage: post.featuredImage || "",
    status: post.status || "draft",
  });

  setMessage("");
  setError("");
};

const handleUpdatePost = async (e) => {
  e.preventDefault();

  if (!editingPostId) return;

  setSaving(true);
  setMessage("");
  setError("");

  try {
    const response = await API.put(`/posts/${editingPostId}`, editFormData);

    const updatedPost = response.data.post ?? response.data;

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post._id === editingPostId ? { ...post, ...updatedPost } : post,
      ),
    );

    setEditingPostId(null);
    setMessage("Post updated successfully!");
  } catch (err) {
    setError(err.response?.data?.message || "Failed to update post.");
  } finally {
    setSaving(false);
  }
};

const handleDeletePost = async (postId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this post?",
  );

  if (!confirmed) return;

  setError("");
  setMessage("");

  try {
    await API.delete(`/posts/${postId}`);

    setPosts((currentPosts) =>
      currentPosts.filter((post) => post._id !== postId),
    );

    if (editingPostId === postId) {
      setEditingPostId(null);
    }

    setMessage("Post deleted successfully!");
  } catch (err) {
    setError(err.response?.data?.message || "Failed to delete post.");
  }
};


  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="brand">
          Blog<span>CMS</span>
        </h2>

        <p className="menu-label">WORKSPACE</p>

        {menuItems.map((item) => (
          <button
            key={item}
            className={activeTab === item ? "menu-item active" : "menu-item"}
            onClick={() => setActiveTab(item)}
          >
            {item === "Dashboard" && "▦"}
            {item === "Posts" && "✎"}
            {item === "Pages" && "▤"}
            {item === "Media" && "▧"}
            {item === "Settings" && "⚙"}
            <span>{item}</span>
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="avatar">A</div>
          <div>
            <strong>Admin User</strong>
            <p>Administrator</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / {activeTab}</p>
            <h1>{activeTab}</h1>
          </div>

          <button
            className="preview-button"
            onClick={() => window.open("/", "_blank")}
          >
            Preview site ↗
          </button>
        </header>

        {/* Dashboard */}
        {activeTab === "Dashboard" && (
          <>
            <section className="welcome">
              <div>
                <p className="eyebrow">YOUR CONTENT WORKSPACE</p>
                <h2>Welcome back, Admin!</h2>
                <p>
                  Manage your blog posts, pages and website content from one
                  place.
                </p>
              </div>

              <div className="welcome-icon">✦</div>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <p>Total Posts</p>
                <h2>{posts.length}</h2>
                <span>Loaded blog articles</span>
              </div>

              <div className="stat-card">
                <p>Total Pages</p>
                <h2>0</h2>
                <span>Website pages</span>
              </div>

              <div className="stat-card">
                <p>Published</p>
                <h2>
                  {posts.filter((post) => post.status === "published").length}
                </h2>
                <span>Published posts</span>
              </div>

              <div className="stat-card">
                <p>Drafts</p>
                <h2>
                  {posts.filter((post) => post.status === "draft").length}
                </h2>
                <span>Work in progress</span>
              </div>
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Recent Posts</h2>
                  <p>Your recently loaded blog content.</p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setActiveTab("Posts")}
                >
                  + Manage Posts
                </button>
              </div>

              {posts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✎</div>
                  <h3>Your content journey starts here</h3>
                  <p>Create your first post in the Posts section.</p>
                </div>
              ) : (
                posts.slice(0, 5).map((post) => (
                  <div key={post._id} className="post-row">
                    <h3>{post.title}</h3>
                    <span>Status: {post.status}</span>
                  </div>
                ))
              )}
            </section>
          </>
        )}

        {/* Posts */}
        {activeTab === "Posts" && (
          <section className="content-card">
            <div className="section-heading">
              <div>
                <h2>Blog Posts</h2>
                <p>Create and manage blog posts.</p>
              </div>
            </div>

            {/* Create Post Form */}
            <form onSubmit={handleCreatePost}>
              <h2>Create New Post</h2>

              <input
                type="text"
                name="title"
                placeholder="Post title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />

              <textarea
                name="content"
                placeholder="Write your blog content..."
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={6}
              />

              <input
                type="url"
                name="featuredImage"
                placeholder="Featured image URL (optional)"
                value={formData.featuredImage}
                onChange={handleInputChange}
              />

              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>

              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Create Post"}
              </button>

              {message && (
                <p role="status" aria-live="polite">
                  {message}
                </p>
              )}
            </form>

            <hr />

            {/* Existing Posts List */}
            <h2>All Posts</h2>

            {loading && <p>Loading posts...</p>}

            {error && <p role="alert">{error}</p>}

            {!loading && !error && posts.length === 0 && (
              <p>No blog posts found. Create your first post above.</p>
            )}

            {!loading &&
              posts.map((post) => (
                <div key={post._id} className="post-row">
                  {editingPostId === post._id ? (
                    <form onSubmit={handleUpdatePost}>
                      <h3>Edit Blog Post</h3>

                      <input
                        type="text"
                        value={editFormData.title}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            title: e.target.value,
                          })
                        }
                        placeholder="Post title"
                        required
                      />

                      <textarea
                        value={editFormData.content}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            content: e.target.value,
                          })
                        }
                        placeholder="Post content"
                        required
                      />

                      <input
                        type="url"
                        value={editFormData.featuredImage}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            featuredImage: e.target.value,
                          })
                        }
                        placeholder="Featured image URL (optional)"
                      />

                      <select
                        value={editFormData.status}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            status: e.target.value,
                          })
                        }
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>

                      <button type="submit" disabled={saving}>
                        {saving ? "Updating..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingPostId(null)}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <h3>{post.title}</h3>
                      <p>{post.content}</p>
                      <span>Status: {post.status}</span>

                      <div>
                        <button type="button" onClick={() => handleEditClick(post)}>
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePost(post._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
          </section>
        )}

        {/* Pages */}
        {activeTab === "Pages" && (
          <section className="content-card">
            <h2>Website Pages</h2>
            <p>Manage Home, About, Contact and other pages.</p>

            <div className="empty-state">
              <div className="empty-icon">▤</div>
              <h3>Pages management</h3>
              <p>Your saved pages will appear here after API integration.</p>
            </div>
          </section>
        )}

        {/* Media */}
        {activeTab === "Media" && (
          <section className="content-card">
            <h2>Media Library</h2>
            <p>Manage images and other uploaded files.</p>

            <div className="empty-state">
              <div className="empty-icon">▧</div>
              <h3>Your media library</h3>
              <p>File upload functionality will be added later.</p>
            </div>
          </section>
        )}

        {/* Settings */}
        {activeTab === "Settings" && (
          <section className="content-card">
            <h2>Settings</h2>
            <p>Website configuration and administrator settings.</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
