import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;
  return (
    <span className={`badge badge-${status.toLowerCase().replace('_', '_')}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
