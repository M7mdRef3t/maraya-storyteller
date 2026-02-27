import React from 'react';

/**
 * LoadingMirror - Loading animation with mirror/reflection motif.
 * Displayed while scenes are being generated.
 */
export default function LoadingMirror({ statusText }) {
  return (
    <div className="loading-mirror">
      <div className="loading-mirror__orb">
        <div className="loading-mirror__orb-inner" />
        <div className="loading-mirror__orb-reflection" />
      </div>
      <p className="loading-mirror__text">{statusText || 'المرايا تتشكل...'}</p>
    </div>
  );
}
