import { Suspense } from 'react';
import FailureContent from './FailureContent';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-8">Loading failure page...</div>}>
      <FailureContent />
    </Suspense>
  );
}