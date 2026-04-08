-- CreateTable
CREATE TABLE "SellerFulfillmentLog" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "previousStatus" "SellerItemStatus" NOT NULL,
    "nextStatus" "SellerItemStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerFulfillmentLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SellerFulfillmentLog" ADD CONSTRAINT "SellerFulfillmentLog_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerFulfillmentLog" ADD CONSTRAINT "SellerFulfillmentLog_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
