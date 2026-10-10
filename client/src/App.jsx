import { useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const menuItems = ["Dashboard", "Posts", "Pages", "Media", "Settings"];

  return (
    <div className="admin-layout">
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
                <h2>0</h2>
                <span>Blog articles</span>
              </div>

              <div className="stat-card">
                <p>Total Pages</p>
                <h2>0</h2>
                <span>Website pages</span>
              </div>

              <div className="stat-card">
                <p>Published</p>
                <h2>0</h2>
                <span>Live content</span>
              </div>

              <div className="stat-card">
                <p>Drafts</p>
                <h2>0</h2>
                <span>Work in progress</span>
              </div>
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Recent Posts</h2>
                  <p>Your latest blog content will appear here.</p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setActiveTab("Posts")}
                >
                  + Manage Posts
                </button>
              </div>

              <div className="empty-state">
                <div className="empty-icon">✎</div>
                <h3>Your content journey starts here</h3>
                <p>Connect your API to display real blog posts.</p>
              </div>
            </section>
          </>
        )}

        {activeTab === "Posts" && (
          <section className="content-card">
            <h2>Blog Posts</h2>
            <p>Create, edit, publish and delete your blog articles.</p>
            <div className="empty-state">
              <div className="empty-icon">✎</div>
              <h3>Posts management</h3>
              <p>API connection is the next implementation step.</p>
            </div>
          </section>
        )}

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
