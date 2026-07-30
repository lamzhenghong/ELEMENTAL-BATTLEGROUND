import assert from 'node:assert/strict';
import {
  BASE_BANNERS,
  getBannerArtworkLayout,
  getBannerGradient,
  getBannerImage
} from './bannerCatalog';

assert.deepEqual(
  BASE_BANNERS.map(banner => banner.id),
  ['char_banner_1', 'char_banner_2', 'weapon_banner_1']
);
assert.deepEqual(
  BASE_BANNERS.map(banner => banner.featured5StarId),
  ['aurelia', 'standard_banner', 'w_solar_searing']
);

assert.match(getBannerImage('aurelia', 'character'), /aurelia_banner\.jpg$/);
assert.match(getBannerImage('kaelen', 'character'), /kaelen_banner\.jpg$/);
assert.match(getBannerImage('maelis', 'character'), /maelis_banner\.jpg$/);
assert.match(getBannerImage('veyra', 'character'), /veyra_banner\.jpg$/);
assert.match(getBannerImage('standard_banner', 'character'), /standard_banner\.jpg$/);
assert.match(getBannerImage('anything', 'weapon'), /weapon_banner\.jpg$/);

assert.deepEqual(
  getBannerArtworkLayout('aurelia', 'character'),
  { desktopPosition: 'center 26%', mobilePosition: '66% 16%' }
);
assert.deepEqual(
  getBannerArtworkLayout('standard_banner', 'character'),
  { desktopPosition: '58% 30%', mobilePosition: '68% 25%' }
);
assert.deepEqual(
  getBannerArtworkLayout('anything', 'weapon'),
  { desktopPosition: '60% 40%', mobilePosition: '66% 38%' }
);

assert.match(getBannerGradient('aurelia', 'character'), /rgba\(16, 10, 10/);
assert.match(getBannerGradient('kaelen', 'character'), /rgba\(10, 16, 28/);
assert.match(getBannerGradient('maelis', 'character'), /rgba\(5, 20, 13/);
assert.match(getBannerGradient('veyra', 'character'), /rgba\(12, 8, 28/);
assert.match(getBannerGradient('standard_banner', 'character'), /rgba\(15, 12, 28/);
assert.match(getBannerGradient('anything', 'weapon'), /rgba\(15, 10, 15/);

console.log('gacha banner catalog rules ok');
