import Link from "next/link";
import LazyImage from "../../utils/lazy-image";
export default function ServiceDetails(props) {
  return (
    <div className="rbt-blog-details-area rbt-section-gapBottom breadcrumb-style-max-width">
      <div className="blog-content-wrapper rbt-article-content-wrapper">
        <div className="content">
          <div className="post-thumbnail mb--30 position-relative wp-block-image alignwide">
            <figure>
              <LazyImage
                alt="Blog"
                dim={"645-1085"}
                src={`https://dev.chooseyourtherapist.in/images/${props.data.image}`}
              />
              <figcaption>{props.data.image_caption}</figcaption>
            </figure>
          </div>
          <p>{props.data.long_desc}</p>
          <blockquote className="wp-block-quote">
            <p>{props.data.quote}</p>
            <cite>
              <Link href={"#"}>{props.data.author}</Link>
            </cite>
          </blockquote>
          <div
            style={{
              height: 110,
              width: "100%",
              background: "#eae9ea",
              marginBottom: 20,
            }}
          >
            <div style={{ justifyContent: "center", display: "flex" }}>
              <span style={{ fontSize: 12, padding: 0, margin: 0 }}>
                Advertisement
              </span>
            </div>
          </div>

          {props.data.content.map((item, index) => {
            return (
              <div key={index}>
                <h4>{item.heading}</h4>
                <div
                  style={{ marginBottom: 20 }}
                  dangerouslySetInnerHTML={{
                    __html: item.desc,
                  }}
                ></div>
                {props.data.content.length > 1 && index === 1 && (
                  <div
                    className="wp-block-gallery columns-3 is-cropped"
                    style={{ marginTop: 20 }}
                  >
                    <ul className="blocks-gallery-grid">
                      {props.data.images.map((img, index) => {
                        return (
                          <li className="blocks-gallery-item" key={index}>
                            <figure>
                              <LazyImage
                                alt={props.data.img_caption}
                                dim={"143-255"}
                                className="radius-4"
                                src={`https://dev.chooseyourtherapist.in/images/${img}`}
                              />
                            </figure>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          <div className="tagcloud" style={{ marginTop: 20 }}>
            {props.data.tags.map((tag, index) => {
              return (
                <Link href="/" key={index}>
                  {tag}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
