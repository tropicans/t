-- CreateIndex
CREATE INDEX "MicrositeClick_micrositeId_idx" ON "MicrositeClick"("micrositeId");

-- CreateIndex
CREATE INDEX "MicrositeClick_linkId_idx" ON "MicrositeClick"("linkId");

-- CreateIndex
CREATE INDEX "MicrositeClick_createdAt_idx" ON "MicrositeClick"("createdAt");

-- CreateIndex
CREATE INDEX "ShortLinkClick_shortLinkId_idx" ON "ShortLinkClick"("shortLinkId");

-- CreateIndex
CREATE INDEX "ShortLinkClick_createdAt_idx" ON "ShortLinkClick"("createdAt");
