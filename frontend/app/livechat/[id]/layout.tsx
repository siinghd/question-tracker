import ReactQueryProvider from '@/components/react-query-provider';
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
};

export default Layout;
