export const categoryLegacyImageMap = {
  men: "/legacy-watch-images/man/man1.webp",
  women: "/legacy-watch-images/womens/womens1.jpg",
  kids: "/legacy-watch-images/kids/kids1.avif",
  luxury: "/legacy-watch-images/rolex/rolex1.webp"
};

export const brandLegacyImageMap = {
  rolex: "/legacy-watch-images/rolex/rolex3.jpg",
  omega: "/legacy-watch-images/omega/omega3.jpg",
  titan: "/legacy-watch-images/titan_img/titan4.jpg",
  fastrack: "/legacy-watch-images/man/man11.webp",
  casio: "/legacy-watch-images/digital/digital4.jpg",
  sonata: "/legacy-watch-images/womens/womens4.webp"
};

export const categoryLegacyGalleryMap = {
  men: [
    "/legacy-watch-images/man/man1.webp",
    "/legacy-watch-images/man/man2.jpg",
    "/legacy-watch-images/man/man3.webp",
    "/legacy-watch-images/man/man4.jpeg",
    "/legacy-watch-images/man/man5.webp",
    "/legacy-watch-images/man/man6.jpg",
    "/legacy-watch-images/man/man7.webp",
    "/legacy-watch-images/man/man8.webp",
    "/legacy-watch-images/man/man9.webp",
    "/legacy-watch-images/man/man10.webp",
    "/legacy-watch-images/man/man11.webp",
    "/legacy-watch-images/man/man12.webp"
  ],
  women: [
    "/legacy-watch-images/womens/womens1.jpg",
    "/legacy-watch-images/womens/womens2.avif",
    "/legacy-watch-images/womens/womens3.jpg",
    "/legacy-watch-images/womens/womens4.webp",
    "/legacy-watch-images/womens/womens5.jpg",
    "/legacy-watch-images/womens/womens6.avif",
    "/legacy-watch-images/womens/womens7.webp",
    "/legacy-watch-images/womens/womens8.webp"
  ],
  kids: [
    "/legacy-watch-images/kids/kids1.avif",
    "/legacy-watch-images/kids/kids2.jpg",
    "/legacy-watch-images/kids/kids3.jpg",
    "/legacy-watch-images/kids/kids4.jpg",
    "/legacy-watch-images/kids/kids5.jpg",
    "/legacy-watch-images/kids/kids6.avif",
    "/legacy-watch-images/kids/kids7.jpg",
    "/legacy-watch-images/kids/kids8.webp",
    "/legacy-watch-images/kids/kids9.jpg",
    "/legacy-watch-images/kids/kids10.webp"
  ],
  luxury: [
    "/legacy-watch-images/rolex/rolex1.webp",
    "/legacy-watch-images/rolex/rolex2.webp",
    "/legacy-watch-images/rolex/rolex3.jpg",
    "/legacy-watch-images/rolex/rolex4.jpg",
    "/legacy-watch-images/rolex/rolex5.webp",
    "/legacy-watch-images/rolex/rolex6.jpg",
    "/legacy-watch-images/rolex/rolex7.jpeg",
    "/legacy-watch-images/rolex/rolex8.webp",
    "/legacy-watch-images/rolex/rolex9.webp",
    "/legacy-watch-images/rolex/rolex10.webp",
    "/legacy-watch-images/rolex/rolex11.webp",
    "/legacy-watch-images/omega/omega1.avif",
    "/legacy-watch-images/omega/omega2.avif",
    "/legacy-watch-images/omega/omega3.jpg",
    "/legacy-watch-images/omega/omega4.jpg",
    "/legacy-watch-images/omega/omega5.webp",
    "/legacy-watch-images/omega/omega6.jpg",
    "/legacy-watch-images/omega/omega7.webp",
    "/legacy-watch-images/omega/omega8.webp",
    "/legacy-watch-images/omega/omega9.jpg",
    "/legacy-watch-images/omega/omega10.jpg",
    "/legacy-watch-images/omega/omega11.avif",
    "/legacy-watch-images/omega/omega12.avif",
    "/legacy-watch-images/omega/omega13.webp",
    "/legacy-watch-images/omega/omega14.webp",
    "/legacy-watch-images/omega/omega15.webp",
    "/legacy-watch-images/SM/sm1.webp",
    "/legacy-watch-images/SM/sm2.jpg",
    "/legacy-watch-images/SM/sm3.webp",
    "/legacy-watch-images/SM/sm4.webp",
    "/legacy-watch-images/SM/sm5.webp",
    "/legacy-watch-images/SM/sm7.webp",
    "/legacy-watch-images/SM/sm8.webp",
    "/legacy-watch-images/SM/sm9.webp",
    "/legacy-watch-images/SM/sm10.webp"
  ]
};

export function getCategoryLegacyImage(slug) {
  return categoryLegacyImageMap[slug] || "/legacy-watch-images/images/watch.webp";
}

export function getBrandLegacyImage(brand) {
  return brandLegacyImageMap[String(brand || "").toLowerCase()] || null;
}

export function getCategoryLegacyGallery(slug) {
  return categoryLegacyGalleryMap[slug] || [];
}
