-- CreateTable
CREATE TABLE "_UserToconversation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserToconversation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserToconversation_B_index" ON "_UserToconversation"("B");

-- AddForeignKey
ALTER TABLE "_UserToconversation" ADD CONSTRAINT "_UserToconversation_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToconversation" ADD CONSTRAINT "_UserToconversation_B_fkey" FOREIGN KEY ("B") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
