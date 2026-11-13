import OmrSparkLoader from '@/components/loader/OmrSparkLoader';
import { FULL_PAGE_CAPTIONS } from '@/app/loading';

export default function SpeciesLoading() {
  return (
    <OmrSparkLoader
      size="full"
      showWordmark
      captions={FULL_PAGE_CAPTIONS}
    />
  );
}
