import { Suspense, lazy } from 'react';
import SuccessContent from './SuccessContent';

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-white p-8">Processing your order...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
