import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

export default function HeadManager() {
  const { data } = useAdmin();
  const { seo } = data;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!seo?.redirects) return;
    const matchingRedirect = seo.redirects.find(r => r.from === location.pathname);
    if (matchingRedirect) {
      navigate(matchingRedirect.to, { replace: true });
    }
  }, [location.pathname, seo?.redirects, navigate]);

  if (!seo) return null;

  // Determine page type
  let pageKey = 'home';
  if (location.pathname === '/bos-venue') pageKey = 'venue';
  if (location.pathname === '/contact') pageKey = 'contact';
  if (location.pathname.startsWith('/sports')) pageKey = 'sports';

  const pageMeta = seo.pageMeta?.[pageKey] || { title: seo.defaultTitle, description: seo.defaultDescription };
  const title = pageMeta.title || seo.defaultTitle;
  const description = pageMeta.description || seo.defaultDescription;
  const canonical = pageMeta.canonical || seo.canonicalUrl;

  // Generate Local Business Schema
  const hasLocalInfo = seo.localSEO?.businessName && (seo.localSEO?.address || seo.localSEO?.phone);
  const localBusinessSchema = hasLocalInfo ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": seo.localSEO.businessName,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": seo.localSEO.address
    },
    "telephone": seo.localSEO.phone,
    "email": seo.localSEO.email,
    "openingHours": seo.localSEO.openingHours,
    "url": seo.canonicalUrl,
    "sameAs": Object.values(seo.socialLinks || {}).filter(Boolean)
  } : null;

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {pageMeta.noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={seo.openGraph?.title || title} />
      <meta property="og:description" content={seo.openGraph?.description || description} />
      {seo.openGraph?.image && <meta property="og:image" content={seo.openGraph.image} />}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={window.location.href} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={seo.twitterCard?.site || "@bosjol"} />
      <meta name="twitter:title" content={seo.twitterCard?.title || title} />
      <meta name="twitter:description" content={seo.twitterCard?.description || description} />
      {seo.twitterCard?.image && <meta name="twitter:image" content={seo.twitterCard.image} />}

      {/* Schema Markup */}
      {seo.schemaMarkup && (
        <script type="application/ld+json">
          {seo.schemaMarkup}
        </script>
      )}

      {/* Auto-Generated Local Business Schema */}
      {localBusinessSchema && (
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      )}

      {/* Google Search Console */}
      {seo.googleSearchConsoleId && (
        <meta name="google-site-verification" content={seo.googleSearchConsoleId} />
      )}

      {/* Custom Meta Tags */}
      {seo.metaTags?.map((tag, idx) => (
        <meta key={idx} name={tag.name} content={tag.content} />
      ))}

      {/* Google Analytics */}
      {seo.googleAnalyticsId && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${seo.googleAnalyticsId}`} />
      )}
      {seo.googleAnalyticsId && (
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${seo.googleAnalyticsId}');
          `}
        </script>
      )}

      {/* Google Tag Manager */}
      {seo.googleTagManagerId && (
        <script>
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${seo.googleTagManagerId}');
          `}
        </script>
      )}
    </Helmet>
  );
}
