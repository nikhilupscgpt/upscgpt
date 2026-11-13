import OmrSparkLoader from '@/components/loader/OmrSparkLoader';

export const FULL_PAGE_CAPTIONS = [
  'Fetching 15 years of PYQs…',
  'Plotting Bab-el-Mandeb on the atlas…',
  'Applying −0.33 negative marking…',
  'Sorting questions by topic…',
];

export default function GlobalLoading() {
  return (
    <OmrSparkLoader
      size="full"
      showWordmark
      captions={FULL_PAGE_CAPTIONS}
    />
  );
}
