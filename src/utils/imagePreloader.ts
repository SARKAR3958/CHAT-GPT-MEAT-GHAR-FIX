import { preloadAllImages } from './preloadAssets';

export const ALL_APP_IMAGES = [
  '/images/hero_banner_meat_1790507616083.jpg',
  '/images/cat_chicken_1790504356265.jpg',
  '/images/cat_mutton_1790504374485.jpg',
  '/images/cat_fish_1790504389877.jpg',
  '/images/cat_eggs_1790504403080.jpg',
  '/images/cat_ready_to_cook_1790507566251.jpg',
  '/images/chicken_curry_cut_wide_1790508282856.jpg',
  '/images/mutton_boneless_wide_1790508301717.jpg',
  '/images/rohu_fish_wide_1790508321588.jpg',
  '/images/offer_chicken_card_1790507696774.jpg',
  '/images/offer_mutton_card_1790507713635.jpg',
  '/images/delivery_partner_avatar_1790502025354.jpg',
  '/images/map_delivery_illustration_1790502010289.jpg',
  '/images/bg_1790503776302.jpg',
];

export const preloadImages = async (): Promise<void> => {
  await preloadAllImages();
};

export default preloadImages;
