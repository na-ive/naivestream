import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search - NaiveStream',
  description: 'Search for your favorite anime.',
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
