'use client';
import { Column, Grid, Loading, Row } from '@umami/react-zen';
import Script from 'next/script';
import { useEffect } from 'react';
import { MobileNav } from '@/app/(main)/MobileNav';
import { SideNav } from '@/app/(main)/SideNav';
import { useConfig, useLoginQuery, useNavigation } from '@/components/hooks';
import { useApp } from '@/store/app';
import { UpdateNotice } from './UpdateNotice';

export function App({ children }) {
  const { user, isLoading, error } = useLoginQuery();
  const { theme } = useApp();
  const config = useConfig();
  const { pathname } = useNavigation();

  useEffect(() => {
    if (user?.backgroundUrl) {
      let imageUrl = user.backgroundUrl;
      if (imageUrl.startsWith('http')) {
        imageUrl = `${process.env.basePath || ''}/api/proxy?url=${encodeURIComponent(imageUrl)}`;
      }
      const url = `url(${JSON.stringify(imageUrl)})`;
      document.body.style.backgroundImage = url;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundColor = 'transparent';
      document.documentElement.style.backgroundColor = 'transparent';
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    }
  }, [user?.backgroundUrl]);

  if (isLoading || !config) {
    return <Loading placement="absolute" />;
  }

  if (error) {
    window.location.href = config.cloudMode
      ? `${process.env.cloudUrl}/login`
      : `${process.env.basePath || ''}/login`;
    return null;
  }

  if (!user || !config) {
    return null;
  }

  const isDark = theme === 'dark';
  const overlayColorSidebar = isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
  const overlayColorMain = isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)';

  const backgroundStyle = user?.backgroundUrl
    ? {
        backgroundColor: 'transparent',
      }
    : null;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: 'transparent' }}>
      <Grid
        columns={{ xs: '1fr', lg: 'auto 1fr' }}
        rows={{ xs: 'auto 1fr', lg: '1fr' }}
        height={{ xs: 'auto', lg: '100vh' }}
        width="100%"
        style={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'transparent',
        }}
      >
        <Row
          display={{ xs: 'flex', lg: 'none' }}
          alignItems="center"
          gap
          padding="3"
          style={
            backgroundStyle
              ? { backgroundColor: overlayColorSidebar, backdropFilter: 'blur(5px)' }
              : undefined
          }
        >
          <MobileNav />
        </Row>
        <Column
          display={{ xs: 'none', lg: 'flex' }}
          style={
            backgroundStyle
              ? { backgroundColor: overlayColorSidebar, backdropFilter: 'blur(5px)' }
              : undefined
          }
        >
          <SideNav />
        </Column>
        <Column
          alignItems="center"
          overflowY="auto"
          overflowX="hidden"
          position="relative"
          style={
            backgroundStyle
              ? { backgroundColor: overlayColorMain, backdropFilter: 'blur(2px)' }
              : undefined
          }
        >
          {children}
        </Column>
        <UpdateNotice user={user} config={config} />
        {process.env.NODE_ENV === 'production' && !pathname.includes('/share/') && (
          <Script src={`${process.env.basePath || ''}/telemetry.js`} />
        )}
      </Grid>
    </div>
  );
}
