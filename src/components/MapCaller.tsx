'use client';

import dynamic from 'next/dynamic';

const LazyMap = dynamic(() => import("@/components/discovery-map"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

function MapCaller( props : any ) {
  return <LazyMap {...props} />;
}

export default MapCaller;
