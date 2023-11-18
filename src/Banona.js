import { useUser } from '@auth0/nextjs-auth0';
import matter from 'gray-matter';
import { useRouter } from 'next/router';
import Breadcrumbs from '../../components/Breadcrumbs';
import EditFooter from '../../components/EditFooter';
import FileViewer from '../../components/FileViewer';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import NavigationButtons from '../../components/NavigationButtons';
import styles from '../../styles/Markdown.module.css';
import {
  filterLinks,
  filterTree,
  getChildrenBySlug,
  getFileBySlug,
  getFolderTree,
  getSlugs,
  isDirectory,
} from '../../utils';
import { markdownToHtml } from '../../utils/markdown';

export async function getStaticPaths() {
  const paths = [];
  const slugs = getSlugs();
  for (const item of slugs) {
    paths.push({
      params: { slug: item.slug },
    });
  }
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const isDir = isDirectory(params.slug);
  const readFile = getFileBySlug(params.slug);
  const _slug = params.slug;
  const folders = filterTree(getFolderTree());
  const dirLinks = filterLinks(folders);
  const { data: frontmatter, content } = matter(readFile);
  const children = getChildrenBySlug(_slug) ? getChildrenBySlug(_slug).children : null;

  return {
    props: {
      frontmatter,
      htmlContent: await markdownToHtml(content, _slug, isDir),
      folders,
      _slug,
      isDir,
      dirLinks,
      children,
    },
  };
}

export default function Post({
  frontmatter,
  htmlContent,
  folders,
  _slug,
  isDir,
  dirLinks,
  children,
}) {
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const regEx = new RegExp('[_-]', 'g');
  if (isLoading) return <Loading />;
  if (error) return <div>{error.message}</div>;

  if (!user) {
    router.push('/');
  } else {
    return (
      <Layout isHome={false} folders={folders}>
        <div className={styles.container}>
          <div className={styles.breadCrumbs}>
            <Breadcrumbs slug={_slug} folders={folders} />
          </div>
          {frontmatter && frontmatter.title && <h1>{frontmatter.title}</h1>}
          <div className={styles.markdown} dangerouslySetInnerHTML={{ __html: htmlContent }} />
          <EditFooter slug={_slug} isDir={isDir}></EditFooter>
          {children && <FileViewer files={children} slug={_slug} />}
          <NavigationButtons links={dirLinks} slug={_slug}></NavigationButtons>
        </div>
      </Layout>
    );
  }
}