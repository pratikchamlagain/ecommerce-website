import prisma from "../src/config/prisma.js";
import { resolveProductImageUrl } from "../src/utils/productImageStorage.js";

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      imageUrl: true
    }
  });

  let scanned = 0;
  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    scanned += 1;

    const currentImage = String(product.imageUrl || "").trim();

    if (!currentImage) {
      skipped += 1;
      continue;
    }

    const nextImage = await resolveProductImageUrl({
      imageUrl: currentImage,
      productName: product.name
    });

    if (nextImage === currentImage) {
      skipped += 1;
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { imageUrl: nextImage }
    });

    updated += 1;
  }

  console.log(`Recache complete. scanned=${scanned} updated=${updated} skipped=${skipped}`);
}

main()
  .catch((error) => {
    console.error("Recache failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
