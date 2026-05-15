import React from 'react';

const StatusBadge = ({ status, statusMap }) => {
  const s = statusMap[status] || { label: status, color: '#999', bg: '#f5f5f5' };

  const badgeStyle = {
    padding: '6px 12px',
    borderRadius: '10px',
    background: s.bg,
    color: s.color,
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block',
    minWidth: '65px',
    textAlign: 'center'
  };

  return <span style={badgeStyle}>{s.label}</span>;
};

export default StatusBadge;