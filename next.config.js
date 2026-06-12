/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Only AIChecked.nl (and the app itself, e.g. local dev) may iframe the widget.
        source: '/embed',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'self' https://aichecked.nl https://www.aichecked.nl",
          },
        ],
      },
      {
        source: '/embed.js',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=3600, must-revalidate' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
