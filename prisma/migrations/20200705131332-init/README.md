# Migration `20200705131332-init`

This migration has been generated by Tane Morgan at 7/5/2020, 1:13:32 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
PRAGMA foreign_keys=OFF;

CREATE TABLE "quaint"."Link" (
"createdAt" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP ,"description" TEXT NOT NULL  ,"id" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,"postedById" INTEGER NOT NULL  ,"url" TEXT NOT NULL  ,FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE)

CREATE TABLE "quaint"."User" (
"email" TEXT NOT NULL  ,"id" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,"name" TEXT NOT NULL  ,"password" TEXT NOT NULL  )

CREATE TABLE "quaint"."Vote" (
"id" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,"linkId" INTEGER NOT NULL  ,"userId" INTEGER NOT NULL  ,FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE)

CREATE UNIQUE INDEX "quaint"."User.email" ON "User"("email")

CREATE UNIQUE INDEX "quaint"."Vote.linkId_userId" ON "Vote"("linkId","userId")

PRAGMA "quaint".foreign_key_check;

PRAGMA foreign_keys=ON;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20200705131332-init
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,36 @@
+datasource db {
+  provider = "sqlite"
+  url = "***"
+}
+
+generator client {
+  provider = "prisma-client-js"
+}
+
+model Link {
+  id          Int      @id @default(autoincrement())
+  createdAt   DateTime @default(now())
+  description String
+  url         String
+  postedBy    User     @relation(fields: [postedById], references: [id])
+  postedById  Int
+  votes       Vote[]
+}
+
+model User {
+  id       Int    @id @default(autoincrement())
+  name     String
+  email    String @unique
+  password String
+  links    Link[]
+  votes    Vote[]
+}
+
+model Vote {
+  id     Int  @id @default(autoincrement())
+  link   Link @relation(fields: [linkId], references: [id])
+  linkId Int
+  user   User @relation(fields: [userId], references: [id])
+  userId Int
+  @@unique([linkId, userId])
+}
```


