import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getTripBySlug } from '@/lib/data';
import { TripHeader } from '@/components/TripHeader';
import { TripPageClient } from '@/components/TripPageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TripPage({ params }: PageProps) {
  const { slug } = await params;
  const trip = getTripBySlug(slug);

  if (!trip) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <TripHeader trip={trip} />
      <main className="compact-cards mx-auto max-w-[1600px] px-3 pb-12 pt-0 md:px-6 md:pt-2">
        <Suspense fallback={null}>
          <TripPageClient trip={trip} />
        </Suspense>
      </main>
    </div>
  );
}
