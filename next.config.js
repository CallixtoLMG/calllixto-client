/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compiler: {
    styledComponents: true
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/historial-ventas",
        destination: "/ventas",
        permanent: false,
      },
      {
        source: "/",
        destination: "/ventas",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig
