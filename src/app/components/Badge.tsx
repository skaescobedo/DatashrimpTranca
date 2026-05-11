import React from 'react';

interface BadgeProps {
  status: string;
}

const config: Record<string, { bg: string; text: string; dot: string }> = {
  activo: { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  inactivo: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
  finalizado: { bg: '#e0e7ff', text: '#3730a3', dot: '#6366f1' },
  administrador: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  usuario: { bg: '#e0f2fe', text: '#075985', dot: '#0ea5e9' },
};

export function Badge({ status }: BadgeProps) {
  const c = config[status] || { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
      style={{ backgroundColor: c.bg, color: c.text, fontWeight: 500 }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
