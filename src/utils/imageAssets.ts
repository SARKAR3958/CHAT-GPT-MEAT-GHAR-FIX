// Direct eager static image imports for all Meat Ghar visual assets
const bgImg = '/images/bg_1790503776302.jpg';
const catChickenImg = '/images/cat_chicken_1790504356265.jpg';
const catColdCutsImg = '/images/cat_cold_cuts_1790508827963.jpg';
const catEggsImg = '/images/cat_eggs_1790504403080.jpg';
const catFishImg = '/images/cat_fish_1790504389877.jpg';
const catMuttonImg = '/images/cat_mutton_1790504374485.jpg';
const catPrawnsImg = '/images/cat_prawns_seafood_1790508815698.jpg';
const catReadyToCookImg = '/images/cat_ready_to_cook_1790507566251.jpg';
const catSpecialCutsImg = '/images/cat_special_cuts_1790507586236.jpg';
const chickenCurryWideImg = '/images/chicken_curry_cut_wide_1790508282856.jpg';
const curryCutChickenImg = '/images/curry_cut_chicken_1790507633294.jpg';
const deliveryPartnerImg = '/images/delivery_partner_avatar_1790502025354.jpg';
const heroBannerImg = '/images/hero_banner_meat_1790507616083.jpg';
const mapDeliveryImg = '/images/map_delivery_illustration_1790502010289.jpg';
const meatBottomPlatterImg = '/images/meat_bottom_platter_1790501395172.jpg';
const meatDelivery70Img = '/images/meat_delivery_70_1790501379469.jpg';
const onboarding1Img = '/images/meat_onboarding_1_1790501345494.jpg';
const onboarding2Img = '/images/meat_onboarding_2_1790501365087.jpg';
const muttonBonelessCubesImg = '/images/mutton_boneless_cubes_1790507651522.jpg';
const muttonBonelessWideImg = '/images/mutton_boneless_wide_1790508301717.jpg';
const offerChickenImg = '/images/offer_chicken_card_1790507696774.jpg';
const offerMuttonImg = '/images/offer_mutton_card_1790507713635.jpg';
const productRohuFishImg = '/images/product_rohu_fish_1790507600370.jpg';
const rohuFishWideImg = '/images/rohu_fish_wide_1790508321588.jpg';

export const STATIC_IMAGES: Record<string, string> = {
  'bg_1790503776302.jpg': bgImg,
  'cat_chicken_1790504356265.jpg': catChickenImg,
  'cat_cold_cuts_1790508827963.jpg': catColdCutsImg,
  'cat_eggs_1790504403080.jpg': catEggsImg,
  'cat_fish_1790504389877.jpg': catFishImg,
  'cat_mutton_1790504374485.jpg': catMuttonImg,
  'cat_prawns_seafood_1790508815698.jpg': catPrawnsImg,
  'cat_ready_to_cook_1790507566251.jpg': catReadyToCookImg,
  'cat_special_cuts_1790507586236.jpg': catSpecialCutsImg,
  'chicken_curry_cut_wide_1790508282856.jpg': chickenCurryWideImg,
  'curry_cut_chicken_1790507633294.jpg': curryCutChickenImg,
  'delivery_partner_avatar_1790502025354.jpg': deliveryPartnerImg,
  'hero_banner_meat_1790507616083.jpg': heroBannerImg,
  'map_delivery_illustration_1790502010289.jpg': mapDeliveryImg,
  'meat_bottom_platter_1790501395172.jpg': meatBottomPlatterImg,
  'meat_delivery_70_1790501379469.jpg': meatDelivery70Img,
  'meat_onboarding_1_1790501345494.jpg': onboarding1Img,
  'meat_onboarding_2_1790501365087.jpg': onboarding2Img,
  'mutton_boneless_cubes_1790507651522.jpg': muttonBonelessCubesImg,
  'mutton_boneless_wide_1790508301717.jpg': muttonBonelessWideImg,
  'offer_chicken_card_1790507696774.jpg': offerChickenImg,
  'offer_mutton_card_1790507713635.jpg': offerMuttonImg,
  'product_rohu_fish_1790507600370.jpg': productRohuFishImg,
  'rohu_fish_wide_1790508321588.jpg': rohuFishWideImg,
};

const imageMap:Record<string,string>={...STATIC_IMAGES};
Object.entries(STATIC_IMAGES).forEach(([filename,url])=>{imageMap[`/images/${filename}`]=url;});

/**
 * Returns the 100% reliable resolved URL for any image.
 */
export function getImageUrl(path: string | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  if (imageMap[path]) {
    return imageMap[path];
  }

  const filename = path.split('/').pop()?.split('?')[0];
  if (filename && imageMap[filename]) {
    return imageMap[filename];
  }

  if (filename && STATIC_IMAGES[filename]) {
    return STATIC_IMAGES[filename];
  }

  return path;
}

export default getImageUrl;
