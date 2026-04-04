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
    "/legacy-watch-images/man/man3.webp",
    "/legacy-watch-images/man/man5.webp"
  ],
  women: [
    "/legacy-watch-images/womens/womens1.jpg",
    "/legacy-watch-images/womens/womens4.webp",
    "/legacy-watch-images/womens/womens7.webp"
  ],
  kids: [
    "/legacy-watch-images/kids/kids1.avif",
    "/legacy-watch-images/kids/kids4.jpg",
    "/legacy-watch-images/kids/kids8.webp"
  ],
  luxury: [
    "/legacy-watch-images/rolex/rolex1.webp",
    "/legacy-watch-images/omega/omega11.avif",
    "/legacy-watch-images/SM/sm10.webp"
  ]
};

export function getCategoryLegacyImage(slug) {
  return categoryLegacyImageMap[slug] || "/legacy-watch-images/images/watch.webp";
}

export function getBrandLegacyImage(brand) {
  return brandLegacyImageMap[String(brand || "").toLowerCase()] || null;
}
