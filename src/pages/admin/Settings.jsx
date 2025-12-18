import React from 'react';
import Card from '../../components/ui/Card';

export default function Settings() {
  return (
    <Card title="Settings">
      <div className="text-sm text-zinc-600">
        Add hotel info, invoice footer, tax rules, service charge defaults, etc.
      </div>
    </Card>
  );
}
