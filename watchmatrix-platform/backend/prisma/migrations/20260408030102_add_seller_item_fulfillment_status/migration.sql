-- CreateEnum
CREATE TYPE "SellerItemStatus" AS ENUM ('PENDING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "sellerStatus" "SellerItemStatus" NOT NULL DEFAULT 'PENDING';
