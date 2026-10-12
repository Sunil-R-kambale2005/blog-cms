import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "./api";
import "./Blog.css";

const CURRENT_YEAR = new Date().getFullYear();

function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/posts/${id}`)
      .then((response) => {
        const data = response.data;
        setPost(data.post || data);
      })
      .catch(() => setError("Could not load this post."))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Recently published";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "long",
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

  return (
    <div className="blog-wrapper">
      {/* Top Navbar */}
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

      <main className="article-page">
        <Link to="/" className="article-back-link">
          ← Back to Articles
        </Link>

        {loading ? (
          <div>
            <div className="skeleton-line skeleton" style={{ width: "30%", height: "20px", marginBottom: "16px" }}></div>
            <div className="skeleton-line title skeleton" style={{ height: "48px", marginBottom: "24px" }}></div>
            <div className="skeleton-media skeleton" style={{ height: "350px", borderRadius: "16px", marginBottom: "32px" }}></div>
            <div className="skeleton-line skeleton" style={{ marginBottom: "12px" }}></div>
            <div className="skeleton-line skeleton" style={{ marginBottom: "12px" }}></div>
            <div className="skeleton-line skeleton" style={{ width: "70%" }}></div>
          </div>
        ) : error ? (
          <div className="empty-posts-state">
            <span className="empty-posts-icon">⚠️</span>
            <h3>Article Not Found</h3>
            <p>{error}</p>
            <Link to="/" className="nav-cta-btn">
              Return to Blog Home
            </Link>
          </div>
        ) : !post || post.status !== "published" ? (
          <div className="empty-posts-state">
            <span className="empty-posts-icon">🔒</span>
            <h3>Article Unavailable</h3>
            <p>This article is not currently published or has been moved to draft.</p>
            <Link to="/" className="nav-cta-btn">
              Return to Blog Home
            </Link>
          </div>
        ) : (
          <article>
            <header className="article-header">
              <div className="article-meta-bar">
                <span className="article-tag">Technology</span>
                <span className="article-date">{formatDate(post.createdAt)}</span>
                <span className="card-meta-dot"></span>
                <span className="article-reading-time">{calculateReadTime(post.content)}</span>
              </div>

              <h1 className="article-title">{post.title}</h1>

              <div className="article-author-row">
                <div className="article-author-avatar">A</div>
                <div className="article-author-info">
                  <strong>Admin User</strong>
                  <span>Editorial Contributor</span>
                </div>
              </div>
            </header>

            {post.featuredImage && (
              <div className="article-image-container">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="article-image"
                />
              </div>
            )}

            <div className="article-content">
              {post.content}
            </div>

            <div className="article-footer-box">
              <div className="card-author">
                <div className="article-author-avatar">A</div>
                <div>
                  <strong>Admin User</strong>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-muted)" }}>
                    Published on DevChronicle. Thank you for reading!
                  </p>
                </div>
              </div>

              <Link to="/" className="nav-cta-btn">
                ← Back to All Articles
              </Link>
            </div>
          </article>
        )}
      </main>

      {/* Footer */}
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

export default PostDetails;
