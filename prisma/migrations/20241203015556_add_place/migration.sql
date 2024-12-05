-- CreateTable
CREATE TABLE "Place" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "location" geometry(Point, 4326) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);
