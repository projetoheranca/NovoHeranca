// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.stripe.com https://js.stripe.com https://checkout.stripe.com https://www.google.com https://www.gstatic.com https://apis.google.com https://*.googleapis.com https://*.firebaseio.com https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://analytics.google.com https://stats.g.doubleclick.net;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com https://*.stripe.com;
      img-src 'self' blob: data: https://*.stripe.com https://placehold.co https://images.unsplash.com https://picsum.photos https://storage.googleapis.com https://firebasestorage.googleapis.com https://*.googleapis.com https://*.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://www.google.com.br https://stats.g.doubleclick.net;
      media-src 'self' blob: https://storage.googleapis.com https://firebasestorage.googleapis.com;
      font-src 'self' https://fonts.gstatic.com https://*.gstatic.com;
      frame-src 'self' https://*.stripe.com https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://accounts.google.com https://*.firebaseapp.com https://www.google.com https://*.google.com https://www.googletagmanager.com;
      connect-src 'self' https://*.stripe.com https://api.stripe.com https://checkout.stripe.com https://*.googleapis.com wss://*.firebaseio.com https://*.firebase.com https://www.google-analytics.com https://region1.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://analytics.google.com https://www.google.com https://stats.g.doubleclick.net;
      form-action 'self' https://*.stripe.com https://checkout.stripe.com;
    `;
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
