import React from 'react';
import { blogsData } from '../../data/blogs-data';
import Link from "next/link";

export default function BlogSidebar() {
    const categories = [...new Set(blogsData.map(blog => blog.category))];
    const recentPosts = blogsData.slice(0, 3);

    return (
        <aside className="rbt-sidebar-wrapper">
            {/* Search Widget */}
            <div className="rbt-single-widget rbt-widget-search">
                <div className="inner">
                    <form action="#" className="rbt-search-style-1">
                        <input type="text" placeholder="Search Blogs..." />
                        <button className="search-btn" style={{ backgroundColor: '#228756', color: '#fff', borderRadius: '0 8px 8px 0' }}>
                            <i className="feather-search"></i>
                        </button>
                    </form>
                </div>
            </div>

            {/* Recent Posts Widget */}
            <div className="rbt-single-widget rbt-widget-recent-post">
                <div className="inner">
                    <h4 className="rbt-widget-title">Recent Posts</h4>
                    <ul className="rbt-sidebar-list-wrapper recent-post-list">
                        {recentPosts.map((post) => (
                            <li key={post.id}>
                                <div className="thumbnail">
                                    <Link href={post.link}>
                                        <img src={post.image} alt={post.title} style={{ borderRadius: '8px', width: '80px', height: '60px', objectFit: 'cover' }} />
                                    </Link>
                                </div>
                                <div className="content">
                                    <h6 className="title">
                                        <Link href={post.link}>{post.title}</Link>
                                    </h6>
                                    <ul className="rbt-meta">
                                        <li>
                                            <i className="feather-clock"></i>
                                            {post.date || 'Jan 08, 2026'}
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Categories Widget */}
            <div className="rbt-single-widget rbt-widget-categories">
                <div className="inner">
                    <h4 className="rbt-widget-title">Categories</h4>
                    <ul className="rbt-sidebar-list-wrapper">
                        {categories.map((category, index) => (
                            <li key={index}>
                                <Link href="/blogs">
                                    <span className="left-content">{category}</span>
                                    <span className="right-content">
                                        ({blogsData.filter(blog => blog.category === category).length})
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Popular Tags Widget */}
            <div className="rbt-single-widget rbt-widget-tag">
                <div className="inner">
                    <h4 className="rbt-widget-title">Popular Tags</h4>
                    <div className="rbt-tag-list">
                        <Link href="/blogs">Therapy</Link>
                        <Link href="/blogs">Mental Health</Link>
                        <Link href="/blogs">Well-being</Link>
                        <Link href="/blogs">Counselling</Link>
                        <Link href="/blogs">Self-care</Link>
                    </div>
                </div>
            </div>
        </aside>
    );
}
