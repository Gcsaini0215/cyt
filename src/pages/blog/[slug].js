// /blog/<title-words>-<_id>: the article page (same page as /blog-details, which now 301s here).
import BlogDetails, { getServerSideProps as articleProps } from "../blog-details";
import { blogIdFromSlug, blogSlug } from "../../utils/blog-slug";

export default BlogDetails;

export async function getServerSideProps(context) {
  const slug = String(context.params?.slug || "");
  const id = blogIdFromSlug(slug);
  if (!id) return { notFound: true };
  const res = await articleProps({ ...context, query: { ...context.query, id } });
  const blog = res?.props?.initialBlog;
  // title changed since the link was made -> the current slug (the id still finds the post)
  if (blog && blogSlug(blog) !== slug) {
    return { redirect: { destination: `/blog/${blogSlug(blog)}`, permanent: true } };
  }
  return res;
}
