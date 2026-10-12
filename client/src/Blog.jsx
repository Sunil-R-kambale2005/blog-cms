import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "./api";
import "./Blog.css";

const CURRENT_YEAR = new Date().getFullYear();

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    API.get("/posts/published")
      .then((response) => {
        const data = response.data;
        setPosts(Array.isArray(data) ? data : data.posts || []);
      })
      .catch((error) => console.error("Failed to load posts:", error))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Recently published";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently published";
    }
  };

  const calculateReadTime = (content) => {
    if (!content) return "1 min read";
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  const filteredPosts = posts.filter((post) => {
    const titleMatch = (post.title || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const contentMatch = (post.content || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return titleMatch || contentMatch;
  });

  return (
    <div className="blog-wrapper">
      {/* Top Navigation */}
      <header className="blog-navbar">
        <div className="blog-nav-container">
          <Link to="/" className="blog-brand">
            <span className="brand-icon">✦</span>
            <span>DevChronicle</span>
            <span className="brand-badge">Blog</span>
          </Link>

          <div className="blog-nav-actions">
            <Link to="/" className="nav-link">
              Articles
            </Link>
            <Link to="/admin" className="nav-cta-btn">
              <span>Admin Portal</span>
              <span>↗</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="blog-hero">
        <div className="hero-content">
          <div className="hero-pill">
            <span className="hero-pill-dot"></span>
            <span>The Modern Developer's Journal</span>
          </div>
          <h1 className="hero-title">
            Stories, Engineering & <span>Ideas</span>
          </h1>
          <p className="hero-description">
            Explore curated articles, technical deep dives, and product insights
            crafted for curious creators and developers.
          </p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <div className="blog-filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search published articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-badge-count">
          Showing {filteredPosts.length}{" "}
          {filteredPosts.length === 1 ? "article" : "articles"}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="blog-main">
        {loading ? (
          <div className="blog-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton-card">
                <div className="skeleton-media skeleton"></div>
                <div className="skeleton-body">
                  <div className="skeleton-line skeleton" style={{ width: "40%" }}></div>
                  <div className="skeleton-line title skeleton"></div>
                  <div className="skeleton-line skeleton"></div>
                  <div className="skeleton-line skeleton" style={{ width: "80%" }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="empty-posts-state">
            <span className="empty-posts-icon">📖</span>
            <h3>No articles found</h3>
            <p>
              {searchTerm
                ? `No articles match "${searchTerm}". Try another search term.`
                : "No published articles have been released yet. Check back soon or visit the Admin portal to publish content!"}
            </p>
            <Link to="/admin" className="nav-cta-btn">
              Go to CMS Admin
            </Link>
          </div>
        ) : (
          <div className="blog-grid">
            {filteredPosts.map((post) => (
              <article key={post._id} className="post-card">
                <Link to={`/posts/${post._id}`} className="card-media-wrapper">
                  {post.featuredImage ? (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="card-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="card-placeholder-image">
                      <span>✦</span>
                    </div>
                  )}
                  <span className="card-category-badge">Article</span>
                </Link>

                <div className="card-content">
                  <div className="card-meta">
                    <span>{formatDate(post.createdAt)}</span>
                    <span className="card-meta-dot"></span>
                    <span>{calculateReadTime(post.content)}</span>
                  </div>

                  <h2 className="card-title">
                    <Link to={`/posts/${post._id}`}>{post.title}</Link>
                  </h2>

                  <p className="card-excerpt">{post.content}</p>

                  <div className="card-footer">
                    <div className="card-author">
                      <div className="author-avatar">A</div>
                      <span className="author-name">Admin User</span>
                    </div>

                    <Link to={`/posts/${post._id}`} className="card-read-link">
                      <span>Read</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="blog-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="brand-icon">✦</span>
            <span>DevChronicle</span>
          </div>

          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/admin">Admin Dashboard</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {CURRENT_YEAR} DevChronicle Blog CMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Blog;
