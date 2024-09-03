-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateTable
CREATE TABLE "State" (
    "id" SERIAL NOT NULL,
    "state_code" INTEGER NOT NULL,
    "state_name" TEXT NOT NULL,
    "metadata" JSONB,
    "geometry" geometry NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" SERIAL NOT NULL,
    "district_code" INTEGER NOT NULL,
    "district_name" TEXT NOT NULL,
    "geometry" geometry NOT NULL,
    "metadata" JSONB,
    "stateId" INTEGER,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubDistrict" (
    "id" SERIAL NOT NULL,
    "subdistrict_code" INTEGER NOT NULL,
    "subdistrict_name" TEXT NOT NULL,
    "geometry" geometry NOT NULL,
    "metadata" JSONB,
    "districtId" INTEGER,
    "stateId" INTEGER,

    CONSTRAINT "SubDistrict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Village" (
    "id" SERIAL NOT NULL,
    "village_code" SERIAL NOT NULL,
    "geometry" geometry NOT NULL,
    "village_name" TEXT NOT NULL,
    "metadata" JSONB,
    "subDistrictId" INTEGER,
    "districtId" INTEGER,
    "stateId" INTEGER,

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "State_state_code_key" ON "State"("state_code");

-- CreateIndex
CREATE UNIQUE INDEX "State_state_name_key" ON "State"("state_name");

-- CreateIndex
CREATE UNIQUE INDEX "District_district_code_key" ON "District"("district_code");

-- CreateIndex
CREATE UNIQUE INDEX "SubDistrict_subdistrict_code_key" ON "SubDistrict"("subdistrict_code");

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("state_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubDistrict" ADD CONSTRAINT "SubDistrict_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("district_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubDistrict" ADD CONSTRAINT "SubDistrict_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("state_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_subDistrictId_fkey" FOREIGN KEY ("subDistrictId") REFERENCES "SubDistrict"("subdistrict_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("district_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("state_code") ON DELETE SET NULL ON UPDATE CASCADE;
