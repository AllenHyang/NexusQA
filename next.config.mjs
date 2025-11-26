const nextConfig = {
  experimental: {
    reactCompiler: true, // Enable the React Compiler
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
    ],
  },
};

export default nextConfig;
