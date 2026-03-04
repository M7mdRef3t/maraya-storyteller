import React from 'react';
import BrandMark from './BrandMark.jsx';

/**
 * LoadingMirror - Loading animation with mirror/reflection motif.
 * Displayed while scenes are being generated.
 */
export default function LoadingMirror({ statusText }) {
  return (
    <div className="loading-mirror">
      <BrandMark className="loading-mirror__brand" compact />
      <div className="loading-mirror__orb">
        <div className="loading-mirror__orb-inner" />
        <div className="loading-mirror__orb-reflection" />
      </div>
      <p className="loading-mirror__text">{statusText || 'Maraya is taking shape...'}</p>
    </div>
  );
}



