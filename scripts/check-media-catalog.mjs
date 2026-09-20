import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const catalogSource = readFileSync(new URL('../assets/media-catalog.js', import.meta.url), 'utf8');
const context = { globalThis: {} };
vm.runInNewContext(catalogSource, context, { filename: 'assets/media-catalog.js' });
const catalog = context.globalThis.StudioVMediaCatalog;

if (!catalog) throw new Error('media catalog did not register on globalThis');

const videoIds = catalog.videos.map((video) => video.driveId);
const showreelSlugs = catalog.showreelVideos.map((video) => video.slug);
const portfolioVideoSlugs = catalog.portfolioVideos.map((video) => video.slug);
const expectedPortfolioOrder = [
  'seoul-story',
  'aion-commercial',
  'tucson-print-campaign',
  'dealer-driving-plate',
  'lesserafim-overwatch',
  'beyond-the-set',
  'vp-technical-seminar',
  'genesis-print-campaign-01',
  'genesis-print-campaign-02',
  'avante-print-campaign'
];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(catalog.videos.length === 14, `expected 14 videos, got ${catalog.videos.length}`);
assert(new Set(videoIds).size === 14, 'Drive IDs must be unique in the catalog');
assert(catalog.showreelVideos.length === 8, `expected 8 Showreel videos, got ${catalog.showreelVideos.length}`);
assert(catalog.portfolioVideos.length === 6, `expected 6 Portfolio videos, got ${catalog.portfolioVideos.length}`);
assert(catalog.showreelVideos.filter((video) => video.aspect !== 'portrait').length === 4, 'Showreel landscape split changed');
assert(catalog.showreelVideos.filter((video) => video.aspect === 'portrait').length === 4, 'Showreel portrait split changed');
assert(catalog.photos.length === 4, `expected 4 Portfolio photos, got ${catalog.photos.length}`);
assert(catalog.photos.every((photo) => !photo.driveId), 'Photo-only records must not have video IDs');
assert(JSON.stringify(catalog.portfolioOrder) === JSON.stringify(expectedPortfolioOrder), 'Portfolio order changed');
assert(new Set(catalog.portfolioOrder).size === 10, 'Portfolio order must contain 10 unique records');
assert(catalog.portfolioOrder.every((slug) => catalog.portfolioVideos.some((video) => video.projectSlug === slug) || catalog.photos.some((photo) => photo.slug === slug)), 'Portfolio order contains an unknown record');
assert(showreelSlugs.every((slug) => !portfolioVideoSlugs.includes(slug)), 'page ownership overlap detected');

for (const file of ['assets/works.js', 'assets/showreel.js']) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  for (const driveId of videoIds) {
    assert(!source.includes(driveId), `${file} duplicates Drive ID ${driveId}`);
  }
}

console.log('Media catalog check passed: 14 unique Drive IDs, 8 Showreel, 6 Portfolio videos, 4 photos, ordered 10-card Portfolio.');
