/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/widget',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'self' https://wimvanbreda.nl https://www.wimvanbreda.nl",
          },
        ],
      },
      {
        source: '/embed',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'self' https://wimvanbreda.nl https://www.wimvanbreda.nl",
          },
        ],
      },
      {
        source: '/widget.js',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=3600, must-revalidate' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
