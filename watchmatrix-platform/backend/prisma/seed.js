import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function assertSeedSafety() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PROD_SEED !== "true") {
    throw new Error("Seeding is blocked in production. Set ALLOW_PROD_SEED=true only if intentional.");
  }
}

async function main() {
  assertSeedSafety();

  const categories = [
    { name: "Men", slug: "men" },
    { name: "Women", slug: "women" },
    { name: "Kids", slug: "kids" },
    { name: "Luxury", slug: "luxury" }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category
    });
  }

  const categoryMap = {
    men: await prisma.category.findUnique({ where: { slug: "men" } }),
    women: await prisma.category.findUnique({ where: { slug: "women" } }),
    kids: await prisma.category.findUnique({ where: { slug: "kids" } }),
    luxury: await prisma.category.findUnique({ where: { slug: "luxury" } })
  };

  if (!categoryMap.men || !categoryMap.women || !categoryMap.kids || !categoryMap.luxury) {
    throw new Error("Category bootstrap failed. Cannot continue product seeding.");
  }

  const products = [
    {
      name: "Titan Neo Blue",
      slug: "titan-neo-blue",
      description: "Minimal stainless steel watch for daily wear.",
      brand: "Titan",
      price: 6200,
      stock: 15,
      imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
      categoryId: categoryMap.men.id
    },
    {
      name: "Titan Raga Rose",
      slug: "titan-raga-rose",
      description: "Elegant rose-gold finish designed for women.",
      brand: "Titan",
      price: 7800,
      stock: 12,
      imageUrl: "https://images.unsplash.com/photo-1547996160-81dfa63595aa",
      categoryId: categoryMap.women.id
    },
    {
      name: "Fastrack Pulse",
      slug: "fastrack-pulse",
      description: "Sporty chronograph with durable strap and lume hands.",
      brand: "Fastrack",
      price: 4500,
      stock: 20,
      imageUrl: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a",
      categoryId: categoryMap.men.id
    },
    {
      name: "Casio Youth Classic",
      slug: "casio-youth-classic",
      description: "Reliable entry-level watch for students.",
      brand: "Casio",
      price: 2800,
      stock: 30,
      imageUrl: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d",
      categoryId: categoryMap.kids.id
    },
    {
      name: "Rolex Submariner Inspired",
      slug: "rolex-submariner-inspired",
      description: "Diver style look with premium finishing details.",
      brand: "Rolex",
      price: 125000,
      stock: 4,
      imageUrl: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3",
      categoryId: categoryMap.luxury.id
    },
    {
      name: "Omega Sea Legend",
      slug: "omega-sea-legend",
      description: "Luxury chronometer with ceramic bezel and sapphire glass.",
      brand: "Omega",
      price: 189000,
      stock: 3,
      imageUrl: "https://images.unsplash.com/photo-1623998021446-45bcbf6f9d8f",
      categoryId: categoryMap.luxury.id
    },
    {
      name: "Kids Spark Digital",
      slug: "kids-spark-digital",
      description: "Colorful and light digital watch for kids.",
      brand: "Spark",
      price: 1990,
      stock: 24,
      imageUrl: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade",
      categoryId: categoryMap.kids.id
    },
    {
      name: "Sonata Velvet",
      slug: "sonata-velvet",
      description: "Slim profile women's watch with classy dial texture.",
      brand: "Sonata",
      price: 3900,
      stock: 16,
      imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d",
      categoryId: categoryMap.women.id
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        brand: product.brand,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId
      },
      create: product
    });
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
