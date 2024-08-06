-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateTable
CREATE TABLE "State" (
    "id" SERIAL NOT NULL,
    "stcode11" INTEGER NOT NULL,
    "stname" TEXT NOT NULL,
    "levelLocationName" TEXT NOT NULL,
    "stname_sh" TEXT NOT NULL,
    "shape_length" DOUBLE PRECISION NOT NULL,
    "shape_area" DOUBLE PRECISION NOT NULL,
    "state_lgd" INTEGER NOT NULL,
    "max_simp_tol" INTEGER NOT NULL,
    "metadata" JSONB,
    "min_simp_tol" INTEGER NOT NULL,
    "geometry" geometry NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" SERIAL NOT NULL,
    "dtcode11" INTEGER NOT NULL,
    "dtname" TEXT NOT NULL,
    "levelLocationName" TEXT NOT NULL,
    "year_stat" TEXT NOT NULL,
    "shape_length" DOUBLE PRECISION NOT NULL,
    "shape_area" DOUBLE PRECISION NOT NULL,
    "dist_lgd" INTEGER NOT NULL,
    "geometry" geometry NOT NULL,
    "metadata" JSONB,
    "stateId" INTEGER,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubDistrict" (
    "id" SERIAL NOT NULL,
    "sdtcode11" INTEGER NOT NULL,
    "sdtname" TEXT NOT NULL,
    "levelLocationName" TEXT NOT NULL,
    "Shape_Length" DOUBLE PRECISION NOT NULL,
    "Shape_Area" DOUBLE PRECISION NOT NULL,
    "Subdt_LGD" INTEGER NOT NULL,
    "geometry" geometry NOT NULL,
    "metadata" JSONB,
    "districtId" INTEGER,
    "stateId" INTEGER,

    CONSTRAINT "SubDistrict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Village" (
    "id" SERIAL NOT NULL,
    "vgcode" SERIAL NOT NULL,
    "geometry" geometry NOT NULL,
    "vgname" TEXT NOT NULL,
    "metadata" JSONB,
    "subDistrictId" INTEGER,
    "districtId" INTEGER,
    "stateId" INTEGER,

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "State_stcode11_key" ON "State"("stcode11");

-- CreateIndex
CREATE UNIQUE INDEX "State_stname_key" ON "State"("stname");

-- CreateIndex
CREATE UNIQUE INDEX "District_dtcode11_key" ON "District"("dtcode11");

-- CreateIndex
CREATE UNIQUE INDEX "SubDistrict_sdtcode11_key" ON "SubDistrict"("sdtcode11");

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("stcode11") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubDistrict" ADD CONSTRAINT "SubDistrict_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("dtcode11") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubDistrict" ADD CONSTRAINT "SubDistrict_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("stcode11") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_subDistrictId_fkey" FOREIGN KEY ("subDistrictId") REFERENCES "SubDistrict"("sdtcode11") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("dtcode11") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("stcode11") ON DELETE SET NULL ON UPDATE CASCADE;
