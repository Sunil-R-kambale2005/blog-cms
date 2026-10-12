import { useState, useEffect, useRef } from "react";
import API from "./api";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [showEditUrlMode, setShowEditUrlMode] = useState(false);
  const editFileInputRef = useRef(null);

  // Delete Confirmation state
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Create post form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    featuredImage: "",
    status: "draft",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showUrlMode, setShowUrlMode] = useState(false);
  const createFileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Media Library state
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [mediaSuccess, setMediaSuccess] = useState("");
  const [mediaUploading, setMediaUploading] = useState(false);
  const [copiedFilename, setCopiedFilename] = useState("");
  const mediaFileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = (post.title || "")
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());
    const matchesStatus =
      statusFilter === "All" || post.status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Fetch posts when the Posts or Dashboard tab is opened
  useEffect(() => {
    if (activeTab !== "Posts" && activeTab !== "Dashboard") return;

    let cancelled = false;

    async function fetchPosts() {
      setLoading(true);
      setError("");

      try {
        const response = await API.get("/posts");

        if (!cancelled) {
          const data = response.data;
          const postList = Array.isArray(data) ? data : data.posts;
          setPosts(Array.isArray(postList) ? postList : []);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load posts. Check whether the backend is running.");
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

  // Fetch media library when Media tab is opened
  useEffect(() => {
    if (activeTab !== "Media") return;

    let cancelled = false;

    async function fetchMedia() {
      setMediaLoading(true);
      setMediaError("");

      try {
        const response = await API.get("/upload/media");
        if (!cancelled) {
          setMediaItems(Array.isArray(response.data) ? response.data : []);
        }
      } catch {
        if (!cancelled) {
          setMediaError("Could not load media library. Verify backend is running.");
        }
      } finally {
        if (!cancelled) {
          setMediaLoading(false);
        }
      }
    }

    fetchMedia();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // Handle text input changes for Create Post
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Image selection for Create Post
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, featuredImage: "" }));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, featuredImage: "" }));
    if (createFileInputRef.current) {
      createFileInputRef.current.value = "";
    }
  };

  // Create a new blog post with connected image upload
  const handleCreatePost = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      let finalImageUrl = formData.featuredImage;

      // If an image file was selected from user's device, upload it first
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("image", imageFile);

        const uploadResponse = await API.post("/upload", uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        finalImageUrl = uploadResponse.data.imageUrl;
      }

      const postPayload = {
        ...formData,
        featuredImage: finalImageUrl,
      };

      const response = await API.post("/posts", postPayload);

      const newPost = response.data.post ?? response.data;

      if (!newPost?._id) {
        throw new Error("The API did not return the saved post.");
      }

      setPosts((currentPosts) => [
        newPost,
        ...currentPosts.filter((post) => post._id !== newPost._id),
      ]);

      setMessage("Post created successfully with featured image!");

      // Reset form and file selection
      setFormData({
        title: "",
        content: "",
        featuredImage: "",
        status: "draft",
      });
      setImageFile(null);
      setImagePreview("");
      if (createFileInputRef.current) {
        createFileInputRef.current.value = "";
      }
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

  // Handle Edit Post setup (opens Edit Post modal)
  const handleEditClick = (post) => {
    setEditingPostId(post._id);

    setEditFormData({
      title: post.title || "",
      content: post.content || "",
      featuredImage: post.featuredImage || "",
      status: post.status || "draft",
    });

    setEditImageFile(null);
    setEditImagePreview(post.featuredImage || "");
    setShowEditUrlMode(false);
    setMessage("");
    setError("");
  };

  const handleCloseEditModal = () => {
    setEditingPostId(null);
    setEditImageFile(null);
    setEditImagePreview("");
  };

  const handleEditImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  const handleEditRemoveImage = () => {
    setEditImageFile(null);
    setEditImagePreview("");
    setEditFormData((prev) => ({ ...prev, featuredImage: "" }));
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  // Update blog post with optional new image upload
  const handleUpdatePost = async (e) => {
    e.preventDefault();

    if (!editingPostId) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      let finalImageUrl = editFormData.featuredImage;

      // If a new replacement file was picked, upload it first
      if (editImageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("image", editImageFile);

        const uploadResponse = await API.post("/upload", uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        finalImageUrl = uploadResponse.data.imageUrl;
      }

      const updatePayload = {
        ...editFormData,
        featuredImage: finalImageUrl,
      };

      const response = await API.put(`/posts/${editingPostId}`, updatePayload);

      const updatedPost = response.data.post ?? response.data;

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post._id === editingPostId ? { ...post, ...updatedPost } : post,
        ),
      );

      setEditingPostId(null);
      setEditImageFile(null);
      setEditImagePreview("");
      setMessage(`Post "${updatedPost.title || "Untitled"}" updated successfully!`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update post.");
    } finally {
      setSaving(false);
    }
  };

  // Quick toggle status between published and draft
  const handleToggleStatus = async (post) => {
    const newStatus = post.status === "published" ? "draft" : "published";

    try {
      await API.put(`/posts/${post._id}`, {
        status: newStatus,
      });

      setPosts((currentPosts) =>
        currentPosts.map((item) =>
          item._id === post._id ? { ...item, status: newStatus } : item,
        ),
      );

      setMessage(
        newStatus === "published"
          ? `"${post.title}" is now published!`
          : `"${post.title}" moved to drafts!`,
      );
    } catch (err) {
      console.error("Status update failed:", err);
      setMessage("Could not update post status.");
    }
  };

  // Delete Confirmation Dialog handlers
  const handlePromptDelete = (post) => {
    setPostToDelete({ id: post._id, title: post.title });
  };

  const handleCancelDelete = () => {
    setPostToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      await API.delete(`/posts/${postToDelete.id}`);

      setPosts((currentPosts) =>
        currentPosts.filter((post) => post._id !== postToDelete.id),
      );

      if (editingPostId === postToDelete.id) {
        setEditingPostId(null);
      }

      setMessage(`Post "${postToDelete.title}" deleted successfully!`);
      setPostToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete post.");
    } finally {
      setDeleting(false);
    }
  };

  // Media Library handlers
  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";
    setMediaUploading(true);
    setMediaError("");
    setMediaSuccess("");

    try {
      const data = new FormData();
      data.append("image", file);

      const response = await API.post("/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newMedia = {
        filename: response.data.filename,
        url: response.data.imageUrl,
        size: response.data.size,
        createdAt: new Date().toISOString(),
      };

      setMediaItems((prev) => [newMedia, ...prev]);
      setMediaSuccess("Image uploaded to library successfully!");
    } catch (err) {
      setMediaError(
        err.response?.data?.message || err.message || "Failed to upload image."
      );
    } finally {
      setMediaUploading(false);
    }
  };

  const handleDeleteMedia = async (filename) => {
    const confirmed = window.confirm("Delete this image from the media library?");
    if (!confirmed) return;

    try {
      await API.delete(`/upload/media/${filename}`);
      setMediaItems((prev) => prev.filter((item) => item.filename !== filename));
      setMediaSuccess("Image deleted successfully.");
    } catch (err) {
      setMediaError(
        err.response?.data?.message || err.message || "Failed to delete image."
      );
    }
  };

  const handleCopyMediaUrl = (url, filename) => {
    navigator.clipboard.writeText(url);
    setCopiedFilename(filename);
    setTimeout(() => {
      setCopiedFilename("");
    }, 2000);
  };

  const handleUseMediaInNewPost = (url) => {
    setFormData((prev) => ({ ...prev, featuredImage: url }));
    setImageFile(null);
    setImagePreview(url);
    setActiveTab("Posts");
  };

  return (
    <div className="admin-layout">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div
            className="delete-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="delete-modal-icon">🗑️</div>
            <h3>Delete Blog Post?</h3>
            <p>
              Are you sure you want to permanently delete{" "}
              <strong>"{postToDelete.title || "Untitled"}"</strong>? This action
              cannot be undone.
            </p>
            <div className="delete-modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleCancelDelete}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting post..." : "Yes, Delete Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPostId && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div>
                <h2>Edit Blog Post</h2>
                <p className="modal-subtitle">
                  Update title, content, featured image, or publication status.
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={handleCloseEditModal}
                aria-label="Close edit modal"
              >
                ✕
              </button>
            </div>

            <form className="admin-form modal-form" onSubmit={handleUpdatePost}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-error" role="alert">
                    {error}
                  </div>
                )}

                {/* Edit Title */}
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-post-title">
                    Post Title <span className="required">*</span>
                  </label>
                  <input
                    id="edit-post-title"
                    className="form-input"
                    type="text"
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter article title..."
                    required
                  />
                </div>

                {/* Edit Content */}
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-post-content">
                    Post Content <span className="required">*</span>
                  </label>
                  <textarea
                    id="edit-post-content"
                    className="form-textarea"
                    value={editFormData.content}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        content: e.target.value,
                      })
                    }
                    placeholder="Write article content..."
                    rows={8}
                    required
                  />
                </div>

                {/* Edit Featured Image Upload / URL */}
                <div className="form-group image-upload-group">
                  <div className="image-upload-header">
                    <label className="form-label" htmlFor="edit-post-image">
                      Featured Image
                    </label>
                    <button
                      type="button"
                      className="toggle-mode-btn"
                      onClick={() => setShowEditUrlMode(!showEditUrlMode)}
                    >
                      {showEditUrlMode
                        ? "📁 Switch to File Upload"
                        : "🔗 Switch to Image URL"}
                    </button>
                  </div>

                  {showEditUrlMode ? (
                    <input
                      id="edit-post-image-url"
                      type="url"
                      className="form-input"
                      value={editFormData.featuredImage}
                      onChange={(e) => {
                        setEditFormData((prev) => ({
                          ...prev,
                          featuredImage: e.target.value,
                        }));
                        setEditImagePreview(e.target.value);
                      }}
                      placeholder="https://..."
                    />
                  ) : (
                    <div className="upload-container">
                      <input
                        id="edit-post-image"
                        type="file"
                        ref={editFileInputRef}
                        onChange={handleEditImageSelect}
                        accept="image/*"
                        style={{ display: "none" }}
                      />

                      {editImagePreview ? (
                        <div className="image-preview-box">
                          <img
                            src={editImagePreview}
                            alt="Featured preview"
                            className="image-preview-thumb"
                          />
                          <div className="image-preview-info">
                            <span className="image-preview-badge">
                              {editImageFile
                                ? "✓ New File Selected"
                                : "✓ Current Featured Image"}
                            </span>
                            <span
                              className="image-preview-url"
                              title={
                                editImageFile
                                  ? editImageFile.name
                                  : editFormData.featuredImage
                              }
                            >
                              {editImageFile
                                ? `${editImageFile.name} (${formatFileSize(
                                    editImageFile.size,
                                  )})`
                                : editFormData.featuredImage}
                            </span>
                            <div className="image-preview-actions">
                              <button
                                type="button"
                                className="btn-preview-change"
                                onClick={() => editFileInputRef.current?.click()}
                              >
                                Replace Image
                              </button>
                              <button
                                type="button"
                                className="btn-preview-remove"
                                onClick={handleEditRemoveImage}
                              >
                                Remove Image
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="upload-dropzone"
                          onClick={() => editFileInputRef.current?.click()}
                        >
                          <div className="upload-prompt">
                            <span className="upload-icon">📷</span>
                            <div className="upload-text">
                              <strong>Click to choose new featured image</strong>
                              <p>PNG, JPG, WebP, GIF, SVG (max 10MB)</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Edit Publication Status */}
                <div className="form-group" style={{ maxWidth: "260px" }}>
                  <label className="form-label" htmlFor="edit-post-status">
                    Publication Status
                  </label>
                  <select
                    id="edit-post-status"
                    className="form-select"
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="draft">Draft (Work in Progress)</option>
                    <option value="published">Published (Live on Public Blog)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="admin-btn admin-btn-danger"
                  type="button"
                  onClick={() =>
                    handlePromptDelete({
                      _id: editingPostId,
                      title: editFormData.title,
                    })
                  }
                  disabled={saving}
                >
                  Delete Post
                </button>

                <div className="modal-footer-right">
                  <button
                    className="admin-btn admin-btn-secondary"
                    type="button"
                    onClick={handleCloseEditModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="admin-btn admin-btn-primary"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? "Saving changes..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="brand">
            Blog<span>CMS</span>
          </h2>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        <p className="menu-label">WORKSPACE</p>

        <nav className="menu-list">
          {menuItems.map((item) => (
            <button
              key={item}
              className={activeTab === item ? "menu-item active" : "menu-item"}
              onClick={() => {
                setActiveTab(item);
                setSidebarOpen(false);
              }}
            >
              <span className="menu-icon">
                {item === "Dashboard" && "▦"}
                {item === "Posts" && "✎"}
                {item === "Pages" && "▤"}
                {item === "Media" && "▧"}
                {item === "Settings" && "⚙"}
              </span>
              <span>{item}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="avatar">A</div>
          <div className="user-info">
            <strong>Admin User</strong>
            <p>Administrator</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-toggle-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              ☰
            </button>
            <div>
              <p className="breadcrumb">Workspace / {activeTab}</p>
              <h1>{activeTab}</h1>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              className="preview-button"
              onClick={() => window.open("/", "_blank")}
            >
              <span>Preview site</span>
              <span>↗</span>
            </button>
          </div>
        </header>

        {/* Global Notifications */}
        {message && (
          <div className="alert alert-info alert-dismissible" role="status">
            <span>{message}</span>
            <button
              className="alert-close-btn"
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "Dashboard" && (
          <div className="dashboard-view">
            <section className="welcome">
              <div className="welcome-text">
                <p className="eyebrow">YOUR CONTENT WORKSPACE</p>
                <h2>Welcome back, Admin!</h2>
                <p>
                  Manage your blog posts, pages, and website content from one centralized
                  control center.
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
                <span>Live on public blog</span>
              </div>

              <div className="stat-card">
                <p>Drafts</p>
                <h2>{posts.filter((post) => post.status === "draft").length}</h2>
                <span>Work in progress</span>
              </div>
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Recent Posts</h2>
                  <p>Your latest saved and published blog articles.</p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setActiveTab("Posts")}
                >
                  + Manage All Posts
                </button>
              </div>

              {posts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✎</div>
                  <h3>Your content journey starts here</h3>
                  <p>Create your first post in the Posts section to begin publishing.</p>
                </div>
              ) : (
                <div className="posts-manage-list">
                  {posts.slice(0, 5).map((post) => (
                    <div key={post._id} className="post-row">
                      <div className="post-row-content">
                        {post.featuredImage && (
                          <img
                            src={post.featuredImage}
                            alt=""
                            className="post-row-thumb"
                          />
                        )}
                        <div className="post-row-main">
                          <div className="post-header-line">
                            <h3>{post.title}</h3>
                            <span
                              className={`badge ${
                                post.status === "published"
                                  ? "badge-published"
                                  : "badge-draft"
                              }`}
                            >
                              {post.status}
                            </span>
                          </div>
                          <p className="post-row-excerpt">{post.content}</p>
                        </div>

                        <div className="post-row-actions">
                          <button
                            className={`btn-action btn-status ${
                              post.status === "published"
                                ? "btn-unpublish"
                                : "btn-publish"
                            }`}
                            type="button"
                            onClick={() => handleToggleStatus(post)}
                            title="Toggle publication status"
                          >
                            {post.status === "published" ? "Unpublish" : "Publish"}
                          </button>

                          <button
                            className="btn-action btn-edit"
                            type="button"
                            onClick={() => handleEditClick(post)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn-action btn-delete"
                            type="button"
                            onClick={() => handlePromptDelete(post)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "Posts" && (
          <div className="posts-view">
            {/* Create Post Section */}
            <section className="content-card form-section">
              <div className="section-heading">
                <div>
                  <h2>Create New Post</h2>
                  <p>Draft or publish a fresh article with custom uploaded media.</p>
                </div>
              </div>

              <form className="admin-form" onSubmit={handleCreatePost}>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-post-title">
                    Post Title <span className="required">*</span>
                  </label>
                  <input
                    id="new-post-title"
                    className="form-input"
                    type="text"
                    name="title"
                    placeholder="Enter an engaging article title..."
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="new-post-content">
                    Post Content <span className="required">*</span>
                  </label>
                  <textarea
                    id="new-post-content"
                    className="form-textarea"
                    name="content"
                    placeholder="Write your article body here..."
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows={6}
                  />
                </div>

                {/* Featured Image Upload Field */}
                <div className="form-group image-upload-group">
                  <div className="image-upload-header">
                    <label className="form-label" htmlFor="create-post-image">
                      Featured Image
                    </label>
                    <button
                      type="button"
                      className="toggle-mode-btn"
                      onClick={() => setShowUrlMode(!showUrlMode)}
                    >
                      {showUrlMode
                        ? "📁 Switch to File Upload"
                        : "🔗 Switch to Image URL"}
                    </button>
                  </div>

                  {showUrlMode ? (
                    <input
                      id="create-post-image-url"
                      type="url"
                      className="form-input"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.featuredImage}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          featuredImage: e.target.value,
                        }));
                        setImagePreview(e.target.value);
                      }}
                      disabled={saving}
                    />
                  ) : (
                    <div className="upload-container">
                      <input
                        id="create-post-image"
                        type="file"
                        ref={createFileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        style={{ display: "none" }}
                        disabled={saving}
                      />

                      {imagePreview ? (
                        <div className="image-preview-box">
                          <img
                            src={imagePreview}
                            alt="Selected preview"
                            className="image-preview-thumb"
                          />
                          <div className="image-preview-info">
                            <span className="image-preview-badge">
                              {imageFile
                                ? "✓ File Ready to Upload on Post Creation"
                                : "✓ Image Attached"}
                            </span>
                            <span
                              className="image-preview-url"
                              title={
                                imageFile ? imageFile.name : formData.featuredImage
                              }
                            >
                              {imageFile
                                ? `${imageFile.name} (${formatFileSize(
                                    imageFile.size,
                                  )})`
                                : formData.featuredImage}
                            </span>
                            <div className="image-preview-actions">
                              <button
                                type="button"
                                className="btn-preview-change"
                                onClick={() => createFileInputRef.current?.click()}
                                disabled={saving}
                              >
                                Change Image
                              </button>
                              <button
                                type="button"
                                className="btn-preview-remove"
                                onClick={handleRemoveImage}
                                disabled={saving}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="upload-dropzone"
                          onClick={() =>
                            !saving && createFileInputRef.current?.click()
                          }
                        >
                          <div className="upload-prompt">
                            <span className="upload-icon">📷</span>
                            <div className="upload-text">
                              <strong>Click to choose featured image</strong>
                              <p>Supports PNG, JPG, WebP, GIF, SVG (max 10MB)</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ maxWidth: "240px" }}>
                  <label className="form-label" htmlFor="new-post-status">
                    Publication Status
                  </label>
                  <select
                    id="new-post-status"
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button
                    className="admin-btn admin-btn-primary"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? "Creating post & uploading..." : "+ Create Post"}
                  </button>
                </div>
              </form>
            </section>

            {/* Manage Posts Section */}
            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>All Posts</h2>
                  <p>Search, review, edit, and organize all your content.</p>
                </div>
              </div>

              {/* Filters */}
              <div className="post-filters">
                <div className="filter-search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    className="form-input search-input"
                    placeholder="Search posts by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="form-select filter-status-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Draft">Drafts Only</option>
                  <option value="Published">Published Only</option>
                </select>
              </div>

              {loading && <p className="loading-state">Loading posts...</p>}
              {error && (
                <div className="alert alert-error" role="alert">
                  {error}
                </div>
              )}

              {!loading && !error && filteredPosts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <h3>No matching posts found</h3>
                  <p>Try adjusting your search query or status filter.</p>
                </div>
              )}

              {/* Posts List */}
              {!loading && (
                <div className="posts-manage-list">
                  {filteredPosts.map((post) => (
                    <div key={post._id} className="post-row">
                      <div className="post-row-content">
                        {post.featuredImage && (
                          <img
                            src={post.featuredImage}
                            alt=""
                            className="post-row-thumb"
                          />
                        )}
                        <div className="post-row-main">
                          <div className="post-header-line">
                            <h3>{post.title}</h3>
                            <span
                              className={`badge ${
                                post.status === "published"
                                  ? "badge-published"
                                  : "badge-draft"
                              }`}
                            >
                              {post.status}
                            </span>
                          </div>
                          <p className="post-row-excerpt">{post.content}</p>
                        </div>

                        <div className="post-row-actions">
                          <button
                            className={`btn-action btn-status ${
                              post.status === "published"
                                ? "btn-unpublish"
                                : "btn-publish"
                            }`}
                            type="button"
                            onClick={() => handleToggleStatus(post)}
                            title="Toggle publication status"
                          >
                            {post.status === "published"
                              ? "Unpublish"
                              : "Publish"}
                          </button>

                          <button
                            className="btn-action btn-edit"
                            type="button"
                            onClick={() => handleEditClick(post)}
                            title="Edit this post"
                          >
                            Edit
                          </button>

                          <button
                            className="btn-action btn-delete"
                            type="button"
                            onClick={() => handlePromptDelete(post)}
                            title="Delete this post"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Pages Tab */}
        {activeTab === "Pages" && (
          <section className="content-card">
            <h2>Website Pages</h2>
            <p>Manage Home, About, Contact and other custom pages.</p>

            <div className="empty-state">
              <div className="empty-icon">▤</div>
              <h3>Pages management</h3>
              <p>Your saved pages will appear here after API integration.</p>
            </div>
          </section>
        )}

        {/* Media Library Tab */}
        {activeTab === "Media" && (
          <div className="media-view">
            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Media Library</h2>
                  <p>Upload, store, and manage images for your blog articles.</p>
                </div>

                <div>
                  <input
                    type="file"
                    ref={mediaFileInputRef}
                    onChange={handleMediaUpload}
                    accept="image/*"
                    style={{ display: "none" }}
                    disabled={mediaUploading}
                  />
                  <button
                    className="primary-button"
                    onClick={() => mediaFileInputRef.current?.click()}
                    disabled={mediaUploading}
                  >
                    {mediaUploading ? "Uploading..." : "+ Upload New Image"}
                  </button>
                </div>
              </div>

              {/* Upload Dropzone Banner */}
              <div
                className="media-upload-banner"
                onClick={() =>
                  !mediaUploading && mediaFileInputRef.current?.click()
                }
              >
                <span className="upload-banner-icon">📁</span>
                <div>
                  <strong>Drop images here, or click to upload</strong>
                  <p>Supports PNG, JPG, WebP, GIF, SVG up to 10MB per image</p>
                </div>
              </div>

              {mediaSuccess && (
                <div className="alert alert-info alert-dismissible" role="status">
                  <span>{mediaSuccess}</span>
                  <button
                    className="alert-close-btn"
                    onClick={() => setMediaSuccess("")}
                  >
                    ✕
                  </button>
                </div>
              )}
              {mediaError && (
                <div className="alert alert-error alert-dismissible" role="alert">
                  <span>{mediaError}</span>
                  <button
                    className="alert-close-btn"
                    onClick={() => setMediaError("")}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Media Grid */}
              {mediaLoading ? (
                <p className="loading-state">Loading media files...</p>
              ) : mediaItems.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">▧</div>
                  <h3>Your media library is empty</h3>
                  <p>
                    Upload your first photo to use as a featured image in your
                    blog posts.
                  </p>
                </div>
              ) : (
                <div className="media-grid">
                  {mediaItems.map((item) => (
                    <div key={item.filename} className="media-card">
                      <div className="media-card-thumb">
                        <img
                          src={item.url}
                          alt={item.filename}
                          loading="lazy"
                        />
                      </div>
                      <div className="media-card-details">
                        <strong
                          className="media-filename"
                          title={item.filename}
                        >
                          {item.filename}
                        </strong>
                        <span className="media-meta">
                          {formatFileSize(item.size)}
                        </span>

                        <div className="media-card-actions">
                          <button
                            type="button"
                            className="btn-media btn-media-copy"
                            onClick={() =>
                              handleCopyMediaUrl(item.url, item.filename)
                            }
                          >
                            {copiedFilename === item.filename
                              ? "✓ Copied"
                              : "Copy URL"}
                          </button>
                          <button
                            type="button"
                            className="btn-media btn-media-use"
                            onClick={() => handleUseMediaInNewPost(item.url)}
                          >
                            Use in Post
                          </button>
                          <button
                            type="button"
                            className="btn-media btn-media-delete"
                            onClick={() => handleDeleteMedia(item.filename)}
                            title="Delete Image"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "Settings" && (
          <section className="content-card">
            <h2>Settings</h2>
            <p>
              Website configuration, site metadata, and administrator settings.
            </p>

            <div className="settings-preview">
              <div className="settings-item">
                <strong>Site Name:</strong>
                <span>DevChronicle</span>
              </div>
              <div className="settings-item">
                <strong>Upload Destination:</strong>
                <span>Server /uploads directory</span>
              </div>
              <div className="settings-item">
                <strong>Admin Email:</strong>
                <span>admin@devchronicle.local</span>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
