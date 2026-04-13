// src/app.ts
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express5 from "express";

// src/app/config/env.ts
import dotenv from "dotenv";
dotenv.config();
var loadEnvVariable = () => {
  const requiredVariable = [
    "PORT",
    "NODE_ENV",
    "DATABASE_URL",
    "FRONTEND_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "APP_USER",
    "APP_PASS",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET"
  ];
  requiredVariable.forEach((variable) => {
    if (process.env[variable] === void 0) {
      throw new Error(`Environment variable ${variable} is not defined`);
    }
  });
  return {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    APP_PASS: process.env.APP_PASS,
    APP_USER: process.env.APP_USER,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
  };
};
var envVars = loadEnvVariable();

// src/app/middleware/globalErrorHandler.ts
import status2 from "http-status";
import z from "zod";

// src/app/errorHelpers/handleZodError.ts
import status from "http-status";
var handleZodError = (err) => {
  const statusCode = status.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSources = [];
  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join(" => "),
      message: issue.message
    });
  });
  return {
    success: false,
    message,
    errorSources,
    statusCode
  };
};

// src/app/errorHelpers/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/app/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from Global Error Handler", err);
  }
  let errorSources = [];
  let statusCode = status2.INTERNAL_SERVER_ERROR;
  let message = "Internal server error";
  let stack = void 0;
  if (err instanceof z.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = simplifiedError.stack;
  } else if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  } else if (err instanceof Error) {
    statusCode = status2.BAD_REQUEST;
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  }
  const errorResponse = {
    success: false,
    message,
    errorSources,
    error: envVars.NODE_ENV === "development" ? err : void 0,
    stack: envVars.NODE_ENV === "development" ? stack : void 0
  };
  res.status(statusCode).json(errorResponse);
};

// src/app/middleware/notFound.ts
import status3 from "http-status";
var notFound = (req, res, next) => {
  res.status(status3.NOT_FOUND).json({
    success: false,
    message: "Not Found",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API Not Found"
      }
    ]
  });
  next();
};
var notFound_default = notFound;

// src/app.ts
import status17 from "http-status";

// src/app/shared/sendResponse.ts
var sendResponse = (res, responseData) => {
  const { statusCode, success, message, data, meta } = responseData;
  res.status(statusCode).json({
    success,
    statusCode,
    message,
    data,
    meta
  });
};

// src/app/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/app/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.4.0",
  "engineVersion": "ab56fe763f921d033a6c195e7ddeb3e255bdbb57",
  "activeProvider": "postgresql",
  "inlineSchema": 'model Blogs {\n  id        Int      @id @default(autoincrement())\n  title     String\n  slug      String   @unique\n  content   String   @db.Text\n  thumbnail String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel Category {\n  id   String @id @default(uuid())\n  name String @unique\n  slug String @unique\n\n  meals Meal[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nenum Role {\n  ADMIN\n  PROVIDER\n  CUSTOMER\n  DRIVER\n  SUPPORT\n}\n\nenum UserStatus {\n  ACTIVE\n  INACTIVE\n  BLOCKED\n  DELETED\n}\n\nenum OrderStatus {\n  PENDING\n  ACCEPTED\n  COOKING\n  ON_THE_WAY\n  DELIVERED\n  CANCELLED\n}\n\nenum PaymentType {\n  COD\n}\n\nmodel Meal {\n  id          String          @id @default(uuid())\n  providerId  String\n  categoryId  String\n  name        String\n  description String?\n  price       Float\n  image       String?\n  isAvailable Boolean         @default(true)\n  calories    Int\n  ingredients String[]        @default([])\n  cuisine     String?\n  dietary     String[]        @default([])\n  mealType    String?\n  spiceLevel  String?\n  provider    ProviderProfile @relation(fields: [providerId], references: [id])\n  category    Category        @relation(fields: [categoryId], references: [id])\n  reviews     Review[]\n  orderItems  OrderItem[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel Order {\n  id          String      @id @default(uuid())\n  orderNumber String?     @unique\n  userId      String\n  providerId  String\n  totalAmount Float\n  status      OrderStatus\n  address     String\n  paymentType PaymentType @default(COD)\n\n  user     User            @relation(fields: [userId], references: [id])\n  provider ProviderProfile @relation(fields: [providerId], references: [id])\n  items    OrderItem[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel OrderItem {\n  id       String @id @default(uuid())\n  orderId  String\n  mealId   String\n  price    Float\n  quantity Int\n\n  order Order @relation(fields: [orderId], references: [id])\n  meal  Meal  @relation(fields: [mealId], references: [id])\n}\n\nmodel ProviderProfile {\n  id          String  @id @default(uuid())\n  userId      String  @unique\n  shopName    String\n  description String?\n  address     String\n  phone       String\n  isOpen      Boolean @default(true)\n\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  meals     Meal[]\n  orders    Order[]\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel Review {\n  id      String  @id @default(uuid())\n  userId  String\n  mealId  String\n  rating  Int\n  comment String?\n\n  user User @relation(fields: [userId], references: [id])\n  meal Meal @relation(fields: [mealId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([userId, mealId], name: "unique_user_meal_review")\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id            String     @id\n  name          String\n  email         String\n  emailVerified Boolean    @default(false)\n  image         String?\n  role          Role       @default(CUSTOMER)\n  status        UserStatus @default(ACTIVE)\n  phone         String?\n  createdAt     DateTime   @default(now())\n  updatedAt     DateTime   @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n\n  providerProfile ProviderProfile?\n  orders          Order[]\n  reviews         Review[]\n  blogs           Blogs[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Blogs":{"fields":[{"name":"id","kind":"scalar","type":"Int"},{"name":"title","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"thumbnail","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"BlogsToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"meals","kind":"object","type":"Meal","relationName":"CategoryToMeal"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Meal":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"image","kind":"scalar","type":"String"},{"name":"isAvailable","kind":"scalar","type":"Boolean"},{"name":"calories","kind":"scalar","type":"Int"},{"name":"ingredients","kind":"scalar","type":"String"},{"name":"cuisine","kind":"scalar","type":"String"},{"name":"dietary","kind":"scalar","type":"String"},{"name":"mealType","kind":"scalar","type":"String"},{"name":"spiceLevel","kind":"scalar","type":"String"},{"name":"provider","kind":"object","type":"ProviderProfile","relationName":"MealToProviderProfile"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToMeal"},{"name":"reviews","kind":"object","type":"Review","relationName":"MealToReview"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"MealToOrderItem"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Order":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderNumber","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"totalAmount","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"address","kind":"scalar","type":"String"},{"name":"paymentType","kind":"enum","type":"PaymentType"},{"name":"user","kind":"object","type":"User","relationName":"OrderToUser"},{"name":"provider","kind":"object","type":"ProviderProfile","relationName":"OrderToProviderProfile"},{"name":"items","kind":"object","type":"OrderItem","relationName":"OrderToOrderItem"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"OrderItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"mealId","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToOrderItem"},{"name":"meal","kind":"object","type":"Meal","relationName":"MealToOrderItem"}],"dbName":null},"ProviderProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"shopName","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"isOpen","kind":"scalar","type":"Boolean"},{"name":"user","kind":"object","type":"User","relationName":"ProviderProfileToUser"},{"name":"meals","kind":"object","type":"Meal","relationName":"MealToProviderProfile"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToProviderProfile"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"mealId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"meal","kind":"object","type":"Meal","relationName":"MealToReview"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"phone","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"providerProfile","kind":"object","type":"ProviderProfile","relationName":"ProviderProfileToUser"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"},{"name":"blogs","kind":"object","type":"Blogs","relationName":"BlogsToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","provider","meals","_count","category","meal","reviews","items","order","orderItems","orders","providerProfile","blogs","Blogs.findUnique","Blogs.findUniqueOrThrow","Blogs.findFirst","Blogs.findFirstOrThrow","Blogs.findMany","data","Blogs.createOne","Blogs.createMany","Blogs.createManyAndReturn","Blogs.updateOne","Blogs.updateMany","Blogs.updateManyAndReturn","create","update","Blogs.upsertOne","Blogs.deleteOne","Blogs.deleteMany","having","_avg","_sum","_min","_max","Blogs.groupBy","Blogs.aggregate","Category.findUnique","Category.findUniqueOrThrow","Category.findFirst","Category.findFirstOrThrow","Category.findMany","Category.createOne","Category.createMany","Category.createManyAndReturn","Category.updateOne","Category.updateMany","Category.updateManyAndReturn","Category.upsertOne","Category.deleteOne","Category.deleteMany","Category.groupBy","Category.aggregate","Meal.findUnique","Meal.findUniqueOrThrow","Meal.findFirst","Meal.findFirstOrThrow","Meal.findMany","Meal.createOne","Meal.createMany","Meal.createManyAndReturn","Meal.updateOne","Meal.updateMany","Meal.updateManyAndReturn","Meal.upsertOne","Meal.deleteOne","Meal.deleteMany","Meal.groupBy","Meal.aggregate","Order.findUnique","Order.findUniqueOrThrow","Order.findFirst","Order.findFirstOrThrow","Order.findMany","Order.createOne","Order.createMany","Order.createManyAndReturn","Order.updateOne","Order.updateMany","Order.updateManyAndReturn","Order.upsertOne","Order.deleteOne","Order.deleteMany","Order.groupBy","Order.aggregate","OrderItem.findUnique","OrderItem.findUniqueOrThrow","OrderItem.findFirst","OrderItem.findFirstOrThrow","OrderItem.findMany","OrderItem.createOne","OrderItem.createMany","OrderItem.createManyAndReturn","OrderItem.updateOne","OrderItem.updateMany","OrderItem.updateManyAndReturn","OrderItem.upsertOne","OrderItem.deleteOne","OrderItem.deleteMany","OrderItem.groupBy","OrderItem.aggregate","ProviderProfile.findUnique","ProviderProfile.findUniqueOrThrow","ProviderProfile.findFirst","ProviderProfile.findFirstOrThrow","ProviderProfile.findMany","ProviderProfile.createOne","ProviderProfile.createMany","ProviderProfile.createManyAndReturn","ProviderProfile.updateOne","ProviderProfile.updateMany","ProviderProfile.updateManyAndReturn","ProviderProfile.upsertOne","ProviderProfile.deleteOne","ProviderProfile.deleteMany","ProviderProfile.groupBy","ProviderProfile.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","AND","OR","NOT","id","identifier","value","expiresAt","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","accountId","providerId","userId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","name","email","emailVerified","image","Role","role","UserStatus","status","phone","every","some","none","mealId","rating","comment","shopName","description","address","isOpen","orderId","price","quantity","orderNumber","totalAmount","OrderStatus","PaymentType","paymentType","categoryId","isAvailable","calories","ingredients","cuisine","dietary","mealType","spiceLevel","has","hasEvery","hasSome","slug","title","content","thumbnail","unique_user_meal_review","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","push","increment","decrement","multiply","divide"]'),
  graph: "twVosAEMAwAA2gIAIMoBAADrAgAwywEAACcAEMwBAADrAgAwzQECAAAAAdEBQAC1AgAh0gFAALUCACHgAQEAtAIAIZECAQAAAAGSAgEAtAIAIZMCAQC0AgAhlAIBAMsCACEBAAAAAQAgDAMAANoCACDKAQAA_AIAMMsBAAADABDMAQAA_AIAMM0BAQC0AgAh0AFAALUCACHRAUAAtQIAIdIBQAC1AgAh4AEBALQCACHoAQEAtAIAIekBAQDLAgAh6gEBAMsCACEDAwAAxQQAIOkBAACCAwAg6gEAAIIDACAMAwAA2gIAIMoBAAD8AgAwywEAAAMAEMwBAAD8AgAwzQEBAAAAAdABQAC1AgAh0QFAALUCACHSAUAAtQIAIeABAQC0AgAh6AEBAAAAAekBAQDLAgAh6gEBAMsCACEDAAAAAwAgAQAABAAwAgAABQAgEQMAANoCACDKAQAA-gIAMMsBAAAHABDMAQAA-gIAMM0BAQC0AgAh0QFAALUCACHSAUAAtQIAId4BAQC0AgAh3wEBALQCACHgAQEAtAIAIeEBAQDLAgAh4gEBAMsCACHjAQEAywIAIeQBQAD7AgAh5QFAAPsCACHmAQEAywIAIecBAQDLAgAhCAMAAMUEACDhAQAAggMAIOIBAACCAwAg4wEAAIIDACDkAQAAggMAIOUBAACCAwAg5gEAAIIDACDnAQAAggMAIBEDAADaAgAgygEAAPoCADDLAQAABwAQzAEAAPoCADDNAQEAAAAB0QFAALUCACHSAUAAtQIAId4BAQC0AgAh3wEBALQCACHgAQEAtAIAIeEBAQDLAgAh4gEBAMsCACHjAQEAywIAIeQBQAD7AgAh5QFAAPsCACHmAQEAywIAIecBAQDLAgAhAwAAAAcAIAEAAAgAMAIAAAkAIA8DAADaAgAgBwAA2wIAIA8AANECACDKAQAA2QIAMMsBAAALABDMAQAA2QIAMM0BAQC0AgAh0QFAALUCACHSAUAAtQIAIeABAQC0AgAh8wEBALQCACH6AQEAtAIAIfsBAQDLAgAh_AEBALQCACH9ASAAygIAIQEAAAALACAXBgAA8QIAIAkAAPkCACALAADSAgAgDgAA8gIAIMoBAAD4AgAwywEAAA0AEMwBAAD4AgAwzQEBALQCACHRAUAAtQIAIdIBQAC1AgAh3wEBALQCACHrAQEAtAIAIe4BAQDLAgAh-wEBAMsCACH_AQgA7gIAIYYCAQC0AgAhhwIgAMoCACGIAgIA7AIAIYkCAADnAgAgigIBAMsCACGLAgAA5wIAIIwCAQDLAgAhjQIBAMsCACEJBgAAtwQAIAkAAPAEACALAAC5BAAgDgAA7QQAIO4BAACCAwAg-wEAAIIDACCKAgAAggMAIIwCAACCAwAgjQIAAIIDACAXBgAA8QIAIAkAAPkCACALAADSAgAgDgAA8gIAIMoBAAD4AgAwywEAAA0AEMwBAAD4AgAwzQEBAAAAAdEBQAC1AgAh0gFAALUCACHfAQEAtAIAIesBAQC0AgAh7gEBAMsCACH7AQEAywIAIf8BCADuAgAhhgIBALQCACGHAiAAygIAIYgCAgDsAgAhiQIAAOcCACCKAgEAywIAIYsCAADnAgAgjAIBAMsCACGNAgEAywIAIQMAAAANACABAAAOADACAAAPACADAAAADQAgAQAADgAwAgAADwAgAQAAAA0AIAwDAADaAgAgCgAA9QIAIMoBAAD3AgAwywEAABMAEMwBAAD3AgAwzQEBALQCACHRAUAAtQIAIdIBQAC1AgAh4AEBALQCACH3AQEAtAIAIfgBAgDsAgAh-QEBAMsCACEDAwAAxQQAIAoAAO8EACD5AQAAggMAIA0DAADaAgAgCgAA9QIAIMoBAAD3AgAwywEAABMAEMwBAAD3AgAwzQEBAAAAAdEBQAC1AgAh0gFAALUCACHgAQEAtAIAIfcBAQC0AgAh-AECAOwCACH5AQEAywIAIZUCAAD2AgAgAwAAABMAIAEAABQAMAIAABUAIAoKAAD1AgAgDQAA9AIAIMoBAADzAgAwywEAABcAEMwBAADzAgAwzQEBALQCACH3AQEAtAIAIf4BAQC0AgAh_wEIAO4CACGAAgIA7AIAIQIKAADvBAAgDQAA7gQAIAoKAAD1AgAgDQAA9AIAIMoBAADzAgAwywEAABcAEMwBAADzAgAwzQEBAAAAAfcBAQC0AgAh_gEBALQCACH_AQgA7gIAIYACAgDsAgAhAwAAABcAIAEAABgAMAIAABkAIAMAAAAXACABAAAYADACAAAZACABAAAAFwAgAQAAABMAIAEAAAAXACAQAwAA2gIAIAYAAPECACAMAADyAgAgygEAAO0CADDLAQAAHwAQzAEAAO0CADDNAQEAtAIAIdEBQAC1AgAh0gFAALUCACHfAQEAtAIAIeABAQC0AgAh8gEAAO8ChAIi_AEBALQCACGBAgEAywIAIYICCADuAgAhhQIAAPAChQIiBAMAAMUEACAGAAC3BAAgDAAA7QQAIIECAACCAwAgEAMAANoCACAGAADxAgAgDAAA8gIAIMoBAADtAgAwywEAAB8AEMwBAADtAgAwzQEBAAAAAdEBQAC1AgAh0gFAALUCACHfAQEAtAIAIeABAQC0AgAh8gEAAO8ChAIi_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_wEIAAAAAYYCAQAAAAGHAiAAAAABiAICAAAAAYkCAACQBAAgigIBAAAAAYsCAACRBAAgjAIBAAAAAY0CAQAAAAEBFwAAYgAgEM0BAQAAAAHRAUAAAAAB0gFAAAAAAd8BAQAAAAHrAQEAAAAB7gEBAAAAAfsBAQAAAAH_AQgAAAABhgIBAAAAAYcCIAAAAAGIAgIAAAABiQIAAJAEACCKAgEAAAABiwIAAJEEACCMAgEAAAABjQIBAAAAAQEXAABkADABFwAAZAAwFAYAANYEACAJAAD2AwAgCwAA9wMAIA4AAPgDACDNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHfAQEAgAMAIesBAQCAAwAh7gEBAIYDACH7AQEAhgMAIf8BCADAAwAhhgIBAIADACGHAiAAkgMAIYgCAgClAwAhiQIAAPMDACCKAgEAhgMAIYsCAAD0AwAgjAIBAIYDACGNAgEAhgMAIQIAAAAPACAXAABnACAQzQEBAIADACHRAUAAgQMAIdIBQACBAwAh3wEBAIADACHrAQEAgAMAIe4BAQCGAwAh-wEBAIYDACH_AQgAwAMAIYYCAQCAAwAhhwIgAJIDACGIAgIApQMAIYkCAADzAwAgigIBAIYDACGLAgAA9AMAIIwCAQCGAwAhjQIBAIYDACECAAAADQAgFwAAaQAgAgAAAA0AIBcAAGkAIAMAAAAPACAeAABiACAfAABnACABAAAADwAgAQAAAA0AIAoIAADRBAAgJAAA0gQAICUAANUEACAmAADUBAAgJwAA0wQAIO4BAACCAwAg-wEAAIIDACCKAgAAggMAIIwCAACCAwAgjQIAAIIDACATygEAAOYCADDLAQAAcAAQzAEAAOYCADDNAQEArAIAIdEBQACtAgAh0gFAAK0CACHfAQEArAIAIesBAQCsAgAh7gEBALcCACH7AQEAtwIAIf8BCADdAgAhhgIBAKwCACGHAiAAwAIAIYgCAgDVAgAhiQIAAOcCACCKAgEAtwIAIYsCAADnAgAgjAIBALcCACGNAgEAtwIAIQMAAAANACABAABvADAjAABwACADAAAADQAgAQAADgAwAgAADwAgAQAAACEAIAEAAAAhACADAAAAHwAgAQAAIAAwAgAAIQAgAwAAAB8AIAEAACAAMAIAACEAIAMAAAAfACABAAAgADACAAAhACANAwAA6AMAIAYAANUDACAMAADWAwAgzQEBAAAAAdEBQAAAAAHSAUAAAAAB3wEBAAAAAeABAQAAAAHyAQAAAIQCAvwBAQAAAAGBAgEAAAABggIIAAAAAYUCAAAAhQICARcAAHgAIArNAQEAAAAB0QFAAAAAAdIBQAAAAAHfAQEAAAAB4AEBAAAAAfIBAAAAhAIC_AEBAAAAAYECAQAAAAGCAggAAAABhQIAAACFAgIBFwAAegAwARcAAHoAMA0DAADmAwAgBgAAxAMAIAwAAMUDACDNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHfAQEAgAMAIeABAQCAAwAh8gEAAMEDhAIi_AEBAIADACGBAgEAhgMAIYICCADAAwAhhQIAAMIDhQIiAgAAACEAIBcAAH0AIArNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHfAQEAgAMAIeABAQCAAwAh8gEAAMEDhAIi_AEBAIADACGBAgEAhgMAIYICCADAAwAhhQIAAMIDhQIiAgAAAB8AIBcAAH8AIAIAAAAfACAXAAB_ACADAAAAIQAgHgAAeAAgHwAAfQAgAQAAACEAIAEAAAAfACAGCAAAzAQAICQAAM0EACAlAADQBAAgJgAAzwQAICcAAM4EACCBAgAAggMAIA3KAQAA3wIAMMsBAACGAQAQzAEAAN8CADDNAQEArAIAIdEBQACtAgAh0gFAAK0CACHfAQEArAIAIeABAQCsAgAh8gEAAOAChAIi_AEBAKwCACGBAgEAtwIAIYICCADdAgAhhQIAAOEChQIiAwAAAB8AIAEAAIUBADAjAACGAQAgAwAAAB8AIAEAACAAMAIAACEAIAEAAAAZACABAAAAGQAgAwAAABcAIAEAABgAMAIAABkAIAMAAAAXACABAAAYADACAAAZACADAAAAFwAgAQAAGAAwAgAAGQAgBwoAANMDACANAACDBAAgzQEBAAAAAfcBAQAAAAH-AQEAAAAB_wEIAAAAAYACAgAAAAEBFwAAjgEAIAXNAQEAAAAB9wEBAAAAAf4BAQAAAAH_AQgAAAABgAICAAAAAQEXAACQAQAwARcAAJABADAHCgAA0QMAIA0AAIEEACDNAQEAgAMAIfcBAQCAAwAh_gEBAIADACH_AQgAwAMAIYACAgClAwAhAgAAABkAIBcAAJMBACAFzQEBAIADACH3AQEAgAMAIf4BAQCAAwAh_wEIAMADACGAAgIApQMAIQIAAAAXACAXAACVAQAgAgAAABcAIBcAAJUBACADAAAAGQAgHgAAjgEAIB8AAJMBACABAAAAGQAgAQAAABcAIAUIAADHBAAgJAAAyAQAICUAAMsEACAmAADKBAAgJwAAyQQAIAjKAQAA3AIAMMsBAACcAQAQzAEAANwCADDNAQEArAIAIfcBAQCsAgAh_gEBAKwCACH_AQgA3QIAIYACAgDVAgAhAwAAABcAIAEAAJsBADAjAACcAQAgAwAAABcAIAEAABgAMAIAABkAIA8DAADaAgAgBwAA2wIAIA8AANECACDKAQAA2QIAMMsBAAALABDMAQAA2QIAMM0BAQAAAAHRAUAAtQIAIdIBQAC1AgAh4AEBAAAAAfMBAQC0AgAh-gEBALQCACH7AQEAywIAIfwBAQC0AgAh_QEgAMoCACEBAAAAnwEAIAEAAACfAQAgBAMAAMUEACAHAADGBAAgDwAAuAQAIPsBAACCAwAgAwAAAAsAIAEAAKIBADACAACfAQAgAwAAAAsAIAEAAKIBADACAACfAQAgAwAAAAsAIAEAAKIBADACAACfAQAgDAMAAMQEACAHAACVBAAgDwAAlgQAIM0BAQAAAAHRAUAAAAAB0gFAAAAAAeABAQAAAAHzAQEAAAAB-gEBAAAAAfsBAQAAAAH8AQEAAAAB_QEgAAAAAQEXAACmAQAgCc0BAQAAAAHRAUAAAAAB0gFAAAAAAeABAQAAAAHzAQEAAAAB-gEBAAAAAfsBAQAAAAH8AQEAAAAB_QEgAAAAAQEXAACoAQAwARcAAKgBADAMAwAAwwQAIAcAANwDACAPAADdAwAgzQEBAIADACHRAUAAgQMAIdIBQACBAwAh4AEBAIADACHzAQEAgAMAIfoBAQCAAwAh-wEBAIYDACH8AQEAgAMAIf0BIACSAwAhAgAAAJ8BACAXAACrAQAgCc0BAQCAAwAh0QFAAIEDACHSAUAAgQMAIeABAQCAAwAh8wEBAIADACH6AQEAgAMAIfsBAQCGAwAh_AEBAIADACH9ASAAkgMAIQIAAAALACAXAACtAQAgAgAAAAsAIBcAAK0BACADAAAAnwEAIB4AAKYBACAfAACrAQAgAQAAAJ8BACABAAAACwAgBAgAAMAEACAmAADCBAAgJwAAwQQAIPsBAACCAwAgDMoBAADYAgAwywEAALQBABDMAQAA2AIAMM0BAQCsAgAh0QFAAK0CACHSAUAArQIAIeABAQCsAgAh8wEBAKwCACH6AQEArAIAIfsBAQC3AgAh_AEBAKwCACH9ASAAwAIAIQMAAAALACABAACzAQAwIwAAtAEAIAMAAAALACABAACiAQAwAgAAnwEAIAEAAAAVACABAAAAFQAgAwAAABMAIAEAABQAMAIAABUAIAMAAAATACABAAAUADACAAAVACADAAAAEwAgAQAAFAAwAgAAFQAgCQMAAI4EACAKAAC1AwAgzQEBAAAAAdEBQAAAAAHSAUAAAAAB4AEBAAAAAfcBAQAAAAH4AQIAAAAB-QEBAAAAAQEXAAC8AQAgB80BAQAAAAHRAUAAAAAB0gFAAAAAAeABAQAAAAH3AQEAAAAB-AECAAAAAfkBAQAAAAEBFwAAvgEAMAEXAAC-AQAwCQMAAIwEACAKAACzAwAgzQEBAIADACHRAUAAgQMAIdIBQACBAwAh4AEBAIADACH3AQEAgAMAIfgBAgClAwAh-QEBAIYDACECAAAAFQAgFwAAwQEAIAfNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHgAQEAgAMAIfcBAQCAAwAh-AECAKUDACH5AQEAhgMAIQIAAAATACAXAADDAQAgAgAAABMAIBcAAMMBACADAAAAFQAgHgAAvAEAIB8AAMEBACABAAAAFQAgAQAAABMAIAYIAAC7BAAgJAAAvAQAICUAAL8EACAmAAC-BAAgJwAAvQQAIPkBAACCAwAgCsoBAADUAgAwywEAAMoBABDMAQAA1AIAMM0BAQCsAgAh0QFAAK0CACHSAUAArQIAIeABAQCsAgAh9wEBAKwCACH4AQIA1QIAIfkBAQC3AgAhAwAAABMAIAEAAMkBADAjAADKAQAgAwAAABMAIAEAABQAMAIAABUAIBMEAADOAgAgBQAAzwIAIAsAANICACAPAADRAgAgEAAA0AIAIBEAANMCACDKAQAAyQIAMMsBAADQAQAQzAEAAMkCADDNAQEAAAAB0QFAALUCACHSAUAAtQIAIesBAQC0AgAh7AEBAAAAAe0BIADKAgAh7gEBAMsCACHwAQAAzALwASLyAQAAzQLyASLzAQEAywIAIQEAAADNAQAgAQAAAM0BACATBAAAzgIAIAUAAM8CACALAADSAgAgDwAA0QIAIBAAANACACARAADTAgAgygEAAMkCADDLAQAA0AEAEMwBAADJAgAwzQEBALQCACHRAUAAtQIAIdIBQAC1AgAh6wEBALQCACHsAQEAtAIAIe0BIADKAgAh7gEBAMsCACHwAQAAzALwASLyAQAAzQLyASLzAQEAywIAIQgEAAC1BAAgBQAAtgQAIAsAALkEACAPAAC4BAAgEAAAtwQAIBEAALoEACDuAQAAggMAIPMBAACCAwAgAwAAANABACABAADRAQAwAgAAzQEAIAMAAADQAQAgAQAA0QEAMAIAAM0BACADAAAA0AEAIAEAANEBADACAADNAQAgEAQAAK8EACAFAACwBAAgCwAAswQAIA8AALIEACAQAACxBAAgEQAAtAQAIM0BAQAAAAHRAUAAAAAB0gFAAAAAAesBAQAAAAHsAQEAAAAB7QEgAAAAAe4BAQAAAAHwAQAAAPABAvIBAAAA8gEC8wEBAAAAAQEXAADVAQAgCs0BAQAAAAHRAUAAAAAB0gFAAAAAAesBAQAAAAHsAQEAAAAB7QEgAAAAAe4BAQAAAAHwAQAAAPABAvIBAAAA8gEC8wEBAAAAAQEXAADXAQAwARcAANcBADAQBAAAlQMAIAUAAJYDACALAACZAwAgDwAAmAMAIBAAAJcDACARAACaAwAgzQEBAIADACHRAUAAgQMAIdIBQACBAwAh6wEBAIADACHsAQEAgAMAIe0BIACSAwAh7gEBAIYDACHwAQAAkwPwASLyAQAAlAPyASLzAQEAhgMAIQIAAADNAQAgFwAA2gEAIArNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHrAQEAgAMAIewBAQCAAwAh7QEgAJIDACHuAQEAhgMAIfABAACTA_ABIvIBAACUA_IBIvMBAQCGAwAhAgAAANABACAXAADcAQAgAgAAANABACAXAADcAQAgAwAAAM0BACAeAADVAQAgHwAA2gEAIAEAAADNAQAgAQAAANABACAFCAAAjwMAICYAAJEDACAnAACQAwAg7gEAAIIDACDzAQAAggMAIA3KAQAAvwIAMMsBAADjAQAQzAEAAL8CADDNAQEArAIAIdEBQACtAgAh0gFAAK0CACHrAQEArAIAIewBAQCsAgAh7QEgAMACACHuAQEAtwIAIfABAADBAvABIvIBAADCAvIBIvMBAQC3AgAhAwAAANABACABAADiAQAwIwAA4wEAIAMAAADQAQAgAQAA0QEAMAIAAM0BACABAAAABQAgAQAAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAkDAACOAwAgzQEBAAAAAdABQAAAAAHRAUAAAAAB0gFAAAAAAeABAQAAAAHoAQEAAAAB6QEBAAAAAeoBAQAAAAEBFwAA6wEAIAjNAQEAAAAB0AFAAAAAAdEBQAAAAAHSAUAAAAAB4AEBAAAAAegBAQAAAAHpAQEAAAAB6gEBAAAAAQEXAADtAQAwARcAAO0BADAJAwAAjQMAIM0BAQCAAwAh0AFAAIEDACHRAUAAgQMAIdIBQACBAwAh4AEBAIADACHoAQEAgAMAIekBAQCGAwAh6gEBAIYDACECAAAABQAgFwAA8AEAIAjNAQEAgAMAIdABQACBAwAh0QFAAIEDACHSAUAAgQMAIeABAQCAAwAh6AEBAIADACHpAQEAhgMAIeoBAQCGAwAhAgAAAAMAIBcAAPIBACACAAAAAwAgFwAA8gEAIAMAAAAFACAeAADrAQAgHwAA8AEAIAEAAAAFACABAAAAAwAgBQgAAIoDACAmAACMAwAgJwAAiwMAIOkBAACCAwAg6gEAAIIDACALygEAAL4CADDLAQAA-QEAEMwBAAC-AgAwzQEBAKwCACHQAUAArQIAIdEBQACtAgAh0gFAAK0CACHgAQEArAIAIegBAQCsAgAh6QEBALcCACHqAQEAtwIAIQMAAAADACABAAD4AQAwIwAA-QEAIAMAAAADACABAAAEADACAAAFACABAAAACQAgAQAAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIA4DAACJAwAgzQEBAAAAAdEBQAAAAAHSAUAAAAAB3gEBAAAAAd8BAQAAAAHgAQEAAAAB4QEBAAAAAeIBAQAAAAHjAQEAAAAB5AFAAAAAAeUBQAAAAAHmAQEAAAAB5wEBAAAAAQEXAACBAgAgDc0BAQAAAAHRAUAAAAAB0gFAAAAAAd4BAQAAAAHfAQEAAAAB4AEBAAAAAeEBAQAAAAHiAQEAAAAB4wEBAAAAAeQBQAAAAAHlAUAAAAAB5gEBAAAAAecBAQAAAAEBFwAAgwIAMAEXAACDAgAwDgMAAIgDACDNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHeAQEAgAMAId8BAQCAAwAh4AEBAIADACHhAQEAhgMAIeIBAQCGAwAh4wEBAIYDACHkAUAAhwMAIeUBQACHAwAh5gEBAIYDACHnAQEAhgMAIQIAAAAJACAXAACGAgAgDc0BAQCAAwAh0QFAAIEDACHSAUAAgQMAId4BAQCAAwAh3wEBAIADACHgAQEAgAMAIeEBAQCGAwAh4gEBAIYDACHjAQEAhgMAIeQBQACHAwAh5QFAAIcDACHmAQEAhgMAIecBAQCGAwAhAgAAAAcAIBcAAIgCACACAAAABwAgFwAAiAIAIAMAAAAJACAeAACBAgAgHwAAhgIAIAEAAAAJACABAAAABwAgCggAAIMDACAmAACFAwAgJwAAhAMAIOEBAACCAwAg4gEAAIIDACDjAQAAggMAIOQBAACCAwAg5QEAAIIDACDmAQAAggMAIOcBAACCAwAgEMoBAAC2AgAwywEAAI8CABDMAQAAtgIAMM0BAQCsAgAh0QFAAK0CACHSAUAArQIAId4BAQCsAgAh3wEBAKwCACHgAQEArAIAIeEBAQC3AgAh4gEBALcCACHjAQEAtwIAIeQBQAC4AgAh5QFAALgCACHmAQEAtwIAIecBAQC3AgAhAwAAAAcAIAEAAI4CADAjAACPAgAgAwAAAAcAIAEAAAgAMAIAAAkAIAnKAQAAswIAMMsBAACVAgAQzAEAALMCADDNAQEAAAABzgEBALQCACHPAQEAtAIAIdABQAC1AgAh0QFAALUCACHSAUAAtQIAIQEAAACSAgAgAQAAAJICACAJygEAALMCADDLAQAAlQIAEMwBAACzAgAwzQEBALQCACHOAQEAtAIAIc8BAQC0AgAh0AFAALUCACHRAUAAtQIAIdIBQAC1AgAhAAMAAACVAgAgAQAAlgIAMAIAAJICACADAAAAlQIAIAEAAJYCADACAACSAgAgAwAAAJUCACABAACWAgAwAgAAkgIAIAbNAQEAAAABzgEBAAAAAc8BAQAAAAHQAUAAAAAB0QFAAAAAAdIBQAAAAAEBFwAAmgIAIAbNAQEAAAABzgEBAAAAAc8BAQAAAAHQAUAAAAAB0QFAAAAAAdIBQAAAAAEBFwAAnAIAMAEXAACcAgAwBs0BAQCAAwAhzgEBAIADACHPAQEAgAMAIdABQACBAwAh0QFAAIEDACHSAUAAgQMAIQIAAACSAgAgFwAAnwIAIAbNAQEAgAMAIc4BAQCAAwAhzwEBAIADACHQAUAAgQMAIdEBQACBAwAh0gFAAIEDACECAAAAlQIAIBcAAKECACACAAAAlQIAIBcAAKECACADAAAAkgIAIB4AAJoCACAfAACfAgAgAQAAAJICACABAAAAlQIAIAMIAAD9AgAgJgAA_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-QEAEMwBAAC-AgAwzQEBAKwCACHQAUAArQIAIdEBQACtAgAh0gFAAK0CACHgAQEArAIAIegBAQCsAgAh6QEBALcCACHqAQEAtwIAIQ3KAQAAvwIAMMsBAADjAQAQzAEAAL8CADDNAQEArAIAIdEBQACtAgAh0gFAAK0CACHrAQEArAIAIewBAQCsAgAh7QEgAMACACHuAQEAtwIAIfABAADBAvABIvIBAADCAvIBIvMBAQC3AgAhBQgAAK8CACAmAADIAgAgJwAAyAIAINMBIAAAAAHaASAAxwIAIQcIAACvAgAgJgAAxgIAICcAAMYCACDTAQAAAPABAtQBAAAA8AEI1QEAAADwAQjaAQAAxQLwASIHCAAArwIAICYAAMQCACAnAADEAgAg0wEAAADyAQLUAQAAAPIBCNUBAAAA8gEI2gEAAMMC8gEiBwgAAK8CACAmAADEAgAgJwAAxAIAINMBAAAA8gEC1AEAAADyAQjVAQAAAPIBCNoBAADDAvIBIgTTAQAAAPIBAtQBAAAA8gEI1QEAAADyAQjaAQAAxALyASIHCAAArwIAICYAAMYCACAnAADGAgAg0wEAAADwAQLUAQAAAPABCNUBAAAA8AEI2gEAAMUC8AEiBNMBAAAA8AEC1AEAAADwAQjVAQAAAPABCNoBAADGAvABIgUIAACvAgAgJgAAyAIAICcAAMgCACDTASAAAAAB2gEgAMcCACEC0wEgAAAAAdoBIADIAgAhEwQAAM4CACAFAADPAgAgCwAA0gIAIA8AANECACAQAADQAgAgEQAA0wIAIMoBAADJAgAwywEAANABABDMAQAAyQIAMM0BAQC0AgAh0QFAALUCACHSAUAAtQIAIesBAQC0AgAh7AEBALQCACHtASAAygIAIe4BAQDLAgAh8AEAAMwC8AEi8gEAAM0C8gEi8wEBAMsCACEC0wEgAAAAAdoBIADIAgAhC9MBAQAAAAHUAQEAAAAF1QEBAAAABdYBAQAAAAHXAQEAAAAB2AEBAAAAAdkBAQAAAAHaAQEAvQIAIdsBAQAAAAHcAQEAAAAB3QEBAAAAAQTTAQAAAPABAtQBAAAA8AEI1QEAAADwAQjaAQAAxgLwASIE0wEAAADyAQLUAQAAAPIBCNUBAAAA8gEI2gEAAMQC8gEiA_QBAAADACD1AQAAAwAg9gEAAAMAIAP0AQAABwAg9QEAAAcAIPYBAAAHACARAwAA2gIAIAcAANsCACAPAADRAgAgygEAANkCADDLAQAACwAQzAEAANkCADDNAQEAtAIAIdEBQAC1AgAh0gFAALUCACHgAQEAtAIAIfMBAQC0AgAh-gEBALQCACH7AQEAywIAIfwBAQC0AgAh_QEgAMoCACGWAgAACwAglwIAAAsAIAP0AQAAHwAg9QEAAB8AIPYBAAAfACAD9AEAABMAIPUBAAATACD2AQAAEwAgA_QBAAAnACD1AQAAJwAg9gEAACcAIArKAQAA1AIAMMsBAADKAQAQzAEAANQCADDNAQEArAIAIdEBQACtAgAh0gFAAK0CACHgAQEArAIAIfcBAQCsAgAh-AECANUCACH5AQEAtwIAIQ0IAACvAgAgJAAA1wIAICUAAK8CACAmAACvAgAgJwAArwIAINMBAgAAAAHUAQIAAAAE1QECAAAABNYBAgAAAAHXAQIAAAAB2AECAAAAAdkBAgAAAAHaAQIA1gIAIQ0IAACvAgAgJAAA1wIAICUAAK8CACAmAACvAgAgJwAArwIAINMBAgAAAAHUAQIAAAAE1QECAAAABNYBAgAAAAHXAQIAAAAB2AECAAAAAdkBAgAAAAHaAQIA1gIAIQjTAQgAAAAB1AEIAAAABNUBCAAAAATWAQgAAAAB1wEIAAAAAdgBCAAAAAHZAQgAAAAB2gEIANcCACEMygEAANgCADDLAQAAtAEAEMwBAADYAgAwzQEBAKwCACHRAUAArQIAIdIBQACtAgAh4AEBAKwCACHzAQEArAIAIfoBAQCsAgAh-wEBALcCACH8AQEArAIAIf0BIADAAgAhDwMAANoCACAHAADbAgAgDwAA0QIAIMoBAADZAgAwywEAAAsAEMwBAADZAgAwzQEBALQCACHRAUAAtQIAIdIBQAC1AgAh4AEBALQCACHzAQEAtAIAIfoBAQC0AgAh-wEBAMsCACH8AQEAtAIAIf0BIADKAgAhFQQAAM4CACAFAADPAgAgCwAA0gIAIA8AANECACAQAADQAgAgEQAA0wIAIMoBAADJAgAwywEAANABABDMAQAAyQIAMM0BAQC0AgAh0QFAALUCACHSAUAAtQIAIesBAQC0AgAh7AEBALQCACHtASAAygIAIe4BAQDLAgAh8AEAAMwC8AEi8gEAAM0C8gEi8wEBAMsCACGWAgAA0AEAIJcCAADQAQAgA_QBAAANACD1AQAADQAg9gEAAA0AIAjKAQAA3AIAMMsBAACcAQAQzAEAANwCADDNAQEArAIAIfcBAQCsAgAh_gEBAKwCACH_AQgA3QIAIYACAgDVAgAhDQgAAK8CACAkAADXAgAgJQAA1wIAICYAANcCACAnAADXAgAg0wEIAAAAAdQBCAAAAATVAQgAAAAE1gEIAAAAAdcBCAAAAAHYAQgAAAAB2QEIAAAAAdoBCADeAgAhDQgAAK8CACAkAADXAgAgJQAA1wIAICYAANcCACAnAADXAgAg0wEIAAAAAdQBCAAAAATVAQgAAAAE1gEIAAAAAdcBCAAAAAHYAQgAAAAB2QEIAAAAAdoBCADeAgAhDcoBAADfAgAwywEAAIYBABDMAQAA3wIAMM0BAQCsAgAh0QFAAK0CACHSAUAArQIAId8BAQCsAgAh4AEBAKwCACHyAQAA4AKEAiL8AQEArAIAIYECAQC3AgAhggIIAN0CACGFAgAA4QKFAiIHCAAArwIAICYAAOUCACAnAADlAgAg0wEAAACEAgLUAQAAAIQCCNUBAAAAhAII2gEAAOQChAIiBwgAAK8CACAmAADjAgAgJwAA4wIAINMBAAAAhQIC1AEAAACFAgjVAQAAAIUCCNoBAADiAoUCIgcIAACvAgAgJgAA4wIAICcAAOMCACDTAQAAAIUCAtQBAAAAhQII1QEAAACFAgjaAQAA4gKFAiIE0wEAAACFAgLUAQAAAIUCCNUBAAAAhQII2gEAAOMChQIiBwgAAK8CACAmAADlAgAgJwAA5QIAINMBAAAAhAIC1AEAAACEAgjVAQAAAIQCCNoBAADkAoQCIgTTAQAAAIQCAtQBAAAAhAII1QEAAACEAgjaAQAA5QKEAiITygEAAOYCADDLAQAAcAAQzAEAAOYCADDNAQEArAIAIdEBQACtAgAh0gFAAK0CACHfAQEArAIAIesBAQCsAgAh7gEBALcCACH7AQEAtwIAIf8BCADdAgAhhgIBAKwCACGHAiAAwAIAIYgCAgDVAgAhiQIAAOcCACCKAgEAtwIAIYsCAADnAgAgjAIBALcCACGNAgEAtwIAIQTTAQEAAAAFjgIBAAAAAY8CAQAAAASQAgEAAAAECMoBAADoAgAwywEAAFoAEMwBAADoAgAwzQEBAKwCACHRAUAArQIAIdIBQACtAgAh6wEBAKwCACGRAgEArAIAIQkHAADbAgAgygEAAOkCADDLAQAARwAQzAEAAOkCADDNAQEAtAIAIdEBQAC1AgAh0gFAALUCACHrAQEAtAIAIZECAQC0AgAhC8oBAADqAgAwywEAAEEAEMwBAADqAgAwzQECANUCACHRAUAArQIAIdIBQACtAgAh4AEBAKwCACGRAgEArAIAIZICAQCsAgAhkwIBAKwCACGUAgEAtwIAIQwDAADaAgAgygEAAOsCADDLAQAAJwAQzAEAAOsCADDNAQIA7AIAIdEBQAC1AgAh0gFAALUCACHgAQEAtAIAIZECAQC0AgAhkgIBALQCACGTAgEAtAIAIZQCAQDLAgAhCNMBAgAAAAHUAQIAAAAE1QECAAAABNYBAgAAAAHXAQIAAAAB2AECAAAAAdkBAgAAAAHaAQIArwIAIRADAADaAgAgBgAA8QIAIAwAAPICACDKAQAA7QIAMMsBAAAfABDMAQAA7QIAMM0BAQC0AgAh0QFAALUCACHSAUAAtQIAId8BAQC0AgAh4AEBALQCACHyAQAA7wKEAiL8AQEAtAIAIYECAQDLAgAhggIIAO4CACGFAgAA8AKFAiII0wEIAAAAAdQBCAAAAATVAQgAAAAE1gEIAAAAAdcBCAAAAAHYAQgAAAAB2QEIAAAAAdoBCADXAgAhBNMBAAAAhAIC1AEAAACEAgjVAQAAAIQCCNoBAADlAoQCIgTTAQAAAIUCAtQBAAAAhQII1QEAAACFAgjaAQAA4wKFAiIRAwAA2gIAIAcAANsCACAPAADRAgAgygEAANkCADDLAQAACwAQzAEAANkCADDNAQEAtAIAIdEBQAC1AgAh0gFAALUCACHgAQEAtAIAIfMBAQC0AgAh-gEBALQCACH7AQEAywIAIfwBAQC0AgAh_QEgAMoCACGWAgAACwAglwIAAAsAIAP0AQAAFwAg9QEAABcAIPYBAAAXACAKCgAA9QIAIA0AAPQCACDKAQAA8wIAMMsBAAAXABDMAQAA8wIAMM0BAQC0AgAh9wEBALQCACH-AQEAtAIAIf8BCADuAgAhgAICAOwCACESAwAA2gIAIAYAAPECACAMAADyAgAgygEAAO0CADDLAQAAHwAQzAEAAO0CADDNAQEAtAIAIdEBQAC1AgAh0gFAALUCACHfAQEAtAIAIeABAQC0AgAh8gEAAO8ChAIi_AEBALQCACGBAgEAywIAIYICCADuAgAhhQIAAPAChQIilgIAAB8AIJcCAAAfACAZBgAA8QIAIAkAAPkCACALAADSAgAgDgAA8gIAIMoBAAD4AgAwywEAAA0AEMwBAAD4AgAwzQEBALQCACHRAUAAtQIAIdIBQAC1AgAh3wEBALQCACHrAQEAtAIAIe4BAQDLAgAh-wEBAMsCACH_AQgA7gIAIYYCAQC0AgAhhwIgAMoCACGIAgIA7AIAIYkCAADnAgAgigIBAMsCACGLAgAA5wIAIIwCAQDLAgAhjQIBAMsCACGWAgAADQAglwIAAA0AIALgAQEAAAAB9wEBAAAAAQwDAADaAgAgCgAA9QIAIMoBAAD3AgAwywEAABMAEMwBAAD3AgAwzQEBALQCACHRAUAAtQIAIdIBQAC1AgAh4AEBALQCACH3AQEAtAIAIfgBAgDsAgAh-QEBAMsCACEXBgAA8QIAIAkAAPkCACALAADSAgAgDgAA8gIAIMoBAAD4AgAwywEAAA0AEMwBAAD4AgAwzQEBALQCACHRAUAAtQIAIdIBQAC1AgAh3wEBALQCACHrAQEAtAIAIe4BAQDLAgAh-wEBAMsCACH_AQgA7gIAIYYCAQC0AgAhhwIgAMoCACGIAgIA7AIAIYkCAADnAgAgigIBAMsCACGLAgAA5wIAIIwCAQDLAgAhjQIBAMsCACELBwAA2wIAIMoBAADpAgAwywEAAEcAEMwBAADpAgAwzQEBALQCACHRAUAAtQIAIdIBQAC1AgAh6wEBALQCACGRAgEAtAIAIZYCAABHACCXAgAARwAgEQMAANoCACDKAQAA-gIAMMsBAAAHABDMAQAA-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_AEBALQCACGBAgEAywIAIYICCADuAgAhhQIAAPAChQIiCc0BAQCAAwAh0QFAAIEDACHSAUAAgQMAId8BAQCAAwAh8gEAAMEDhAIi_AEBAIADACGBAgEAhgMAIYICCADAAwAhhQIAAMIDhQIiBZsCCAAAAAGiAggAAAABowIIAAAAAaQCCAAAAAGlAggAAAABAZsCAAAAhAICAZsCAAAAhQICCwYAAMQDACAMAADFAwAgzQEBAIADACHRAUAAgQMAIdIBQACBAwAh3wEBAIADACHyAQAAwQOEAiL8AQEAgAMAIYECAQCGAwAhggIIAMADACGFAgAAwgOFAiIFHgAAmwUAIB8AAKQFACCYAgAAnAUAIJkCAACjBQAgngIAAJ8BACALHgAAxgMAMB8AAMsDADCYAgAAxwMAMJkCAADIAwAwmgIAAMkDACCbAgAAygMAMJwCAADKAwAwnQIAAMoDADCeAgAAygMAMJ8CAADMAwAwoAIAAM0DADAFCgAA0wMAIM0BAQAAAAH3AQEAAAAB_wEIAAAAAYACAgAAAAECAAAAGQAgHgAA0gMAIAMAAAAZACAeAADSAwAgHwAA0AMAIAEXAACiBQAwCgoAAPUCACANAAD0AgAgygEAAPMCADDLAQAAFwAQzAEAAPMCADDNAQEAAAAB9wEBALQCACH-AQEAtAIAIf8BCADuAgAhgAICAOwCACECAAAAGQAgFwAA0AMAIAIAAADOAwAgFwAAzwMAIAjKAQAAzQMAMMsBAADOAwAQzAEAAM0DADDNAQEAtAIAIfcBAQC0AgAh_gEBALQCACH_AQgA7gIAIYACAgDsAgAhCMoBAADNAwAwywEAAM4DABDMAQAAzQMAMM0BAQC0AgAh9wEBALQCACH-AQEAtAIAIf8BCADuAgAhgAICAOwCACEEzQEBAIADACH3AQEAgAMAIf8BCADAAwAhgAICAKUDACEFCgAA0QMAIM0BAQCAAwAh9wEBAIADACH_AQgAwAMAIYACAgClAwAhBR4AAJ0FACAfAACgBQAgmAIAAJ4FACCZAgAAnwUAIJ4CAAAPACAFCgAA0wMAIM0BAQAAAAH3AQEAAAAB_wEIAAAAAYACAgAAAAEDHgAAnQUAIJgCAACeBQAgngIAAA8AIAsGAADVAwAgDAAA1gMAIM0BAQAAAAHRAUAAAAAB0gFAAAAAAd8BAQAAAAHyAQAAAIQCAvwBAQAAAAGBAgEAAAABggIIAAAAAYUCAAAAhQICAx4AAJsFACCYAgAAnAUAIJ4CAACfAQAgBB4AAMYDADCYAgAAxwMAMJoCAADJAwAgngIAAMoDADAKBwAAlQQAIA8AAJYEACDNAQEAAAAB0QFAAAAAAdIBQAAAAAHzAQEAAAAB-gEBAAAAAfsBAQAAAAH8AQEAAAAB_QEgAAAAAQIAAACfAQAgHgAA1wMAIAMAAAALACAeAADXAwAgHwAA2wMAIAwAAAALACAHAADcAwAgDwAA3QMAIBcAANsDACDNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHzAQEAgAMAIfoBAQCAAwAh-wEBAIYDACH8AQEAgAMAIf0BIACSAwAhCgcAANwDACAPAADdAwAgzQEBAIADACHRAUAAgQMAIdIBQACBAwAh8wEBAIADACH6AQEAgAMAIfsBAQCGAwAh_AEBAIADACH9ASAAkgMAIQseAADpAwAwHwAA7gMAMJgCAADqAwAwmQIAAOsDADCaAgAA7AMAIJsCAADtAwAwnAIAAO0DADCdAgAA7QMAMJ4CAADtAwAwnwIAAO8DADCgAgAA8AMAMAseAADeAwAwHwAA4gMAMJgCAADfAwAwmQIAAOADADCaAgAA4QMAIJsCAAC6AwAwnAIAALoDADCdAgAAugMAMJ4CAAC6AwAwnwIAAOMDADCgAgAAvQMAMAsDAADoAwAgDAAA1gMAIM0BAQAAAAHRAUAAAAAB0gFAAAAAAeABAQAAAAHyAQAAAIQCAvwBAQAAAAGBAgEAAAABggIIAAAAAYUCAAAAhQICAgAAACEAIB4AAOcDACADAAAAIQAgHgAA5wMAIB8AAOUDACABFwAAmgUAMAIAAAAhACAXAADlAwAgAgAAAL4DACAXAADkAwAgCc0BAQCAAwAh0QFAAIEDACHSAUAAgQMAIeABAQCAAwAh8gEAAMEDhAIi_AEBAIADACGBAgEAhgMAIYICCADAAwAhhQIAAMIDhQIiCwMAAOYDACAMAADFAwAgzQEBAIADACHRAUAAgQMAIdIBQACBAwAh4AEBAIADACHyAQAAwQOEAiL8AQEAgAMAIYECAQCGAwAhggIIAMADACGFAgAAwgOFAiIFHgAAlQUAIB8AAJgFACCYAgAAlgUAIJkCAACXBQAgngIAAM0BACALAwAA6AMAIAwAANYDACDNAQEAAAAB0QFAAAAAAdIBQAAAAAHgAQEAAAAB8gEAAACEAgL8AQEAAAABgQIBAAAAAYICCAAAAAGFAgAAAIUCAgMeAACVBQAgmAIAAJYFACCeAgAAzQEAIBIJAACSBAAgCwAAkwQAIA4AAJQEACDNAQEAAAAB0QFAAAAAAdIBQAAAAAHrAQEAAAAB7gEBAAAAAfsBAQAAAAH_AQgAAAABhgIBAAAAAYcCIAAAAAGIAgIAAAABiQIAAJAEACCKAgEAAAABiwIAAJEEACCMAgEAAAABjQIBAAAAAQIAAAAPACAeAACPBAAgAwAAAA8AIB4AAI8EACAfAAD1AwAgARcAAJQFADAXBgAA8QIAIAkAAPkCACALAADSAgAgDgAA8gIAIMoBAAD4AgAwywEAAA0AEMwBAAD4AgAwzQEBAAAAAdEBQAC1AgAh0gFAALUCACHfAQEAtAIAIesBAQC0AgAh7gEBAMsCACH7AQEAywIAIf8BCADuAgAhhgIBALQCACGHAiAAygIAIYgCAgDsAgAhiQIAAOcCACCKAgEAywIAIYsCAADnAgAgjAIBAMsCACGNAgEAywIAIQIAAAAPACAXAAD1AwAgAgAAAPEDACAXAADyAwAgE8oBAADwAwAwywEAAPEDABDMAQAA8AMAMM0BAQC0AgAh0QFAALUCACHSAUAAtQIAId8BAQC0AgAh6wEBALQCACHuAQEAywIAIfsBAQDLAgAh_wEIAO4CACGGAgEAtAIAIYcCIADKAgAhiAICAOwCACGJAgAA5wIAIIoCAQDLAgAhiwIAAOcCACCMAgEAywIAIY0CAQDLAgAhE8oBAADwAwAwywEAAPEDABDMAQAA8AMAMM0BAQC0AgAh0QFAALUCACHSAUAAtQIAId8BAQC0AgAh6wEBALQCACHuAQEAywIAIfsBAQDLAgAh_wEIAO4CACGGAgEAtAIAIYcCIADKAgAhiAICAOwCACGJAgAA5wIAIIoCAQDLAgAhiwIAAOcCACCMAgEAywIAIY0CAQDLAgAhD80BAQCAAwAh0QFAAIEDACHSAUAAgQMAIesBAQCAAwAh7gEBAIYDACH7AQEAhgMAIf8BCADAAwAhhgIBAIADACGHAiAAkgMAIYgCAgClAwAhiQIAAPMDACCKAgEAhgMAIYsCAAD0AwAgjAIBAIYDACGNAgEAhgMAIQKbAgEAAAAEoQIBAAAABQKbAgEAAAAEoQIBAAAABRIJAAD2AwAgCwAA9wMAIA4AAPgDACDNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHrAQEAgAMAIe4BAQCGAwAh-wEBAIYDACH_AQgAwAMAIYYCAQCAAwAhhwIgAJIDACGIAgIApQMAIYkCAADzAwAgigIBAIYDACGLAgAA9AMAIIwCAQCGAwAhjQIBAIYDACEFHgAAgwUAIB8AAJIFACCYAgAAhAUAIJkCAACRBQAgngIAAEQAIAseAACEBAAwHwAAiAQAMJgCAACFBAAwmQIAAIYEADCaAgAAhwQAIJsCAACsAwAwnAIAAKwDADCdAgAArAMAMJ4CAACsAwAwnwIAAIkEADCgAgAArwMAMAseAAD5AwAwHwAA_QMAMJgCAAD6AwAwmQIAAPsDADCaAgAA_AMAIJsCAADKAwAwnAIAAMoDADCdAgAAygMAMJ4CAADKAwAwnwIAAP4DADCgAgAAzQMAMAUNAACDBAAgzQEBAAAAAf4BAQAAAAH_AQgAAAABgAICAAAAAQIAAAAZACAeAACCBAAgAwAAABkAIB4AAIIEACAfAACABAAgARcAAJAFADACAAAAGQAgFwAAgAQAIAIAAADOAwAgFwAA_wMAIATNAQEAgAMAIf4BAQCAAwAh_wEIAMADACGAAgIApQMAIQUNAACBBAAgzQEBAIADACH-AQEAgAMAIf8BCADAAwAhgAICAKUDACEFHgAAiwUAIB8AAI4FACCYAgAAjAUAIJkCAACNBQAgngIAACEAIAUNAACDBAAgzQEBAAAAAf4BAQAAAAH_AQgAAAABgAICAAAAAQMeAACLBQAgmAIAAIwFACCeAgAAIQAgBwMAAI4EACDNAQEAAAAB0QFAAAAAAdIBQAAAAAHgAQEAAAAB-AECAAAAAfkBAQAAAAECAAAAFQAgHgAAjQQAIAMAAAAVACAeAACNBAAgHwAAiwQAIAEXAACKBQAwAgAAABUAIBcAAIsEACACAAAAsAMAIBcAAIoEACAGzQEBAIADACHRAUAAgQMAIdIBQACBAwAh4AEBAIADACH4AQIApQMAIfkBAQCGAwAhBwMAAIwEACDNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHgAQEAgAMAIfgBAgClAwAh-QEBAIYDACEFHgAAhQUAIB8AAIgFACCYAgAAhgUAIJkCAACHBQAgngIAAM0BACAHAwAAjgQAIM0BAQAAAAHRAUAAAAAB0gFAAAAAAeABAQAAAAH4AQIAAAAB-QEBAAAAAQMeAACFBQAgmAIAAIYFACCeAgAAzQEAIBIJAACSBAAgCwAAkwQAIA4AAJQEACDNAQEAAAAB0QFAAAAAAdIBQAAAAAHrAQEAAAAB7gEBAAAAAfsBAQAAAAH_AQgAAAABhgIBAAAAAYcCIAAAAAGIAgIAAAABiQIAAJAEACCKAgEAAAABiwIAAJEEACCMAgEAAAABjQIBAAAAAQGbAgEAAAAEAZsCAQAAAAQDHgAAgwUAIJgCAACEBQAgngIAAEQAIAQeAACEBAAwmAIAAIUEADCaAgAAhwQAIJ4CAACsAwAwBB4AAPkDADCYAgAA-gMAMJoCAAD8AwAgngIAAMoDADAEHgAA6QMAMJgCAADqAwAwmgIAAOwDACCeAgAA7QMAMAQeAADeAwAwmAIAAN8DADCaAgAA4QMAIJ4CAAC6AwAwDM0BAQAAAAHRAUAAAAAB0gFAAAAAAd4BAQAAAAHfAQEAAAAB4QEBAAAAAeIBAQAAAAHjAQEAAAAB5AFAAAAAAeUBQAAAAAHmAQEAAAAB5wEBAAAAAQIAAAAJACAeAACiBAAgAwAAAAkAIB4AAKIEACAfAAChBAAgARcAAIIFADARAwAA2gIAIMoBAAD6AgAwywEAAAcAEMwBAAD6AgAwzQEBAAAAAdEBQAC1AgAh0gFAALUCACHeAQEAtAIAId8BAQC0AgAh4AEBALQCACHhAQEAywIAIeIBAQDLAgAh4wEBAMsCACHkAUAA-wIAIeUBQAD7AgAh5gEBAMsCACHnAQEAywIAIQIAAAAJACAXAAChBAAgAgAAAJ8EACAXAACgBAAgEMoBAACeBAAwywEAAJ8EABDMAQAAngQAMM0BAQC0AgAh0QFAALUCACHSAUAAtQIAId4BAQC0AgAh3wEBALQCACHgAQEAtAIAIeEBAQDLAgAh4gEBAMsCACHjAQEAywIAIeQBQAD7AgAh5QFAAPsCACHmAQEAywIAIecBAQDLAgAhEMoBAACeBAAwywEAAJ8EABDMAQAAngQAMM0BAQC0AgAh0QFAALUCACHSAUAAtQIAId4BAQC0AgAh3wEBALQCACHgAQEAtAIAIeEBAQDLAgAh4gEBAMsCACHjAQEAywIAIeQBQAD7AgAh5QFAAPsCACHmAQEAywIAIecBAQDLAgAhDM0BAQCAAwAh0QFAAIEDACHSAUAAgQMAId4BAQCAAwAh3wEBAIADACHhAQEAhgMAIeIBAQCGAwAh4wEBAIYDACHkAUAAhwMAIeUBQACHAwAh5gEBAIYDACHnAQEAhgMAIQzNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHeAQEAgAMAId8BAQCAAwAh4QEBAIYDACHiAQEAhgMAIeMBAQCGAwAh5AFAAIcDACHlAUAAhwMAIeYBAQCGAwAh5wEBAIYDACEMzQEBAAAAAdEBQAAAAAHSAUAAAAAB3gEBAAAAAd8BAQAAAAHhAQEAAAAB4gEBAAAAAeMBAQAAAAHkAUAAAAAB5QFAAAAAAeYBAQAAAAHnAQEAAAABB80BAQAAAAHQAUAAAAAB0QFAAAAAAdIBQAAAAAHoAQEAAAAB6QEBAAAAAeoBAQAAAAECAAAABQAgHgAArgQAIAMAAAAFACAeAACuBAAgHwAArQQAIAEXAACBBQAwDAMAANoCACDKAQAA_AIAMMsBAAADABDMAQAA_AIAMM0BAQAAAAHQAUAAtQIAIdEBQAC1AgAh0gFAALUCACHgAQEAtAIAIegBAQAAAAHpAQEAywIAIeoBAQDLAgAhAgAAAAUAIBcAAK0EACACAAAAqwQAIBcAAKwEACALygEAAKoEADDLAQAAqwQAEMwBAACqBAAwzQEBALQCACHQAUAAtQIAIdEBQAC1AgAh0gFAALUCACHgAQEAtAIAIegBAQC0AgAh6QEBAMsCACHqAQEAywIAIQvKAQAAqgQAMMsBAACrBAAQzAEAAKoEADDNAQEAtAIAIdABQAC1AgAh0QFAALUCACHSAUAAtQIAIeABAQC0AgAh6AEBALQCACHpAQEAywIAIeoBAQDLAgAhB80BAQCAAwAh0AFAAIEDACHRAUAAgQMAIdIBQACBAwAh6AEBAIADACHpAQEAhgMAIeoBAQCGAwAhB80BAQCAAwAh0AFAAIEDACHRAUAAgQMAIdIBQACBAwAh6AEBAIADACHpAQEAhgMAIeoBAQCGAwAhB80BAQAAAAHQAUAAAAAB0QFAAAAAAdIBQAAAAAHoAQEAAAAB6QEBAAAAAeoBAQAAAAEEHgAAowQAMJgCAACkBAAwmgIAAKYEACCeAgAApwQAMAQeAACXBAAwmAIAAJgEADCaAgAAmgQAIJ4CAACbBAAwAx4AANcDACCYAgAA2AMAIJ4CAACfAQAgBB4AALYDADCYAgAAtwMAMJoCAAC5AwAgngIAALoDADAEHgAAqAMAMJgCAACpAwAwmgIAAKsDACCeAgAArAMAMAQeAACbAwAwmAIAAJwDADCaAgAAngMAIJ4CAACfAwAwAAAEAwAAxQQAIAcAAMYEACAPAAC4BAAg-wEAAIIDACAAAAAAAAAAAAAAAAUeAAD8BAAgHwAA_wQAIJgCAAD9BAAgmQIAAP4EACCeAgAAzQEAIAMeAAD8BAAgmAIAAP0EACCeAgAAzQEAIAgEAAC1BAAgBQAAtgQAIAsAALkEACAPAAC4BAAgEAAAtwQAIBEAALoEACDuAQAAggMAIPMBAACCAwAgAAAAAAAAAAAAAAAAAAAAAAUeAAD3BAAgHwAA-gQAIJgCAAD4BAAgmQIAAPkEACCeAgAAnwEAIAMeAAD3BAAgmAIAAPgEACCeAgAAnwEAIAAAAAseAADcBAAwHwAA4AQAMJgCAADdBAAwmQIAAN4EADCaAgAA3wQAIJsCAADtAwAwnAIAAO0DADCdAgAA7QMAMJ4CAADtAwAwnwIAAOEEADCgAgAA8AMAMBIGAADXBAAgCwAAkwQAIA4AAJQEACDNAQEAAAAB0QFAAAAAAdIBQAAAAAHfAQEAAAAB6wEBAAAAAe4BAQAAAAH7AQEAAAAB_wEIAAAAAYcCIAAAAAGIAgIAAAABiQIAAJAEACCKAgEAAAABiwIAAJEEACCMAgEAAAABjQIBAAAAAQIAAAAPACAeAADkBAAgAwAAAA8AIB4AAOQEACAfAADjBAAgARcAAPYEADACAAAADwAgFwAA4wQAIAIAAADxAwAgFwAA4gQAIA_NAQEAgAMAIdEBQACBAwAh0gFAAIEDACHfAQEAgAMAIesBAQCAAwAh7gEBAIYDACH7AQEAhgMAIf8BCADAAwAhhwIgAJIDACGIAgIApQMAIYkCAADzAwAgigIBAIYDACGLAgAA9AMAIIwCAQCGAwAhjQIBAIYDACESBgAA1gQAIAsAAPcDACAOAAD4AwAgzQEBAIADACHRAUAAgQMAIdIBQACBAwAh3wEBAIADACHrAQEAgAMAIe4BAQCGAwAh-wEBAIYDACH_AQgAwAMAIYcCIACSAwAhiAICAKUDACGJAgAA8wMAIIoCAQCGAwAhiwIAAPQDACCMAgEAhgMAIY0CAQCGAwAhEgYAANcEACALAACTBAAgDgAAlAQAIM0BAQAAAAHRAUAAAAAB0gFAAAAAAd8BAQAAAAHrAQEAAAAB7gEBAAAAAfsBAQAAAAH_AQgAAAABhwIgAAAAAYgCAgAAAAGJAgAAkAQAIIoCAQAAAAGLAgAAkQQAIIwCAQAAAAGNAgEAAAABBB4AANwEADCYAgAA3QQAMJoCAADfBAAgngIAAO0DADAAAAAAAAUeAADxBAAgHwAA9AQAIJgCAADyBAAgmQIAAPMEACCeAgAAzQEAIAMeAADxBAAgmAIAAPIEACCeAgAAzQEAIAAEAwAAxQQAIAYAALcEACAMAADtBAAggQIAAIIDACAJBgAAtwQAIAkAAPAEACALAAC5BAAgDgAA7QQAIO4BAACCAwAg-wEAAIIDACCKAgAAggMAIIwCAACCAwAgjQIAAIIDACABBwAAxgQAIA8EAACvBAAgBQAAsAQAIAsAALMEACAPAACyBAAgEAAAsQQAIM0BAQAAAAHRAUAAAAAB0gFAAAAAAesBAQAAAAHsAQEAAAAB7QEgAAAAAe4BAQAAAAHwAQAAAPABAvIBAAAA8gEC8wEBAAAAAQIAAADNAQAgHgAA8QQAIAMAAADQAQAgHgAA8QQAIB8AAPUEACARAAAA0AEAIAQAAJUDACAFAACWAwAgCwAAmQMAIA8AAJgDACAQAACXAwAgFwAA9QQAIM0BAQCAAwAh0QFAAIEDACHSAUAAgQMAIesBAQCAAwAh7AEBAIADACHtASAAkgMAIe4BAQCGAwAh8AEAAJMD8AEi8gEAAJQD8gEi8wEBAIYDACEPBAAAlQMAIAUAAJYDACALAACZAwAgDwAAmAMAIBAAAJcDACDNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHrAQEAgAMAIewBAQCAAwAh7QEgAJIDACHuAQEAhgMAIfABAACTA_ABIvIBAACUA_IBIvMBAQCGAwAhD80BAQAAAAHRAUAAAAAB0gFAAAAAAd8BAQAAAAHrAQEAAAAB7gEBAAAAAfsBAQAAAAH_AQgAAAABhwIgAAAAAYgCAgAAAAGJAgAAkAQAIIoCAQAAAAGLAgAAkQQAIIwCAQAAAAGNAgEAAAABCwMAAMQEACAPAACWBAAgzQEBAAAAAdEBQAAAAAHSAUAAAAAB4AEBAAAAAfMBAQAAAAH6AQEAAAAB-wEBAAAAAfwBAQAAAAH9ASAAAAABAgAAAJ8BACAeAAD3BAAgAwAAAAsAIB4AAPcEACAfAAD7BAAgDQAAAAsAIAMAAMMEACAPAADdAwAgFwAA-wQAIM0BAQCAAwAh0QFAAIEDACHSAUAAgQMAIeABAQCAAwAh8wEBAIADACH6AQEAgAMAIfsBAQCGAwAh_AEBAIADACH9ASAAkgMAIQsDAADDBAAgDwAA3QMAIM0BAQCAAwAh0QFAAIEDACHSAUAAgQMAIeABAQCAAwAh8wEBAIADACH6AQEAgAMAIfsBAQCGAwAh_AEBAIADACH9ASAAkgMAIQ8EAACvBAAgBQAAsAQAIAsAALMEACAPAACyBAAgEQAAtAQAIM0BAQAAAAHRAUAAAAAB0gFAAAAAAesBAQAAAAHsAQEAAAAB7QEgAAAAAe4BAQAAAAHwAQAAAPABAvIBAAAA8gEC8wEBAAAAAQIAAADNAQAgHgAA_AQAIAMAAADQAQAgHgAA_AQAIB8AAIAFACARAAAA0AEAIAQAAJUDACAFAACWAwAgCwAAmQMAIA8AAJgDACARAACaAwAgFwAAgAUAIM0BAQCAAwAh0QFAAIEDACHSAUAAgQMAIesBAQCAAwAh7AEBAIADACHtASAAkgMAIe4BAQCGAwAh8AEAAJMD8AEi8gEAAJQD8gEi8wEBAIYDACEPBAAAlQMAIAUAAJYDACALAACZAwAgDwAAmAMAIBEAAJoDACDNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHrAQEAgAMAIewBAQCAAwAh7QEgAJIDACHuAQEAhgMAIfABAACTA_ABIvIBAACUA_IBIvMBAQCGAwAhB80BAQAAAAHQAUAAAAAB0QFAAAAAAdIBQAAAAAHoAQEAAAAB6QEBAAAAAeoBAQAAAAEMzQEBAAAAAdEBQAAAAAHSAUAAAAAB3gEBAAAAAd8BAQAAAAHhAQEAAAAB4gEBAAAAAeMBAQAAAAHkAUAAAAAB5QFAAAAAAeYBAQAAAAHnAQEAAAABBc0BAQAAAAHRAUAAAAAB0gFAAAAAAesBAQAAAAGRAgEAAAABAgAAAEQAIB4AAIMFACAPBAAArwQAIAUAALAEACAPAACyBAAgEAAAsQQAIBEAALQEACDNAQEAAAAB0QFAAAAAAdIBQAAAAAHrAQEAAAAB7AEBAAAAAe0BIAAAAAHuAQEAAAAB8AEAAADwAQLyAQAAAPIBAvMBAQAAAAECAAAAzQEAIB4AAIUFACADAAAA0AEAIB4AAIUFACAfAACJBQAgEQAAANABACAEAACVAwAgBQAAlgMAIA8AAJgDACAQAACXAwAgEQAAmgMAIBcAAIkFACDNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHrAQEAgAMAIewBAQCAAwAh7QEgAJIDACHuAQEAhgMAIfABAACTA_ABIvIBAACUA_IBIvMBAQCGAwAhDwQAAJUDACAFAACWAwAgDwAAmAMAIBAAAJcDACARAACaAwAgzQEBAIADACHRAUAAgQMAIdIBQACBAwAh6wEBAIADACHsAQEAgAMAIe0BIACSAwAh7gEBAIYDACHwAQAAkwPwASLyAQAAlAPyASLzAQEAhgMAIQbNAQEAAAAB0QFAAAAAAdIBQAAAAAHgAQEAAAAB-AECAAAAAfkBAQAAAAEMAwAA6AMAIAYAANUDACDNAQEAAAAB0QFAAAAAAdIBQAAAAAHfAQEAAAAB4AEBAAAAAfIBAAAAhAIC_AEBAAAAAYECAQAAAAGCAggAAAABhQIAAACFAgICAAAAIQAgHgAAiwUAIAMAAAAfACAeAACLBQAgHwAAjwUAIA4AAAAfACADAADmAwAgBgAAxAMAIBcAAI8FACDNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHfAQEAgAMAIeABAQCAAwAh8gEAAMEDhAIi_AEBAIADACGBAgEAhgMAIYICCADAAwAhhQIAAMIDhQIiDAMAAOYDACAGAADEAwAgzQEBAIADACHRAUAAgQMAIdIBQACBAwAh3wEBAIADACHgAQEAgAMAIfIBAADBA4QCIvwBAQCAAwAhgQIBAIYDACGCAggAwAMAIYUCAADCA4UCIgTNAQEAAAAB_gEBAAAAAf8BCAAAAAGAAgIAAAABAwAAAEcAIB4AAIMFACAfAACTBQAgBwAAAEcAIBcAAJMFACDNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHrAQEAgAMAIZECAQCAAwAhBc0BAQCAAwAh0QFAAIEDACHSAUAAgQMAIesBAQCAAwAhkQIBAIADACEPzQEBAAAAAdEBQAAAAAHSAUAAAAAB6wEBAAAAAe4BAQAAAAH7AQEAAAAB_wEIAAAAAYYCAQAAAAGHAiAAAAABiAICAAAAAYkCAACQBAAgigIBAAAAAYsCAACRBAAgjAIBAAAAAY0CAQAAAAEPBAAArwQAIAUAALAEACALAACzBAAgEAAAsQQAIBEAALQEACDNAQEAAAAB0QFAAAAAAdIBQAAAAAHrAQEAAAAB7AEBAAAAAe0BIAAAAAHuAQEAAAAB8AEAAADwAQLyAQAAAPIBAvMBAQAAAAECAAAAzQEAIB4AAJUFACADAAAA0AEAIB4AAJUFACAfAACZBQAgEQAAANABACAEAACVAwAgBQAAlgMAIAsAAJkDACAQAACXAwAgEQAAmgMAIBcAAJkFACDNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHrAQEAgAMAIewBAQCAAwAh7QEgAJIDACHuAQEAhgMAIfABAACTA_ABIvIBAACUA_IBIvMBAQCGAwAhDwQAAJUDACAFAACWAwAgCwAAmQMAIBAAAJcDACARAACaAwAgzQEBAIADACHRAUAAgQMAIdIBQACBAwAh6wEBAIADACHsAQEAgAMAIe0BIACSAwAh7gEBAIYDACHwAQAAkwPwASLyAQAAlAPyASLzAQEAhgMAIQnNAQEAAAAB0QFAAAAAAdIBQAAAAAHgAQEAAAAB8gEAAACEAgL8AQEAAAABgQIBAAAAAYICCAAAAAGFAgAAAIUCAgsDAADEBAAgBwAAlQQAIM0BAQAAAAHRAUAAAAAB0gFAAAAAAeABAQAAAAHzAQEAAAAB-gEBAAAAAfsBAQAAAAH8AQEAAAAB_QEgAAAAAQIAAACfAQAgHgAAmwUAIBMGAADXBAAgCQAAkgQAIAsAAJMEACDNAQEAAAAB0QFAAAAAAdIBQAAAAAHfAQEAAAAB6wEBAAAAAe4BAQAAAAH7AQEAAAAB_wEIAAAAAYYCAQAAAAGHAiAAAAABiAICAAAAAYkCAACQBAAgigIBAAAAAYsCAACRBAAgjAIBAAAAAY0CAQAAAAECAAAADwAgHgAAnQUAIAMAAAANACAeAACdBQAgHwAAoQUAIBUAAAANACAGAADWBAAgCQAA9gMAIAsAAPcDACAXAAChBQAgzQEBAIADACHRAUAAgQMAIdIBQACBAwAh3wEBAIADACHrAQEAgAMAIe4BAQCGAwAh-wEBAIYDACH_AQgAwAMAIYYCAQCAAwAhhwIgAJIDACGIAgIApQMAIYkCAADzAwAgigIBAIYDACGLAgAA9AMAIIwCAQCGAwAhjQIBAIYDACETBgAA1gQAIAkAAPYDACALAAD3AwAgzQEBAIADACHRAUAAgQMAIdIBQACBAwAh3wEBAIADACHrAQEAgAMAIe4BAQCGAwAh-wEBAIYDACH_AQgAwAMAIYYCAQCAAwAhhwIgAJIDACGIAgIApQMAIYkCAADzAwAgigIBAIYDACGLAgAA9AMAIIwCAQCGAwAhjQIBAIYDACEEzQEBAAAAAfcBAQAAAAH_AQgAAAABgAICAAAAAQMAAAALACAeAACbBQAgHwAApQUAIA0AAAALACADAADDBAAgBwAA3AMAIBcAAKUFACDNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHgAQEAgAMAIfMBAQCAAwAh-gEBAIADACH7AQEAhgMAIfwBAQCAAwAh_QEgAJIDACELAwAAwwQAIAcAANwDACDNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHgAQEAgAMAIfMBAQCAAwAh-gEBAIADACH7AQEAhgMAIfwBAQCAAwAh_QEgAJIDACEJzQEBAAAAAdEBQAAAAAHSAUAAAAAB3wEBAAAAAfIBAAAAhAIC_AEBAAAAAYECAQAAAAGCAggAAAABhQIAAACFAgITBgAA1wQAIAkAAJIEACAOAACUBAAgzQEBAAAAAdEBQAAAAAHSAUAAAAAB3wEBAAAAAesBAQAAAAHuAQEAAAAB-wEBAAAAAf8BCAAAAAGGAgEAAAABhwIgAAAAAYgCAgAAAAGJAgAAkAQAIIoCAQAAAAGLAgAAkQQAIIwCAQAAAAGNAgEAAAABAgAAAA8AIB4AAKcFACADAAAADQAgHgAApwUAIB8AAKsFACAVAAAADQAgBgAA1gQAIAkAAPYDACAOAAD4AwAgFwAAqwUAIM0BAQCAAwAh0QFAAIEDACHSAUAAgQMAId8BAQCAAwAh6wEBAIADACHuAQEAhgMAIfsBAQCGAwAh_wEIAMADACGGAgEAgAMAIYcCIACSAwAhiAICAKUDACGJAgAA8wMAIIoCAQCGAwAhiwIAAPQDACCMAgEAhgMAIY0CAQCGAwAhEwYAANYEACAJAAD2AwAgDgAA-AMAIM0BAQCAAwAh0QFAAIEDACHSAUAAgQMAId8BAQCAAwAh6wEBAIADACHuAQEAhgMAIfsBAQCGAwAh_wEIAMADACGGAgEAgAMAIYcCIACSAwAhiAICAKUDACGJAgAA8wMAIIoCAQCGAwAhiwIAAPQDACCMAgEAhgMAIY0CAQCGAwAhBs0BAQAAAAHRAUAAAAAB0gFAAAAAAfcBAQAAAAH4AQIAAAAB-QEBAAAAAQfNAQIAAAAB0QFAAAAAAdIBQAAAAAGRAgEAAAABkgIBAAAAAZMCAQAAAAGUAgEAAAABDwUAALAEACALAACzBAAgDwAAsgQAIBAAALEEACARAAC0BAAgzQEBAAAAAdEBQAAAAAHSAUAAAAAB6wEBAAAAAewBAQAAAAHtASAAAAAB7gEBAAAAAfABAAAA8AEC8gEAAADyAQLzAQEAAAABAgAAAM0BACAeAACuBQAgAwAAANABACAeAACuBQAgHwAAsgUAIBEAAADQAQAgBQAAlgMAIAsAAJkDACAPAACYAwAgEAAAlwMAIBEAAJoDACAXAACyBQAgzQEBAIADACHRAUAAgQMAIdIBQACBAwAh6wEBAIADACHsAQEAgAMAIe0BIACSAwAh7gEBAIYDACHwAQAAkwPwASLyAQAAlAPyASLzAQEAhgMAIQ8FAACWAwAgCwAAmQMAIA8AAJgDACAQAACXAwAgEQAAmgMAIM0BAQCAAwAh0QFAAIEDACHSAUAAgQMAIesBAQCAAwAh7AEBAIADACHtASAAkgMAIe4BAQCGAwAh8AEAAJMD8AEi8gEAAJQD8gEi8wEBAIYDACEPBAAArwQAIAsAALMEACAPAACyBAAgEAAAsQQAIBEAALQEACDNAQEAAAAB0QFAAAAAAdIBQAAAAAHrAQEAAAAB7AEBAAAAAe0BIAAAAAHuAQEAAAAB8AEAAADwAQLyAQAAAPIBAvMBAQAAAAECAAAAzQEAIB4AALMFACADAAAA0AEAIB4AALMFACAfAAC3BQAgEQAAANABACAEAACVAwAgCwAAmQMAIA8AAJgDACAQAACXAwAgEQAAmgMAIBcAALcFACDNAQEAgAMAIdEBQACBAwAh0gFAAIEDACHrAQEAgAMAIewBAQCAAwAh7QEgAJIDACHuAQEAhgMAIfABAACTA_ABIvIBAACUA_IBIvMBAQCGAwAhDwQAAJUDACALAACZAwAgDwAAmAMAIBAAAJcDACARAACaAwAgzQEBAIADACHRAUAAgQMAIdIBQACBAwAh6wEBAIADACHsAQEAgAMAIe0BIACSAwAh7gEBAIYDACHwAQAAkwPwASLyAQAAlAPyASLzAQEAhgMAIQEDAAIHBAYDBQoECAAPCyYJDyULEAwFESkBAQMAAgEDAAIEAwACBxAGCAAODyILBQYABQgADQkABwsWCQ4aCgIHEQYIAAgBBxIAAgMAAgoABgIKAAYNAAsEAwACBgAFCAAMDBsKAQwcAAILHQAOHgACByMADyQABQQqAAUrAAstAA8sABEuAAABAwACAQMAAgUIABQkABUlABYmABcnABgAAAAAAAUIABQkABUlABYmABcnABgAAAMIAB0mAB4nAB8AAAADCAAdJgAeJwAfAgYABQkABwIGAAUJAAcFCAAkJAAlJQAmJgAnJwAoAAAAAAAFCAAkJAAlJQAmJgAnJwAoAgMAAgYABQIDAAIGAAUFCAAtJAAuJQAvJgAwJwAxAAAAAAAFCAAtJAAuJQAvJgAwJwAxAgoABg0ACwIKAAYNAAsFCAA2JAA3JQA4JgA5JwA6AAAAAAAFCAA2JAA3JQA4JgA5JwA6AQMAAgEDAAIDCAA_JgBAJwBBAAAAAwgAPyYAQCcAQQIDAAIKAAYCAwACCgAGBQgARiQARyUASCYASScASgAAAAAABQgARiQARyUASCYASScASgAAAwgATyYAUCcAUQAAAAMIAE8mAFAnAFEBAwACAQMAAgMIAFYmAFcnAFgAAAADCABWJgBXJwBYAQMAAgEDAAIDCABdJgBeJwBfAAAAAwgAXSYAXicAXwAAAAMIAGUmAGYnAGcAAAADCABlJgBmJwBnEgIBEy8BFDABFTEBFjIBGDQBGTYQGjcRGzkBHDsQHTwSID0BIT4BIj8QKEITKUMZKkUHK0YHLEkHLUoHLksHL00HME8QMVAaMlIHM1QQNFUbNVYHNlcHN1gQOFscOVwgOl0GO14GPF8GPWAGPmEGP2MGQGUQQWYhQmgGQ2oQRGsiRWwGRm0GR24QSHEjSXIpSnMLS3QLTHULTXYLTncLT3kLUHsQUXwqUn4LU4ABEFSBAStVggELVoMBC1eEARBYhwEsWYgBMlqJAQpbigEKXIsBCl2MAQpejQEKX48BCmCRARBhkgEzYpQBCmOWARBklwE0ZZgBCmaZAQpnmgEQaJ0BNWmeATtqoAEFa6EBBWyjAQVtpAEFbqUBBW-nAQVwqQEQcaoBPHKsAQVzrgEQdK8BPXWwAQV2sQEFd7IBEHi1AT55tgFCercBCXu4AQl8uQEJfboBCX67AQl_vQEJgAG_ARCBAcABQ4IBwgEJgwHEARCEAcUBRIUBxgEJhgHHAQmHAcgBEIgBywFFiQHMAUuKAc4BAosBzwECjAHSAQKNAdMBAo4B1AECjwHWAQKQAdgBEJEB2QFMkgHbAQKTAd0BEJQB3gFNlQHfAQKWAeABApcB4QEQmAHkAU6ZAeUBUpoB5gEDmwHnAQOcAegBA50B6QEDngHqAQOfAewBA6AB7gEQoQHvAVOiAfEBA6MB8wEQpAH0AVSlAfUBA6YB9gEDpwH3ARCoAfoBVakB-wFZqgH8AQSrAf0BBKwB_gEErQH_AQSuAYACBK8BggIEsAGEAhCxAYUCWrIBhwIEswGJAhC0AYoCW7UBiwIEtgGMAgS3AY0CELgBkAJcuQGRAmC6AZMCYbsBlAJhvAGXAmG9AZgCYb4BmQJhvwGbAmHAAZ0CEMEBngJiwgGgAmHDAaICEMQBowJjxQGkAmHGAaUCYccBpgIQyAGpAmTJAaoCaA"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/enums.ts
var Role = {
  ADMIN: "ADMIN",
  PROVIDER: "PROVIDER",
  CUSTOMER: "CUSTOMER",
  DRIVER: "DRIVER",
  SUPPORT: "SUPPORT"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BLOCKED: "BLOCKED",
  DELETED: "DELETED"
};
var OrderStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  COOKING: "COOKING",
  ON_THE_WAY: "ON_THE_WAY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED"
};

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/lib/prisma.ts
var connectionString = `${envVars.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma2 = new PrismaClient({ adapter });

// src/app/lib/auth.ts
var auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma2, {
    provider: "postgresql"
  }),
  // trustedOrigins: [envVars.FRONTEND_URL!],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: false,
    requireEmailVerification: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: Role.CUSTOMER
      },
      status: {
        type: "string",
        defaultValue: UserStatus.ACTIVE
      },
      phone: {
        type: "string",
        required: false
      }
    }
  },
  trustedOrigins: [envVars.BETTER_AUTH_URL || "http://localhost:5000", envVars.FRONTEND_URL],
  advanced: {
    // disableCSRFCheck: true,
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      }
    }
  },
  session: {
    expiresIn: 60 * 60 * 60 * 24,
    // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24,
    // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24
      // 1 day in seconds
    }
  }
  //   emailVerification: {
  //     sendOnSignUp: true,
  //     autoSignInAfterVerification: false,
  // //     sendVerificationEmail: async ({ user, url, token }) => {
  // //       try {
  // //         const verificationURL = `${envVars.FRONTEND_URL}/verify-email?token=${token}`;
  // //         const info = await transporter.sendMail({
  // //           from: "MealMate",
  // //           to: user.email,
  // //           subject: "Welcome to the table! Verify your email",
  // //           html: `<!DOCTYPE html>
  // // <html lang="en">
  // // <head>
  // //   <meta charset="UTF-8" />
  // //   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  // //   <title>Verify Your Email - MealMate</title>
  // //   <style>
  // //     body { margin: 0; padding: 0; background-color: #FAF9F7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
  // //     .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.03); border: 1px solid #F3F4F6; }
  // //     .header { background-color: #ffffff; padding: 40px 20px; text-align: center; border-bottom: 1px solid #FAF9F7; }
  // //     .logo-text { margin: 0; font-size: 32px; font-weight: bold; color: #1F2933; letter-spacing: -1px; text-transform: uppercase; }
  // //     .logo-accent { color: #D97757; }
  // //     .content { padding: 40px; color: #1F2933; line-height: 1.7; text-align: center; }
  // //     .content h2 { margin-top: 0; font-size: 28px; color: #1F2933; font-weight: 700; }
  // //     .content p { font-size: 16px; color: #4B5563; margin-bottom: 24px; }
  // //     .button-wrapper { text-align: center; margin: 35px 0; }
  // //     .verify-button { background-color: #D97757; color: #ffffff !important; padding: 18px 36px; text-decoration: none; font-weight: bold; border-radius: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(217, 119, 87, 0.2); font-size: 16px; }
  // //     .footer { background-color: #FAF9F7; padding: 30px; text-align: center; font-size: 13px; color: #9CA3AF; }
  // //     .link-text { word-break: break-all; font-size: 12px; color: #D97757; background: #FAF9F7; padding: 15px; border-radius: 12px; margin-top: 25px; border: 1px dashed #D97757/20; }
  // //     .signature { margin-top: 40px; font-size: 14px; color: #1F2933; }
  // //   </style>
  // // </head>
  // // <body>
  // //   <div class="container">
  // //     <div class="header">
  // //       <h1 class="logo-text">Meal<span class="logo-accent">Mate</span></h1>
  // //     </div>
  // //     <div class="content">
  // //       <h2>Welcome to the table, ${user.name || 'Gourmet'}!</h2>
  // //       <p>
  // //         We're thrilled to have you join our community. Your journey toward chef-crafted, premium meals starts here. To get access to your personalized kitchen, please verify your email address below.
  // //       </p>
  // //       <div class="button-wrapper">
  // //         <a href="${verificationURL}" class="verify-button">
  // //           Verify My Account
  // //         </a>
  // //       </div>
  // //       <p style="font-size: 14px; color: #9CA3AF; margin-top: 40px;">
  // //         If the button doesn't work, copy and paste this link:
  // //       </p>
  // //       <div class="link-text">
  // //         ${verificationURL}
  // //       </div>
  // //       <p class="signature">
  // //         Stay hungry,<br />
  // //         <strong>The MealMate Team</strong>
  // //       </p>
  // //     </div>
  // //     <div class="footer">
  // //       © ${new Date().getFullYear()} MealMate. Crafted for gourmet lovers.<br/>
  // //       Dhaka, Bangladesh
  // //     </div>
  // //   </div>
  // // </body>
  // // </html>
  // // `
  // //         });
  // //       } catch (error) {
  // //         console.error("Email verification error:", error);
  // //       }
  // //     },
  //   },
});

// src/app/routes/index.ts
import express4 from "express";

// src/app/modules/category/category.route.ts
import { Router } from "express";

// src/app/modules/category/category.controller.ts
import status5 from "http-status";

// src/app/shared/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/app/modules/category/category.services.ts
import status4 from "http-status";
import slugify from "slugify";
var createCategoryIntoDB = async (payload) => {
  const { name } = payload;
  const data = await prisma2.category.create({
    data: {
      name,
      slug: slugify(name, {
        replacement: "-",
        lower: true,
        trim: true,
        remove: /[*+~.()'"!:@]/g,
        strict: true
      })
    }
  });
  if (!data) {
    throw new AppError_default(status4.BAD_REQUEST, "Failed to create category");
  }
  return data;
};
var getAllCategoriesFromDB = async () => {
  const result = await prisma2.category.findMany();
  return result;
};
var getCategoryById = async (id) => {
  const result = await prisma2.category.findUnique({
    where: {
      id
    }
  });
  if (!result) {
    throw new Error("Category not found");
  }
  return result;
};
var updateCategoryIntoDB = async (id, payload) => {
  const { name } = payload;
  const category = await prisma2.category.findUnique({
    where: { id }
  });
  if (!category) {
    throw new AppError_default(status4.NOT_FOUND, "Category not found");
  }
  const data = await prisma2.category.update({
    where: { id },
    data: {
      name,
      slug: slugify(name, {
        replacement: "-",
        lower: true,
        trim: true,
        remove: /[*+~.()'"!:@]/g,
        strict: true
      })
    }
  });
  return data;
};
var deleteCategoryFromDB = async (id) => {
  const categoryIsExists = await prisma2.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { meals: true }
      }
    }
  });
  if (!categoryIsExists) {
    throw new AppError_default(status4.NOT_FOUND, "Category not found");
  }
  if (categoryIsExists._count.meals > 0) {
    throw new AppError_default(
      status4.BAD_REQUEST,
      "Cannot delete category with meals"
    );
  }
  await prisma2.category.delete({
    where: { id }
  });
  return { message: "Meal category deleted successfully" };
};
var CategoryService = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  updateCategoryIntoDB,
  getCategoryById,
  deleteCategoryFromDB
};

// src/app/modules/category/category.controller.ts
var createCategory = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const result = await CategoryService.createCategoryIntoDB(payload);
    sendResponse(res, {
      statusCode: status5.CREATED,
      success: true,
      message: "Category created successfully",
      data: result
    });
  }
);
var getAllCategories = catchAsync(
  async (req, res) => {
    const result = await CategoryService.getAllCategoriesFromDB();
    sendResponse(res, {
      statusCode: status5.OK,
      success: true,
      message: "Categories fetched successfully",
      data: result
    });
  }
);
var getCategoryById2 = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const result = await CategoryService.getCategoryById(id);
    sendResponse(res, {
      statusCode: status5.OK,
      success: true,
      message: "Category fetched successfully",
      data: result
    });
  }
);
var updateCategory = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await CategoryService.updateCategoryIntoDB(id, payload);
    sendResponse(res, {
      statusCode: status5.OK,
      success: true,
      message: "Category updated successfully",
      data: result
    });
  }
);
var deleteCategory = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    await CategoryService.deleteCategoryFromDB(id);
    sendResponse(res, {
      statusCode: status5.OK,
      success: true,
      message: "Category deleted successfully",
      data: null
    });
  }
);
var CategoryController = {
  createCategory,
  getAllCategories,
  getCategoryById: getCategoryById2,
  updateCategory,
  deleteCategory
};

// src/app/middleware/auth.ts
import status6 from "http-status";
import { fromNodeHeaders } from "better-auth/node";
var auth2 = (...roles) => {
  return async (req, res, next) => {
    try {
      const headers = fromNodeHeaders(req.headers);
      const session = await auth.api.getSession({
        headers
      });
      if (!session || !session.user) {
        throw new AppError_default(
          status6.UNAUTHORIZED,
          "Unauthorized! Please log in to access this resource."
        );
      }
      if (!session.user.emailVerified) {
        throw new AppError_default(
          status6.FORBIDDEN,
          "Email verification required to access this resource. Please verfiy your email!"
        );
      }
      if (session.user.status === UserStatus.BLOCKED || session.user.status === UserStatus.INACTIVE || session.user.status === UserStatus.DELETED) {
        throw new AppError_default(
          status6.FORBIDDEN,
          "Your account is not active. Please contact the admin for assistance."
        );
      }
      req.user = {
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        phone: session.user.phone,
        status: session.user.status,
        emailVerified: session.user.emailVerified,
        createdAt: session.user.createdAt,
        updatedAt: session.user.updatedAt
      };
      if (roles.length && !roles.includes(req?.user?.role)) {
        throw new AppError_default(
          status6.FORBIDDEN,
          "Forbidden! You don't have permission to access this resources!"
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

// src/app/middleware/validateRequest.ts
var validateRequest = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      params: req.params,
      query: req.query
    });
    return next();
  } catch (err) {
    next(err);
  }
};
var validateRequest_default = validateRequest;

// src/app/modules/category/category.validation.ts
import z2 from "zod";
var CategoryValidation = {
  categoryZodSchema: z2.object({
    body: z2.object({
      name: z2.string().min(2, "Name must be at least 2 characters long")
    })
  })
};

// src/app/modules/category/category.route.ts
var router = Router();
router.post(
  "/create-category",
  auth2(Role.ADMIN),
  validateRequest_default(CategoryValidation.categoryZodSchema),
  CategoryController.createCategory
);
router.get(
  "/get-all-category",
  CategoryController.getAllCategories
);
router.get(
  "/:id",
  CategoryController.getCategoryById
);
router.patch(
  "/:id",
  auth2(Role.ADMIN),
  validateRequest_default(CategoryValidation.categoryZodSchema),
  CategoryController.updateCategory
);
router.delete(
  "/:id",
  auth2(Role.ADMIN),
  CategoryController.deleteCategory
);
var CategoryRoutes = router;

// src/app/modules/meal/meal.route.ts
import { Router as Router2 } from "express";

// src/app/modules/meal/meal.controller.ts
import status8 from "http-status";

// src/app/modules/meal/meal.service.ts
import status7 from "http-status";

// src/app/helpers/QueryBuilder.ts
var buildMealQueryCondition = (payload) => {
  const andConditions = [];
  if (payload.search) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: payload.search,
            mode: "insensitive"
          }
        },
        {
          description: {
            contains: payload.search,
            mode: "insensitive"
          }
        }
      ]
    });
  }
  if (payload.cuisine) {
    andConditions.push({
      cuisine: {
        equals: payload.cuisine,
        mode: "insensitive"
      }
    });
  }
  if (payload.dietary) {
    andConditions.push({
      dietary: {
        has: payload.dietary
        // ["halal"]
      }
    });
  }
  if (payload.mealType) {
    andConditions.push({
      mealType: {
        equals: payload.mealType,
        mode: "insensitive"
      }
    });
  }
  if (payload.spiceLevel) {
    andConditions.push({
      spiceLevel: {
        equals: payload.spiceLevel,
        mode: "insensitive"
      }
    });
  }
  return andConditions.length > 0 ? { AND: andConditions } : {};
};

// src/app/modules/meal/meal.service.ts
var createMealIntoDB = async (payload) => {
  const { name, calories, ingredients, description, price, image, isAvailable, categoryId, dietary, cuisine, mealType, spiceLevel, userId } = payload;
  const meal = await prisma2.$transaction(async (tx) => {
    const provider = await tx.providerProfile.findUnique({
      where: {
        userId
      }
    });
    if (!provider) {
      throw new AppError_default(status7.NOT_FOUND, "Provider not found");
    }
    const data = await tx.meal.create({
      data: {
        name,
        calories: Number(calories),
        ingredients,
        description: description ?? null,
        price: Number(price),
        image: image ?? null,
        isAvailable,
        categoryId,
        providerId: provider.id,
        dietary,
        cuisine,
        mealType,
        spiceLevel
      }
    });
    return data;
  });
  return meal;
};
var getAllMealsFromDB = async (payload) => {
  const meal = await prisma2.meal.findMany({
    take: Number(payload.limit),
    skip: Number(payload.skip),
    where: buildMealQueryCondition(payload),
    ...payload.sortBy && { orderBy: { [payload.sortBy]: payload.sortOrder } }
  });
  const total = await prisma2.meal.count({
    where: buildMealQueryCondition(payload)
  });
  if (!meal || meal.length === 0) {
    throw new AppError_default(status7.NOT_FOUND, "Meal not found");
  }
  const totalPages = Math.ceil(total / Number(payload.limit));
  return {
    data: meal,
    pagination: {
      total,
      page: payload.page || 1,
      limit: payload.limit || 10,
      totalPages
    }
  };
};
var getSingleMealFromDB = async (mealId) => {
  const result = await prisma2.meal.findUnique({
    where: {
      id: mealId
    },
    include: {
      reviews: true,
      category: true,
      provider: {
        select: {
          id: true,
          shopName: true,
          address: true
        }
      }
    }
  });
  if (!result) {
    throw new AppError_default(status7.NOT_FOUND, "Meal not found");
  }
  return result;
};
var getProviderMealsFromDB = async (userId) => {
  const provider = await prisma2.providerProfile.findUnique({
    where: {
      userId
    }
  });
  if (!provider) {
    throw new AppError_default(status7.NOT_FOUND, "Provider not found");
  }
  const result = await prisma2.meal.findMany({
    where: {
      providerId: provider.id
    },
    include: {
      category: true,
      reviews: true,
      provider: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return {
    data: result,
    pagination: {
      total: result.length
    }
  };
};
var updateMealIntoDB = async (mealId, userId, payload) => {
  const provider = await prisma2.providerProfile.findUnique({
    where: {
      userId
    }
  });
  if (!provider) {
    throw new AppError_default(status7.NOT_FOUND, "Provider not found");
  }
  const isExistMeal = await prisma2.meal.findUnique({
    where: {
      id: mealId,
      providerId: provider.id
    }
  });
  if (!isExistMeal) {
    throw new AppError_default(status7.NOT_FOUND, "Meal not found");
  }
  if (isExistMeal.providerId !== provider.id) {
    throw new AppError_default(status7.FORBIDDEN, "You are not authorized to update this meal");
  }
  const result = await prisma2.meal.update({
    where: {
      id: mealId
    },
    data: {
      ...payload,
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  return result;
};
var deleteMealFromDB = async (mealId, userId) => {
  const provider = await prisma2.providerProfile.findUnique({
    where: {
      userId
    }
  });
  if (!provider) {
    throw new AppError_default(status7.NOT_FOUND, "Provider not found");
  }
  const isExistMeal = await prisma2.meal.findUnique({
    where: {
      id: mealId,
      providerId: provider.id
    }
  });
  if (!isExistMeal) {
    throw new AppError_default(status7.NOT_FOUND, "Meal not found");
  }
  if (isExistMeal.providerId !== provider.id) {
    throw new AppError_default(status7.FORBIDDEN, "You are not authorized to delete this meal");
  }
  const runningOrder = await prisma2.order.findFirst({
    where: {
      status: {
        in: [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.COOKING, OrderStatus.ON_THE_WAY]
      },
      items: {
        some: {
          mealId
        }
      }
    }
  });
  if (runningOrder) {
    throw new AppError_default(status7.BAD_REQUEST, "Meal is already ordered");
  }
  const result = await prisma2.meal.delete({
    where: {
      id: mealId
    }
  });
  return result;
};
var getProviderOrdersFromDB = async (userId) => {
  const provider = await prisma2.providerProfile.findUnique({
    where: { userId }
  });
  if (!provider) {
    throw new AppError_default(status7.NOT_FOUND, "Provider profile not found");
  }
  const orders = await prisma2.order.findMany({
    where: { providerId: provider.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      items: {
        include: {
          meal: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return {
    data: orders,
    pagination: {
      total: orders.length
    }
  };
};
var getPopularMealsFromDB = async () => {
  const meals = await prisma2.meal.findMany({
    orderBy: {
      reviews: {
        _count: "desc"
      }
    },
    take: 8,
    include: {
      reviews: true,
      category: true,
      provider: {
        select: {
          id: true,
          shopName: true,
          address: true
        }
      }
    }
  });
  return {
    data: meals,
    pagination: {
      total: meals.length
    }
  };
};
var dietaryOptionsFromDB = async () => {
  const result = await prisma2.meal.findMany({
    distinct: ["dietary"],
    select: {
      dietary: true
    }
  });
  const dietarySet = /* @__PURE__ */ new Set();
  result.forEach((meal) => {
    meal.dietary.forEach((dietary) => {
      dietarySet.add(dietary);
    });
  });
  return Array.from(dietarySet);
};
var getCusineOptionsFromDB = async () => {
  const result = await prisma2.meal.findMany({
    distinct: ["cuisine"],
    select: {
      cuisine: true
    }
  });
  return result.map((meal) => meal.cuisine).filter((cusine) => cusine !== null);
};
var updateOrderStatusIntoDB = async (userId, orderId, orderStatus) => {
  const provider = await prisma2.providerProfile.findUnique({
    where: { userId }
  });
  if (!provider) {
    throw new AppError_default(status7.NOT_FOUND, "Provider profile not found");
  }
  const isExistOrder = await prisma2.meal.findUnique({
    where: {
      id: orderId,
      providerId: provider.id
    }
  });
  if (!isExistOrder) {
    throw new AppError_default(status7.NOT_FOUND, "Order not found");
  }
  if (isExistOrder.providerId !== provider.id) {
    throw new AppError_default(status7.FORBIDDEN, "You are not authorized to delete this meal");
  }
  const result = await prisma2.order.update({
    where: {
      id: orderId
    },
    data: {
      status: orderStatus,
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  return result;
};
var getMealTypesFromDB = async () => {
  const mealTypes = await prisma2.meal.findMany({
    distinct: ["mealType"],
    select: {
      mealType: true
    }
  });
  return mealTypes.map((meal) => meal.mealType).filter((type) => type !== null);
};
var MealService = {
  createMealIntoDB,
  getAllMealsFromDB,
  getSingleMealFromDB,
  updateMealIntoDB,
  deleteMealFromDB,
  updateOrderStatusIntoDB,
  getProviderMealsFromDB,
  getPopularMealsFromDB,
  dietaryOptionsFromDB,
  getCusineOptionsFromDB,
  getProviderOrdersFromDB,
  getMealTypesFromDB
};

// src/app/helpers/PaginationSortingHelper.ts
var paginationSortingHelper = (options) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder || "desc";
  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder
  };
};
var PaginationSortingHelper_default = paginationSortingHelper;

// src/app/modules/meal/meal.controller.ts
var createMeal = catchAsync(
  async (req, res) => {
    const userId = req.user?.userId;
    const result = await MealService.createMealIntoDB({ ...req.body, userId });
    sendResponse(res, {
      statusCode: status8.CREATED,
      success: true,
      message: "Meal created successfully",
      data: result
    });
  }
);
var getAllMeals = catchAsync(
  async (req, res) => {
    const payload = req.query;
    const { page, limit, skip, sortBy, sortOrder } = PaginationSortingHelper_default(payload);
    const result = await MealService.getAllMealsFromDB({
      ...payload,
      page,
      limit,
      skip,
      ...sortBy && { sortBy },
      ...sortOrder && { sortOrder }
    });
    sendResponse(res, {
      statusCode: status8.OK,
      success: true,
      message: "Meals fetched successfully",
      data: result
    });
  }
);
var getSingleMeal = catchAsync(
  async (req, res) => {
    const mealId = req.params.id;
    const result = await MealService.getSingleMealFromDB(mealId);
    sendResponse(res, {
      statusCode: status8.OK,
      success: true,
      message: "Meal fetched successfully",
      data: result
    });
  }
);
var getProviderMeals = catchAsync(
  async (req, res) => {
    const userId = req.user?.userId;
    const result = await MealService.getProviderMealsFromDB(userId);
    sendResponse(res, {
      statusCode: status8.OK,
      success: true,
      message: "Provider meals fetched successfully",
      data: result
    });
  }
);
var updateMeal = catchAsync(
  async (req, res) => {
    const mealId = req.params.id;
    const userId = req.user?.userId;
    const result = await MealService.updateMealIntoDB(mealId, userId, req.body);
    sendResponse(res, {
      statusCode: status8.OK,
      success: true,
      message: "Meal updated successfully",
      data: result
    });
  }
);
var deleteMeal = catchAsync(
  async (req, res) => {
    const mealId = req.params.id;
    const userId = req.user?.userId;
    const result = await MealService.deleteMealFromDB(mealId, userId);
    sendResponse(res, {
      statusCode: status8.OK,
      success: true,
      message: "Meal deleted successfully",
      data: result
    });
  }
);
var getProviderOrders = catchAsync(
  async (req, res) => {
    const userId = req.user?.userId;
    const result = await MealService.getProviderOrdersFromDB(userId);
    sendResponse(res, {
      statusCode: status8.OK,
      success: true,
      message: "Provider orders fetched successfully",
      data: result
    });
  }
);
var updateOrderStatus = catchAsync(
  async (req, res) => {
    const userId = req.user?.userId;
    const orderId = req.params.id;
    const orderStatus = req.body.status;
    const result = await MealService.updateOrderStatusIntoDB(orderId, userId, orderStatus);
    sendResponse(res, {
      statusCode: status8.OK,
      success: true,
      message: "Order status updated successfully",
      data: result
    });
  }
);
var getMealTypes = catchAsync(
  async (req, res) => {
    const result = await MealService.getMealTypesFromDB();
    sendResponse(res, {
      statusCode: status8.OK,
      success: true,
      message: "Meal types fetched successfully",
      data: result
    });
  }
);
var getDietaryOptions = catchAsync(
  async (req, res) => {
    const result = await MealService.dietaryOptionsFromDB();
    sendResponse(res, {
      statusCode: status8.OK,
      success: true,
      message: "Dietary options fetched successfully",
      data: result
    });
  }
);
var getCuisineOptions = catchAsync(
  async (req, res) => {
    const result = await MealService.getCusineOptionsFromDB();
    sendResponse(res, {
      statusCode: status8.OK,
      success: true,
      message: "Cuisine options fetched successfully",
      data: result
    });
  }
);
var getPopularMeals = catchAsync(
  async (req, res) => {
    const result = await MealService.getPopularMealsFromDB();
    sendResponse(res, {
      statusCode: status8.OK,
      success: true,
      message: "Popular meals fetched successfully",
      data: result
    });
  }
);
var MealController = {
  getProviderMeals,
  updateMeal,
  deleteMeal,
  getProviderOrders,
  updateOrderStatus,
  getMealTypes,
  getDietaryOptions,
  getCuisineOptions,
  getPopularMeals,
  getSingleMeal,
  getAllMeals,
  createMeal
};

// src/app/modules/meal/meal.validation.ts
import z3 from "zod";
var MealValidation = {
  mealCreateZodSchema: z3.object({
    body: z3.object({
      name: z3.string().min(2, "Name must be at least 2 characters long"),
      calories: z3.number().min(0, "Calories must be a positive number"),
      ingredients: z3.array(z3.string()).min(1, "At least one ingredient is required"),
      dietary: z3.array(z3.string()).min(1, "At least one dietary preference is required"),
      cuisine: z3.string().min(2, "Cuisine must be at least 2 characters long").optional(),
      description: z3.string().optional(),
      price: z3.number().min(0, "Price must be a positive number"),
      image: z3.string().url("Image must be a valid URL").optional(),
      isAvailable: z3.boolean().optional().default(true),
      categoryId: z3.string().uuid("Category ID must be a valid UUID"),
      mealType: z3.string().optional(),
      spiceLevel: z3.string().optional()
    })
  }),
  mealUpdateZodSchema: z3.object({
    body: z3.object({
      name: z3.string().min(2, "Name must be at least 2 characters long").optional(),
      calories: z3.number().min(0, "Calories must be a positive number").optional(),
      ingredients: z3.array(z3.string()).min(1, "At least one ingredient is required").optional(),
      description: z3.string().optional(),
      price: z3.number().min(0, "Price must be a positive number").optional(),
      image: z3.string().url("Image must be a valid URL").optional(),
      isAvailable: z3.boolean().optional(),
      categoryId: z3.string().uuid("Category ID must be a valid UUID").optional()
    })
  })
};

// src/app/modules/meal/meal.route.ts
var router2 = Router2();
router2.get(
  "/",
  MealController.getAllMeals
);
router2.get(
  "/:id",
  MealController.getSingleMeal
);
router2.get(
  "/types/list",
  MealController.getMealTypes
);
router2.get(
  "/dietary-options/list",
  MealController.getDietaryOptions
);
router2.get(
  "/cuisine-options/list",
  MealController.getCuisineOptions
);
router2.post(
  "/",
  auth2(Role.PROVIDER),
  validateRequest_default(MealValidation.mealCreateZodSchema),
  MealController.createMeal
);
router2.get(
  "/provider/meals",
  auth2(Role.PROVIDER),
  MealController.getProviderMeals
);
router2.get(
  "/popular/list",
  MealController.getPopularMeals
);
router2.put(
  "/:id",
  auth2(Role.PROVIDER),
  validateRequest_default(MealValidation.mealUpdateZodSchema),
  MealController.updateMeal
);
router2.get(
  "/provider/orders",
  auth2(Role.PROVIDER),
  MealController.getProviderOrders
);
router2.put(
  "/orders/:id/status",
  auth2(Role.PROVIDER),
  MealController.updateOrderStatus
);
router2.delete(
  "/:id",
  auth2(Role.PROVIDER),
  MealController.deleteMeal
);
var MealRoutes = router2;

// src/app/modules/order/order.route.ts
import { Router as Router3 } from "express";

// src/app/modules/order/order.controller.ts
import status10 from "http-status";

// src/app/modules/order/order.service.ts
import status9 from "http-status";
var createOrderIntoDB = async (payload, userId) => {
  const provider = await prisma2.providerProfile.findUnique({
    where: {
      id: payload.providerId
    },
    include: {
      user: {
        select: {
          status: true
        }
      }
    }
  });
  if (!provider) {
    throw new AppError_default(status9.NOT_FOUND, "Provider not found");
  }
  if (provider.user.status !== "ACTIVE") {
    throw new AppError_default(status9.BAD_REQUEST, "Provider is not active");
  }
  const mealsId = payload.items.map((item) => item.mealId);
  const meals = await prisma2.meal.findMany({
    where: {
      id: {
        in: mealsId
      }
    }
  });
  if (!meals) {
    throw new AppError_default(status9.NOT_FOUND, "Meal not found");
  }
  if (meals.length !== payload.items.length) {
    throw new AppError_default(status9.BAD_REQUEST, "Meal not found");
  }
  let totalPrice = 0;
  const orderItems = payload.items.map((item) => {
    const meal = meals.find((meal2) => meal2.id === item.mealId);
    if (!meal) {
      throw new AppError_default(status9.NOT_FOUND, "Meal not found");
    }
    totalPrice += meal.price * item.quantity;
    return {
      mealId: meal.id,
      quantity: item.quantity,
      price: meal.price
    };
  });
  const orderNumber = `ORD-${Date.now()}`;
  const result = await prisma2.order.create({
    data: {
      orderNumber,
      userId,
      providerId: provider.id,
      address: payload.address,
      totalAmount: totalPrice,
      status: OrderStatus.PENDING,
      items: {
        create: orderItems
      }
    },
    include: {
      items: {
        include: {
          meal: true
        }
      }
    }
  });
  return result;
};
var getMyOrdersFromDB = (customerId) => {
  const orders = prisma2.order.findMany({
    where: {
      userId: customerId
    },
    include: {
      items: {
        include: {
          meal: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return orders;
};
var getOrderByIdFromDB = (orderId, customerId) => {
  const order = prisma2.order.findFirst({
    where: {
      id: orderId,
      userId: customerId
    },
    include: {
      items: {
        include: {
          meal: {
            include: {
              provider: true
            }
          }
        }
      },
      provider: true
    }
  });
  if (!order) {
    throw new AppError_default(status9.NOT_FOUND, "Order not found");
  }
  return order;
};
var updateOrderStatusIntoDB2 = (orderId, orderStatus, providerId) => {
  const order = prisma2.order.findFirst({
    where: {
      id: orderId,
      providerId
    }
  });
  if (!order) {
    throw new AppError_default(status9.NOT_FOUND, "Order not found");
  }
  const updatedOrder = prisma2.order.update({
    where: {
      id: orderId
    },
    data: {
      status: orderStatus
    },
    include: {
      items: {
        include: {
          meal: true
        }
      }
    }
  });
  if (!updatedOrder) {
    throw new AppError_default(status9.NOT_FOUND, "Order not found");
  }
  return updatedOrder;
};
var trackOrderStatusIntoDB = (orderId, userId) => {
  const order = prisma2.order.findFirst({
    where: {
      id: orderId,
      userId
    },
    select: {
      id: true,
      status: true,
      address: true,
      totalAmount: true,
      createdAt: true,
      updatedAt: true,
      items: {
        include: {
          meal: true
        }
      },
      provider: true
    }
  });
  if (!order) {
    throw new AppError_default(status9.NOT_FOUND, "Order not found");
  }
  return order;
};
var cancelOrderIntoDB = (orderId, customerId) => {
  const order = prisma2.order.findFirst({
    where: {
      id: orderId,
      userId: customerId
    }
  });
  if (!order) {
    throw new AppError_default(status9.NOT_FOUND, "Order not found");
  }
  if (order?.status === OrderStatus.CANCELLED) {
    throw new AppError_default(status9.BAD_REQUEST, "Order is already cancelled");
  }
  const updatedOrder = prisma2.order.update({
    where: {
      id: orderId
    },
    data: {
      status: OrderStatus.CANCELLED
    },
    include: {
      items: {
        include: {
          meal: true
        }
      }
    }
  });
  if (!updatedOrder) {
    throw new AppError_default(status9.NOT_FOUND, "Order not found");
  }
  return updatedOrder;
};
var getAllOrdersFromDB = async () => {
  const orders = prisma2.order.findMany({
    include: {
      items: {
        include: {
          meal: true
        }
      },
      provider: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  if (!orders) {
    throw new AppError_default(status9.NOT_FOUND, "Orders not found");
  }
  return orders;
};
var OrderService = {
  createOrderIntoDB,
  getMyOrdersFromDB,
  getOrderByIdFromDB,
  updateOrderStatusIntoDB: updateOrderStatusIntoDB2,
  trackOrderStatusIntoDB,
  getAllOrdersFromDB,
  cancelOrderIntoDB
};

// src/app/modules/order/order.controller.ts
var createOrder = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error("User not found");
    }
    const result = await OrderService.createOrderIntoDB(payload, userId);
    sendResponse(res, {
      statusCode: status10.CREATED,
      success: true,
      message: "Order created successfully",
      data: result
    });
  }
);
var getAllOrders = catchAsync(
  async (req, res) => {
    const result = await OrderService.getAllOrdersFromDB();
    sendResponse(res, {
      statusCode: status10.OK,
      success: true,
      message: "Orders fetched successfully",
      data: result
    });
  }
);
var getMyOrders = catchAsync(
  async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error("User not found");
    }
    const result = await OrderService.getMyOrdersFromDB(userId);
    sendResponse(res, {
      statusCode: status10.OK,
      success: true,
      message: "Orders fetched successfully",
      data: result
    });
  }
);
var getOrderById = catchAsync(
  async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error("User not found");
    }
    const result = await OrderService.getOrderByIdFromDB(orderId, userId);
    sendResponse(res, {
      statusCode: status10.OK,
      success: true,
      message: "Order fetched successfully",
      data: result
    });
  }
);
var updateOrderStatus2 = () => catchAsync(
  async (req, res) => {
    const orderId = req.params.id;
    const orderStatus = req.body.status;
    const providerId = req.user?.userId;
    if (!providerId) {
      throw new Error("Provider not found");
    }
    const result = await OrderService.updateOrderStatusIntoDB(orderId, orderStatus, providerId);
    sendResponse(res, {
      statusCode: status10.OK,
      success: true,
      message: "Order status updated successfully",
      data: result
    });
  }
);
var trackOrderStatus = () => catchAsync(
  async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error("User not found");
    }
    const result = await OrderService.trackOrderStatusIntoDB(orderId, userId);
    sendResponse(res, {
      statusCode: status10.OK,
      success: true,
      message: "Order status tracked successfully",
      data: result
    });
  }
);
var cancelOrder = () => catchAsync(
  async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error("User not found");
    }
    const result = await OrderService.cancelOrderIntoDB(orderId, userId);
    sendResponse(res, {
      statusCode: status10.OK,
      success: true,
      message: "Order cancelled successfully",
      data: result
    });
  }
);
var OrderController = {
  createOrder,
  getAllOrders,
  getOrderById,
  getMyOrders,
  updateOrderStatus: updateOrderStatus2,
  trackOrderStatus,
  cancelOrder
};

// src/app/modules/order/order.route.ts
var router3 = Router3();
router3.post("/", OrderController.createOrder);
router3.get("/", OrderController.getAllOrders);
router3.get("/:id", OrderController.getOrderById);
router3.get("/my-orders", OrderController.getMyOrders);
router3.patch("/:id", OrderController.updateOrderStatus);
router3.patch("/track/:id", OrderController.trackOrderStatus);
router3.patch("/cancel/:id", OrderController.cancelOrder);
var OrderRoutes = router3;

// src/app/modules/provider/provider.route.ts
import { Router as Router4 } from "express";

// src/app/modules/provider/provider.service.ts
import status11 from "http-status";
var createProviderProfileIntoDB = async (payload) => {
  const { userId, shopName, description, address, phone, isOpen } = payload;
  const result = await prisma2.$transaction(async (tx) => {
    const isExistProvider = await tx.providerProfile.findUnique({
      where: {
        userId
      }
    });
    if (isExistProvider) {
      throw new AppError_default(status11.NOT_FOUND, "Provider already exists");
    }
    const user = await tx.user.findUnique({
      where: {
        id: userId
      }
    });
    const providerProfile = await tx.providerProfile.create({
      data: {
        userId,
        shopName,
        description,
        address,
        phone,
        isOpen
      },
      include: {
        user: true
      }
    });
    if (user && !isExistProvider) {
      await tx.user.update({
        where: {
          id: userId
        },
        data: {
          role: Role.PROVIDER
        }
      });
    }
    return providerProfile;
  });
  return result;
};
var getAllProvidersFromDB = async () => {
  const result = await prisma2.providerProfile.findMany({
    include: {
      user: true,
      meals: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  if (!result) {
    throw new AppError_default(status11.NOT_FOUND, "No providers found");
  }
  return result;
};
var getProviderWithIdFromDB = async (id) => {
  const provider = await prisma2.providerProfile.findUnique({
    where: {
      userId: id
    },
    include: {
      user: true,
      meals: true
    }
  });
  if (!provider) {
    throw new AppError_default(status11.NOT_FOUND, "Provider not found");
  }
  return provider;
};
var ProviderServices = {
  createProviderProfileIntoDB,
  getAllProvidersFromDB,
  getProviderWithIdFromDB
};

// src/app/modules/provider/provider.controller.ts
import status12 from "http-status";
var createProviderProfile = () => catchAsync(
  async (req, res) => {
    const userId = req.user?.userId;
    const payload = req.body;
    const result = await ProviderServices.createProviderProfileIntoDB({ ...payload, userId });
    sendResponse(res, {
      statusCode: status12.CREATED,
      success: true,
      message: "Provider profile created successfully",
      data: result
    });
  }
);
var getAllProviders = () => catchAsync(
  async (req, res) => {
    const result = await ProviderServices.getAllProvidersFromDB();
    sendResponse(res, {
      statusCode: status12.OK,
      success: true,
      message: "Providers fetched successfully",
      data: result
    });
  }
);
var getProviderWithId = () => catchAsync(
  async (req, res) => {
    const id = req.params.id;
    const result = await ProviderServices.getProviderWithIdFromDB(id);
    sendResponse(res, {
      statusCode: status12.OK,
      success: true,
      message: "Provider with menu fetched successfully",
      data: result
    });
  }
);
var ProviderController = {
  createProviderProfile,
  getAllProviders,
  getProviderWithId
};

// src/app/modules/provider/provider.validation.ts
import { z as z4 } from "zod";
var createProviderProfileZodSchema = z4.object({
  body: z4.object({
    shopName: z4.string().min(1, { message: "Shop name is required" }),
    description: z4.string().optional(),
    address: z4.string().min(1, { message: "Address is required" }),
    phone: z4.string().min(1, { message: "Phone number is required" }),
    isOpen: z4.boolean().optional().default(true)
  })
});
var updateProviderProfileZodSchema = z4.object({
  body: z4.object({
    shopName: z4.string().optional(),
    description: z4.string().optional(),
    address: z4.string().optional(),
    phone: z4.string().optional(),
    isOpen: z4.boolean().optional()
  })
});
var ProviderValidation = {
  createProviderProfileZodSchema,
  updateProviderProfileZodSchema
};

// src/app/modules/provider/provider.route.ts
var router4 = Router4();
router4.get(
  "/",
  ProviderController.getAllProviders
);
router4.get(
  "/:id",
  ProviderController.getProviderWithId
);
router4.post(
  "/create-profile",
  auth2(Role.PROVIDER),
  validateRequest_default(ProviderValidation.createProviderProfileZodSchema),
  ProviderController.createProviderProfile
);
var ProviderRoutes = router4;

// src/app/modules/user/user.route.ts
import express from "express";

// src/app/modules/user/user.service.ts
import status13 from "http-status";
var getCurrentUserFromDB = async (req) => {
  return req.user;
};
var getAllUsersFromDB = async () => {
  const result = await prisma2.user.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
  return result;
};
var updateUserStatusIntoDB = async (id, newStatus) => {
  const isExistUser = await prisma2.user.findUnique({
    where: {
      id
    }
  });
  if (!isExistUser) {
    throw new AppError_default(status13.NOT_FOUND, "User not found");
  }
  if (isExistUser.status === UserStatus.BLOCKED) {
    throw new AppError_default(status13.BAD_REQUEST, "User is blocked");
  }
  if (isExistUser.status === UserStatus.DELETED) {
    throw new AppError_default(status13.BAD_REQUEST, "User is deleted");
  }
  const result = await prisma2.user.update({
    where: {
      id
    },
    data: {
      status: newStatus
    }
  });
  return result;
};
var updateProfileIntoDB = async (req, id, payload) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError_default(status13.UNAUTHORIZED, "Unauthorized");
  }
  const isExistUser = await prisma2.user.findUnique({
    where: {
      id
    }
  });
  if (!isExistUser) {
    throw new AppError_default(status13.NOT_FOUND, "User not found");
  }
  const result = await prisma2.user.update({
    where: {
      id
    },
    data: {
      ...payload
    }
  });
  return result;
};
var UserServices = {
  getCurrentUserFromDB,
  getAllUsersFromDB,
  updateUserStatusIntoDB,
  updateProfileIntoDB
};

// src/app/modules/user/user.controller.ts
import status14 from "http-status";
var getCurrentUser = catchAsync(
  async (req, res) => {
    const result = await UserServices.getCurrentUserFromDB(req);
    sendResponse(res, {
      statusCode: status14.OK,
      success: true,
      message: "User fetched successfully",
      data: result
    });
  }
);
var updateProfile = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await UserServices.updateProfileIntoDB(req, id, payload);
    sendResponse(res, {
      statusCode: status14.OK,
      success: true,
      message: "Profile updated successfully",
      data: result
    });
  }
);
var getAllUsers = catchAsync(
  async (req, res) => {
    const result = await UserServices.getAllUsersFromDB();
    sendResponse(res, {
      statusCode: status14.OK,
      success: true,
      message: "Users fetched successfully",
      data: result
    });
  }
);
var updateUserStatus = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const { status: newStatus } = req.body;
    const result = await UserServices.updateUserStatusIntoDB(id, newStatus);
    sendResponse(res, {
      statusCode: status14.OK,
      success: true,
      message: "User status updated successfully",
      data: result
    });
  }
);
var UserController = {
  getCurrentUser,
  updateProfile,
  getAllUsers,
  updateUserStatus
};

// src/app/modules/user/user.route.ts
var router5 = express.Router();
router5.get(
  "/me",
  auth2(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  UserController.getCurrentUser
);
router5.get(
  "/",
  auth2(Role.ADMIN),
  UserController.getAllUsers
);
router5.patch(
  "/:id",
  auth2(Role.ADMIN),
  UserController.updateUserStatus
);
router5.patch(
  "/profile/update",
  auth2(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  UserController.updateProfile
);
var UserRoutes = router5;

// src/app/modules/review/review.route.ts
import { Router as Router5 } from "express";

// src/app/modules/review/review.controller.ts
import status16 from "http-status";

// src/app/modules/review/review.service.ts
import status15 from "http-status";
var createReviewIntoDB = async (payload) => {
  const { userId, mealId, rating, comment } = payload;
  if (rating < 1 || rating > 5) {
    throw new AppError_default(status15.BAD_REQUEST, "Rating must be between 1 and 5");
  }
  const meal = await prisma2.meal.findUnique({
    where: {
      id: mealId
    }
  });
  if (!meal) {
    throw new AppError_default(status15.NOT_FOUND, "Meal not found");
  }
  const existingReview = await prisma2.review.findFirst({
    where: {
      userId,
      mealId
    }
  });
  if (existingReview) {
    throw new AppError_default(status15.BAD_REQUEST, "You have already reviewed this meal");
  }
  const hasOrder = await prisma2.order.findFirst({
    where: {
      userId,
      status: OrderStatus.DELIVERED,
      items: {
        some: {
          mealId
        }
      }
    }
  });
  if (!hasOrder) {
    throw new AppError_default(status15.BAD_REQUEST, "You have not ordered this meal");
  }
  const review = await prisma2.review.create({
    data: {
      userId,
      mealId,
      rating,
      comment
    },
    include: {
      user: true,
      meal: true
    }
  });
  return review;
};
var getMealReviewsFromDB = async (mealId) => {
  const result = await prisma2.review.findMany({
    where: {
      mealId
    },
    include: {
      user: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  const averageRating = result.length > 0 ? result.reduce((acc, review) => acc + review.rating, 0) / result.length : 0;
  return { averageRating, result, totalReviews: result.length };
};
var getUserReviewsFromDB = async (userId) => {
  const result = await prisma2.review.findMany({
    where: {
      userId
    },
    include: {
      meal: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return result;
};
var getProviderReviewsFromDB = async (providerId) => {
  const providerMeals = await prisma2.meal.findMany({
    where: {
      providerId
    },
    select: {
      id: true
    }
  });
  const mealIds = providerMeals.map((meal) => meal.id);
  const reviews = await prisma2.review.findMany({
    where: {
      mealId: {
        in: mealIds
      }
    },
    include: {
      user: true,
      meal: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews : 0;
  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length
  };
  return { reviews, totalReviews, averageRating, ratingDistribution };
};
var updateReviewIntoDB = async (reviewId, userId, payload) => {
  const isExistReview = await prisma2.review.findUnique({
    where: {
      id: reviewId
    }
  });
  if (!isExistReview) {
    throw new AppError_default(status15.NOT_FOUND, "Review not found");
  }
  if (isExistReview.userId !== userId) {
    throw new AppError_default(status15.FORBIDDEN, "You are not authorized to update this review");
  }
  if (payload.rating && (payload.rating < 1 || payload.rating > 5)) {
    throw new AppError_default(status15.BAD_REQUEST, "Rating must be between 1 and 5");
  }
  const result = await prisma2.review.update({
    where: {
      id: reviewId
    },
    data: payload,
    include: {
      user: true,
      meal: true
    }
  });
  return result;
};
var deleteReviewFromDB = async (reviewId, userId) => {
  const isExistReview = await prisma2.review.findUnique({
    where: {
      id: reviewId
    }
  });
  if (!isExistReview) {
    throw new AppError_default(status15.NOT_FOUND, "Review not found");
  }
  if (isExistReview.userId !== userId) {
    throw new AppError_default(status15.FORBIDDEN, "You are not authorized to delete this review");
  }
  await prisma2.review.delete({
    where: {
      id: reviewId
    }
  });
  return { message: "Review deleted successfully" };
};
var ReviewService = {
  createReviewIntoDB,
  getMealReviewsFromDB,
  getUserReviewsFromDB,
  getProviderReviewsFromDB,
  updateReviewIntoDB,
  deleteReviewFromDB
};

// src/app/modules/review/review.controller.ts
var createReview = async () => catchAsync(
  async (req, res) => {
    const userId = req.user?.userId;
    const payload = req.body;
    if (!userId) {
      return sendResponse(res, {
        statusCode: status16.UNAUTHORIZED,
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    const result = await ReviewService.createReviewIntoDB({ ...payload, userId });
    sendResponse(res, {
      statusCode: status16.CREATED,
      success: true,
      message: "Review created successfully",
      data: result
    });
  }
);
var getMealReviews = async () => catchAsync(
  async (req, res) => {
    const mealId = req.params.mealId;
    const result = await ReviewService.getMealReviewsFromDB(mealId);
    sendResponse(res, {
      statusCode: status16.OK,
      success: true,
      message: "Meal reviews fetched successfully",
      data: result
    });
  }
);
var getUserReviews = async () => catchAsync(
  async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
      return sendResponse(res, {
        statusCode: status16.UNAUTHORIZED,
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    const result = await ReviewService.getUserReviewsFromDB(userId);
    sendResponse(res, {
      statusCode: status16.OK,
      success: true,
      message: "User reviews fetched successfully",
      data: result
    });
  }
);
var getProviderReviews = async () => catchAsync(
  async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
      return sendResponse(res, {
        statusCode: status16.BAD_REQUEST,
        success: false,
        message: "Provider ID is required",
        data: null
      });
    }
    const provider = await prisma2.providerProfile.findUnique({
      where: {
        userId
      }
    });
    if (!provider) {
      return sendResponse(res, {
        statusCode: status16.NOT_FOUND,
        success: false,
        message: "Provider not found",
        data: null
      });
    }
    const result = await ReviewService.getProviderReviewsFromDB(provider.id);
    sendResponse(res, {
      statusCode: status16.OK,
      success: true,
      message: "Provider reviews fetched successfully",
      data: result
    });
  }
);
var updateReview = async () => catchAsync(
  async (req, res) => {
    const reviewId = req.params.reviewId;
    const userId = req.user?.userId;
    const payload = req.body;
    if (!userId) {
      return sendResponse(res, {
        statusCode: status16.UNAUTHORIZED,
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    const result = await ReviewService.updateReviewIntoDB(reviewId, userId, payload);
    sendResponse(res, {
      statusCode: status16.OK,
      success: true,
      message: "Review updated successfully",
      data: result
    });
  }
);
var deleteReview = async () => catchAsync(
  async (req, res) => {
    const reviewId = req.params.reviewId;
    const userId = req.user?.userId;
    if (!userId) {
      return sendResponse(res, {
        statusCode: status16.UNAUTHORIZED,
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    const result = await ReviewService.deleteReviewFromDB(reviewId, userId);
    sendResponse(res, {
      statusCode: status16.OK,
      success: true,
      message: "Review deleted successfully",
      data: result
    });
  }
);
var ReviewController = {
  createReview,
  getMealReviews,
  getUserReviews,
  getProviderReviews,
  updateReview,
  deleteReview
};

// src/app/modules/review/review.route.ts
var router6 = Router5();
router6.post(
  "/",
  auth2(Role.CUSTOMER),
  ReviewController.createReview
);
router6.get(
  "/:mealId",
  ReviewController.getMealReviews
);
router6.get(
  "/user",
  auth2(Role.CUSTOMER),
  ReviewController.getUserReviews
);
router6.get(
  "/provider",
  auth2(Role.PROVIDER),
  ReviewController.getProviderReviews
);
router6.patch(
  "/:reviewId",
  auth2(Role.CUSTOMER),
  ReviewController.updateReview
);
router6.delete(
  "/:reviewId",
  auth2(Role.CUSTOMER),
  ReviewController.deleteReview
);
var ReviewRoutes = router6;

// src/app/modules/ai/ai.route.ts
import express2 from "express";

// node_modules/http-status-codes/build/es/legacy.js
var ACCEPTED = 202;
var BAD_GATEWAY = 502;
var BAD_REQUEST = 400;
var CONFLICT = 409;
var CONTINUE = 100;
var CREATED = 201;
var EXPECTATION_FAILED = 417;
var FORBIDDEN = 403;
var GATEWAY_TIMEOUT = 504;
var GONE = 410;
var HTTP_VERSION_NOT_SUPPORTED = 505;
var IM_A_TEAPOT = 418;
var INSUFFICIENT_SPACE_ON_RESOURCE = 419;
var INSUFFICIENT_STORAGE = 507;
var INTERNAL_SERVER_ERROR = 500;
var LENGTH_REQUIRED = 411;
var LOCKED = 423;
var METHOD_FAILURE = 420;
var METHOD_NOT_ALLOWED = 405;
var MOVED_PERMANENTLY = 301;
var MOVED_TEMPORARILY = 302;
var MULTI_STATUS = 207;
var MULTIPLE_CHOICES = 300;
var NETWORK_AUTHENTICATION_REQUIRED = 511;
var NO_CONTENT = 204;
var NON_AUTHORITATIVE_INFORMATION = 203;
var NOT_ACCEPTABLE = 406;
var NOT_FOUND = 404;
var NOT_IMPLEMENTED = 501;
var NOT_MODIFIED = 304;
var OK = 200;
var PARTIAL_CONTENT = 206;
var PAYMENT_REQUIRED = 402;
var PERMANENT_REDIRECT = 308;
var PRECONDITION_FAILED = 412;
var PRECONDITION_REQUIRED = 428;
var PROCESSING = 102;
var PROXY_AUTHENTICATION_REQUIRED = 407;
var REQUEST_HEADER_FIELDS_TOO_LARGE = 431;
var REQUEST_TIMEOUT = 408;
var REQUEST_TOO_LONG = 413;
var REQUEST_URI_TOO_LONG = 414;
var REQUESTED_RANGE_NOT_SATISFIABLE = 416;
var RESET_CONTENT = 205;
var SEE_OTHER = 303;
var SERVICE_UNAVAILABLE = 503;
var SWITCHING_PROTOCOLS = 101;
var TEMPORARY_REDIRECT = 307;
var TOO_MANY_REQUESTS = 429;
var UNAUTHORIZED = 401;
var UNPROCESSABLE_ENTITY = 422;
var UNSUPPORTED_MEDIA_TYPE = 415;
var USE_PROXY = 305;
var legacy_default = {
  ACCEPTED,
  BAD_GATEWAY,
  BAD_REQUEST,
  CONFLICT,
  CONTINUE,
  CREATED,
  EXPECTATION_FAILED,
  FORBIDDEN,
  GATEWAY_TIMEOUT,
  GONE,
  HTTP_VERSION_NOT_SUPPORTED,
  IM_A_TEAPOT,
  INSUFFICIENT_SPACE_ON_RESOURCE,
  INSUFFICIENT_STORAGE,
  INTERNAL_SERVER_ERROR,
  LENGTH_REQUIRED,
  LOCKED,
  METHOD_FAILURE,
  METHOD_NOT_ALLOWED,
  MOVED_PERMANENTLY,
  MOVED_TEMPORARILY,
  MULTI_STATUS,
  MULTIPLE_CHOICES,
  NETWORK_AUTHENTICATION_REQUIRED,
  NO_CONTENT,
  NON_AUTHORITATIVE_INFORMATION,
  NOT_ACCEPTABLE,
  NOT_FOUND,
  NOT_IMPLEMENTED,
  NOT_MODIFIED,
  OK,
  PARTIAL_CONTENT,
  PAYMENT_REQUIRED,
  PERMANENT_REDIRECT,
  PRECONDITION_FAILED,
  PRECONDITION_REQUIRED,
  PROCESSING,
  PROXY_AUTHENTICATION_REQUIRED,
  REQUEST_HEADER_FIELDS_TOO_LARGE,
  REQUEST_TIMEOUT,
  REQUEST_TOO_LONG,
  REQUEST_URI_TOO_LONG,
  REQUESTED_RANGE_NOT_SATISFIABLE,
  RESET_CONTENT,
  SEE_OTHER,
  SERVICE_UNAVAILABLE,
  SWITCHING_PROTOCOLS,
  TEMPORARY_REDIRECT,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
  UNPROCESSABLE_ENTITY,
  UNSUPPORTED_MEDIA_TYPE,
  USE_PROXY
};

// node_modules/http-status-codes/build/es/utils.js
var statusCodeToReasonPhrase = {
  "202": "Accepted",
  "502": "Bad Gateway",
  "400": "Bad Request",
  "409": "Conflict",
  "100": "Continue",
  "201": "Created",
  "417": "Expectation Failed",
  "424": "Failed Dependency",
  "403": "Forbidden",
  "504": "Gateway Timeout",
  "410": "Gone",
  "505": "HTTP Version Not Supported",
  "418": "I'm a teapot",
  "419": "Insufficient Space on Resource",
  "507": "Insufficient Storage",
  "500": "Internal Server Error",
  "411": "Length Required",
  "423": "Locked",
  "420": "Method Failure",
  "405": "Method Not Allowed",
  "301": "Moved Permanently",
  "302": "Moved Temporarily",
  "207": "Multi-Status",
  "300": "Multiple Choices",
  "511": "Network Authentication Required",
  "204": "No Content",
  "203": "Non Authoritative Information",
  "406": "Not Acceptable",
  "404": "Not Found",
  "501": "Not Implemented",
  "304": "Not Modified",
  "200": "OK",
  "206": "Partial Content",
  "402": "Payment Required",
  "308": "Permanent Redirect",
  "412": "Precondition Failed",
  "428": "Precondition Required",
  "102": "Processing",
  "103": "Early Hints",
  "426": "Upgrade Required",
  "407": "Proxy Authentication Required",
  "431": "Request Header Fields Too Large",
  "408": "Request Timeout",
  "413": "Request Entity Too Large",
  "414": "Request-URI Too Long",
  "416": "Requested Range Not Satisfiable",
  "205": "Reset Content",
  "303": "See Other",
  "503": "Service Unavailable",
  "101": "Switching Protocols",
  "307": "Temporary Redirect",
  "429": "Too Many Requests",
  "401": "Unauthorized",
  "451": "Unavailable For Legal Reasons",
  "422": "Unprocessable Entity",
  "415": "Unsupported Media Type",
  "305": "Use Proxy",
  "421": "Misdirected Request"
};
var reasonPhraseToStatusCode = {
  "Accepted": 202,
  "Bad Gateway": 502,
  "Bad Request": 400,
  "Conflict": 409,
  "Continue": 100,
  "Created": 201,
  "Expectation Failed": 417,
  "Failed Dependency": 424,
  "Forbidden": 403,
  "Gateway Timeout": 504,
  "Gone": 410,
  "HTTP Version Not Supported": 505,
  "I'm a teapot": 418,
  "Insufficient Space on Resource": 419,
  "Insufficient Storage": 507,
  "Internal Server Error": 500,
  "Length Required": 411,
  "Locked": 423,
  "Method Failure": 420,
  "Method Not Allowed": 405,
  "Moved Permanently": 301,
  "Moved Temporarily": 302,
  "Multi-Status": 207,
  "Multiple Choices": 300,
  "Network Authentication Required": 511,
  "No Content": 204,
  "Non Authoritative Information": 203,
  "Not Acceptable": 406,
  "Not Found": 404,
  "Not Implemented": 501,
  "Not Modified": 304,
  "OK": 200,
  "Partial Content": 206,
  "Payment Required": 402,
  "Permanent Redirect": 308,
  "Precondition Failed": 412,
  "Precondition Required": 428,
  "Processing": 102,
  "Early Hints": 103,
  "Upgrade Required": 426,
  "Proxy Authentication Required": 407,
  "Request Header Fields Too Large": 431,
  "Request Timeout": 408,
  "Request Entity Too Large": 413,
  "Request-URI Too Long": 414,
  "Requested Range Not Satisfiable": 416,
  "Reset Content": 205,
  "See Other": 303,
  "Service Unavailable": 503,
  "Switching Protocols": 101,
  "Temporary Redirect": 307,
  "Too Many Requests": 429,
  "Unauthorized": 401,
  "Unavailable For Legal Reasons": 451,
  "Unprocessable Entity": 422,
  "Unsupported Media Type": 415,
  "Use Proxy": 305,
  "Misdirected Request": 421
};

// node_modules/http-status-codes/build/es/utils-functions.js
function getReasonPhrase(statusCode) {
  var result = statusCodeToReasonPhrase[statusCode.toString()];
  if (!result) {
    throw new Error("Status code does not exist: " + statusCode);
  }
  return result;
}
function getStatusCode(reasonPhrase) {
  var result = reasonPhraseToStatusCode[reasonPhrase];
  if (!result) {
    throw new Error("Reason phrase does not exist: " + reasonPhrase);
  }
  return result;
}
var getStatusText = getReasonPhrase;

// node_modules/http-status-codes/build/es/status-codes.js
var StatusCodes;
(function(StatusCodes2) {
  StatusCodes2[StatusCodes2["CONTINUE"] = 100] = "CONTINUE";
  StatusCodes2[StatusCodes2["SWITCHING_PROTOCOLS"] = 101] = "SWITCHING_PROTOCOLS";
  StatusCodes2[StatusCodes2["PROCESSING"] = 102] = "PROCESSING";
  StatusCodes2[StatusCodes2["EARLY_HINTS"] = 103] = "EARLY_HINTS";
  StatusCodes2[StatusCodes2["OK"] = 200] = "OK";
  StatusCodes2[StatusCodes2["CREATED"] = 201] = "CREATED";
  StatusCodes2[StatusCodes2["ACCEPTED"] = 202] = "ACCEPTED";
  StatusCodes2[StatusCodes2["NON_AUTHORITATIVE_INFORMATION"] = 203] = "NON_AUTHORITATIVE_INFORMATION";
  StatusCodes2[StatusCodes2["NO_CONTENT"] = 204] = "NO_CONTENT";
  StatusCodes2[StatusCodes2["RESET_CONTENT"] = 205] = "RESET_CONTENT";
  StatusCodes2[StatusCodes2["PARTIAL_CONTENT"] = 206] = "PARTIAL_CONTENT";
  StatusCodes2[StatusCodes2["MULTI_STATUS"] = 207] = "MULTI_STATUS";
  StatusCodes2[StatusCodes2["MULTIPLE_CHOICES"] = 300] = "MULTIPLE_CHOICES";
  StatusCodes2[StatusCodes2["MOVED_PERMANENTLY"] = 301] = "MOVED_PERMANENTLY";
  StatusCodes2[StatusCodes2["MOVED_TEMPORARILY"] = 302] = "MOVED_TEMPORARILY";
  StatusCodes2[StatusCodes2["SEE_OTHER"] = 303] = "SEE_OTHER";
  StatusCodes2[StatusCodes2["NOT_MODIFIED"] = 304] = "NOT_MODIFIED";
  StatusCodes2[StatusCodes2["USE_PROXY"] = 305] = "USE_PROXY";
  StatusCodes2[StatusCodes2["TEMPORARY_REDIRECT"] = 307] = "TEMPORARY_REDIRECT";
  StatusCodes2[StatusCodes2["PERMANENT_REDIRECT"] = 308] = "PERMANENT_REDIRECT";
  StatusCodes2[StatusCodes2["BAD_REQUEST"] = 400] = "BAD_REQUEST";
  StatusCodes2[StatusCodes2["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
  StatusCodes2[StatusCodes2["PAYMENT_REQUIRED"] = 402] = "PAYMENT_REQUIRED";
  StatusCodes2[StatusCodes2["FORBIDDEN"] = 403] = "FORBIDDEN";
  StatusCodes2[StatusCodes2["NOT_FOUND"] = 404] = "NOT_FOUND";
  StatusCodes2[StatusCodes2["METHOD_NOT_ALLOWED"] = 405] = "METHOD_NOT_ALLOWED";
  StatusCodes2[StatusCodes2["NOT_ACCEPTABLE"] = 406] = "NOT_ACCEPTABLE";
  StatusCodes2[StatusCodes2["PROXY_AUTHENTICATION_REQUIRED"] = 407] = "PROXY_AUTHENTICATION_REQUIRED";
  StatusCodes2[StatusCodes2["REQUEST_TIMEOUT"] = 408] = "REQUEST_TIMEOUT";
  StatusCodes2[StatusCodes2["CONFLICT"] = 409] = "CONFLICT";
  StatusCodes2[StatusCodes2["GONE"] = 410] = "GONE";
  StatusCodes2[StatusCodes2["LENGTH_REQUIRED"] = 411] = "LENGTH_REQUIRED";
  StatusCodes2[StatusCodes2["PRECONDITION_FAILED"] = 412] = "PRECONDITION_FAILED";
  StatusCodes2[StatusCodes2["REQUEST_TOO_LONG"] = 413] = "REQUEST_TOO_LONG";
  StatusCodes2[StatusCodes2["REQUEST_URI_TOO_LONG"] = 414] = "REQUEST_URI_TOO_LONG";
  StatusCodes2[StatusCodes2["UNSUPPORTED_MEDIA_TYPE"] = 415] = "UNSUPPORTED_MEDIA_TYPE";
  StatusCodes2[StatusCodes2["REQUESTED_RANGE_NOT_SATISFIABLE"] = 416] = "REQUESTED_RANGE_NOT_SATISFIABLE";
  StatusCodes2[StatusCodes2["EXPECTATION_FAILED"] = 417] = "EXPECTATION_FAILED";
  StatusCodes2[StatusCodes2["IM_A_TEAPOT"] = 418] = "IM_A_TEAPOT";
  StatusCodes2[StatusCodes2["INSUFFICIENT_SPACE_ON_RESOURCE"] = 419] = "INSUFFICIENT_SPACE_ON_RESOURCE";
  StatusCodes2[StatusCodes2["METHOD_FAILURE"] = 420] = "METHOD_FAILURE";
  StatusCodes2[StatusCodes2["MISDIRECTED_REQUEST"] = 421] = "MISDIRECTED_REQUEST";
  StatusCodes2[StatusCodes2["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
  StatusCodes2[StatusCodes2["LOCKED"] = 423] = "LOCKED";
  StatusCodes2[StatusCodes2["FAILED_DEPENDENCY"] = 424] = "FAILED_DEPENDENCY";
  StatusCodes2[StatusCodes2["UPGRADE_REQUIRED"] = 426] = "UPGRADE_REQUIRED";
  StatusCodes2[StatusCodes2["PRECONDITION_REQUIRED"] = 428] = "PRECONDITION_REQUIRED";
  StatusCodes2[StatusCodes2["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
  StatusCodes2[StatusCodes2["REQUEST_HEADER_FIELDS_TOO_LARGE"] = 431] = "REQUEST_HEADER_FIELDS_TOO_LARGE";
  StatusCodes2[StatusCodes2["UNAVAILABLE_FOR_LEGAL_REASONS"] = 451] = "UNAVAILABLE_FOR_LEGAL_REASONS";
  StatusCodes2[StatusCodes2["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
  StatusCodes2[StatusCodes2["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
  StatusCodes2[StatusCodes2["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
  StatusCodes2[StatusCodes2["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
  StatusCodes2[StatusCodes2["GATEWAY_TIMEOUT"] = 504] = "GATEWAY_TIMEOUT";
  StatusCodes2[StatusCodes2["HTTP_VERSION_NOT_SUPPORTED"] = 505] = "HTTP_VERSION_NOT_SUPPORTED";
  StatusCodes2[StatusCodes2["INSUFFICIENT_STORAGE"] = 507] = "INSUFFICIENT_STORAGE";
  StatusCodes2[StatusCodes2["NETWORK_AUTHENTICATION_REQUIRED"] = 511] = "NETWORK_AUTHENTICATION_REQUIRED";
})(StatusCodes || (StatusCodes = {}));

// node_modules/http-status-codes/build/es/index.js
var __assign = function() {
  __assign = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
        t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
var es_default = __assign(__assign({}, legacy_default), {
  getStatusCode,
  getStatusText
});

// src/app/modules/ai/ai.service.ts
import slugify2 from "slugify";

// src/app/errorHelpers/ApiError.ts
var ApiError2 = class extends Error {
  statusCode;
  errors;
  constructor(statusCode, message, errors, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors ? errors : message;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var ApiError_default = ApiError2;

// src/app/modules/ai/ai.service.ts
var chatAI = async (prompt, context) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = "https://openrouter.ai/api/v1/chat/completions";
  if (!apiKey || typeof apiKey !== "string") {
    throw new ApiError_default(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "AI API key is not configured properly"
    );
  }
  const meals = await prisma2.meal.findMany({
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    select: {
      name: true,
      description: true,
      price: true,
      image: true,
      isAvailable: true,
      calories: true,
      ingredients: true,
      cuisine: true,
      dietary: true,
      mealType: true,
      spiceLevel: true,
      category: {
        select: {
          name: true,
          slug: true
        }
      },
      provider: {
        select: {
          shopName: true,
          address: true,
          isOpen: true
        }
      }
    }
  });
  const mealCatalog = meals.map((meal) => {
    const ingredients = meal.ingredients.length ? meal.ingredients.join(", ") : "N/A";
    const dietary = meal.dietary.length ? meal.dietary.join(", ") : "N/A";
    return [
      `Name: ${meal.name}`,
      `Category: ${meal.category?.name ?? "N/A"} (${meal.category?.slug ?? "N/A"})`,
      `Provider: ${meal.provider?.shopName ?? "N/A"}`,
      `Price: ${meal.price}`,
      `Calories: ${meal.calories}`,
      `Cuisine: ${meal.cuisine ?? "N/A"}`,
      `Meal Type: ${meal.mealType ?? "N/A"}`,
      `Spice Level: ${meal.spiceLevel ?? "N/A"}`,
      `Dietary: ${dietary}`,
      `Ingredients: ${ingredients}`,
      `Available: ${meal.isAvailable ? "Yes" : "No"}`,
      `Description: ${meal.description ?? "N/A"}`,
      `Provider Open: ${meal.provider?.isOpen ? "Yes" : "No"}`
    ].join(" | ");
  }).join("\n");
  const systemPrompt = [
    `You are a helpful FoodHub assistant for a food delivery platform.`,
    `Use the provided meal catalog as the source of truth for all meal-related questions.`,
    `If the user asks about a meal, answer using the catalog data and do not invent meals, prices, ingredients, or availability.`,
    `If a meal is not in the catalog, say you could not find it and suggest similar available meals if possible.`,
    `Keep answers concise, friendly, and practical.`,
    context ? `Additional instructions: ${context}` : null,
    `Meal catalog:
${mealCatalog || "No meals are available right now."}`
  ].filter(Boolean).join("\n\n");
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.FRONTEND_URL,
      "X-Title": "FoodHub"
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiError_default(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `AI API error: ${errorData.error.message || "Unknown error"}`
    );
  }
  const data = await response.json();
  return data.choices[0].message.content.trim();
};
var buildFallbackThumbnail = (topic) => {
  const normalizedTopic = topic.trim() || "food";
  const encodedTopic = encodeURIComponent(normalizedTopic);
  return `https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80&query=${encodedTopic}`;
};
var cleanSearchText = (value) => value.toLowerCase().replace(/[^a-z\s]/g, " ").replace(
  /\b(top|best|items|item|foods|food|blog|post|in|for|with|the|a|an|of|and)\b/g,
  " "
).replace(/\s+/g, " ").trim();
var fetchUnsplashThumbnail = async (topic, title) => {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return null;
  }
  const rawTitle = (title || "").trim();
  const rawTopic = topic.trim();
  const cleanedTitle = cleanSearchText(rawTitle);
  const cleanedTopic = cleanSearchText(rawTopic);
  const queryCandidates = [
    rawTitle,
    rawTopic,
    cleanedTitle ? `${cleanedTitle} bangladesh food` : "",
    cleanedTopic ? `${cleanedTopic} bangladesh food` : "",
    "healthy bangladeshi food",
    "bangladesh traditional food"
  ].filter(Boolean);
  for (const queryText of queryCandidates) {
    const searchQuery = encodeURIComponent(queryText);
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=5&orientation=landscape&content_filter=high`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          "Accept-Version": "v1"
        }
      }
    );
    if (!response.ok) {
      continue;
    }
    const data = await response.json();
    const photo = data?.results?.[0];
    const imageUrl = photo?.urls?.regular ?? photo?.urls?.full ?? photo?.urls?.small ?? null;
    if (imageUrl) {
      return imageUrl;
    }
  }
  return null;
};
var parseBlogPostContent = (rawContent, fallbackTopic) => {
  const lines = rawContent.split(/\r?\n/).map((line) => line.trim());
  const titleLine = lines.find((line) => /^#\s+/.test(line));
  const title = titleLine?.replace(/^#\s+/, "").trim() || fallbackTopic;
  const thumbnailLine = lines.find((line) => /^thumbnail\s*:/i.test(line));
  const thumbnailMatch = thumbnailLine?.match(/https?:\/\/\S+/i);
  const markdownImageMatch = rawContent.match(
    /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/i
  );
  const thumbnail = thumbnailMatch?.[0] ?? markdownImageMatch?.[1] ?? null;
  const descriptionLine = lines.find((line) => /^\*.*\*$/.test(line));
  const description = descriptionLine ? descriptionLine.replace(/^\*+|\*+$/g, "").trim() : null;
  const content = lines.filter((line) => {
    if (!line) return false;
    if (line === titleLine) return false;
    if (line === thumbnailLine) return false;
    if (line === descriptionLine) return false;
    return true;
  }).join("\n").trim();
  return {
    title,
    description,
    thumbnail,
    content: content || rawContent.trim()
  };
};
var generateUniqueBlogSlug = async (title) => {
  const baseSlug = slugify2(title, {
    replacement: "-",
    lower: true,
    trim: true,
    remove: /[*+~.()'"!:@]/g,
    strict: true
  });
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma2.blogs.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  return slug;
};
var blogPostGenerator = async (topic, userId) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = "https://openrouter.ai/api/v1/chat/completions";
  if (!apiKey || typeof apiKey !== "string") {
    throw new ApiError_default(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "AI API key is not configured properly"
    );
  }
  if (!topic || typeof topic !== "string") {
    throw new ApiError_default(StatusCodes.BAD_REQUEST, "Invalid blog topic provided");
  }
  if (!userId || typeof userId !== "string") {
    throw new ApiError_default(StatusCodes.UNAUTHORIZED, "Unauthorized user");
  }
  const systemPrompt = `You are a creative food blogger for FoodHub. Write a blog post on the topic "${topic}" that is engaging, informative, and relevant to food lovers.

Return the response in this exact markdown structure:
# Title
*Short description*
Thumbnail: https://images.unsplash.com/... or a relevant food image URL

Blog content with clear headings and paragraphs.

Rules:
- The title must be catchy and include the topic.
- The description should be a concise summary of the blog post.
- The thumbnail must always be included and must be a valid image URL.

Then provide the blog content with clear headings and paragraphs. The content must be at least 300 words long and include useful information, tips, or insights related to the topic.`;
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.FRONTEND_URL,
      "X-Title": "FoodHub Blog Post Generator"
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7
    })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiError_default(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `AI API error: ${errorData.error.message || "Unknown error"}`
    );
  }
  const data = await response.json();
  const generatedContent = data.choices[0].message.content.trim();
  const parsedBlog = parseBlogPostContent(generatedContent, topic);
  const slug = await generateUniqueBlogSlug(parsedBlog.title);
  const unsplashThumbnail = await fetchUnsplashThumbnail(
    topic,
    parsedBlog.title
  );
  const thumbnail = unsplashThumbnail ?? parsedBlog.thumbnail ?? buildFallbackThumbnail(parsedBlog.title || topic);
  const savedBlog = await prisma2.blogs.create({
    data: {
      title: parsedBlog.title,
      slug,
      content: parsedBlog.content,
      thumbnail,
      userId
    }
  });
  return {
    blog: savedBlog,
    generatedContent,
    description: parsedBlog.description
  };
};
var generateMealDescription = async (title, category) => {
  if (!title || typeof title !== "string") {
    throw new ApiError_default(StatusCodes.BAD_REQUEST, "Invalid meal title provided");
  }
  if (!category || typeof category !== "string") {
    throw new ApiError_default(
      StatusCodes.BAD_REQUEST,
      "Invalid meal category provided"
    );
  }
  const prompt = `Write a short appetizing description for a FoodHub meal named "${title}" in the "${category}" category.

Rules:
- Keep it under 300 characters.
- Make it sound premium, fresh, and persuasive.
- Use FoodHub's actual menu style and avoid generic filler.
- Do not mention that you are an AI.`;
  const context = "You are a senior food copywriter for FoodHub. You write concise, mouth-watering meal descriptions that match the restaurant menu style and help users decide quickly.";
  const generatedDescription = await chatAI(prompt, context);
  return generatedDescription;
};
var aiHealthTipSuggestion = async () => {
  const userPreferences = "User prefers low-carb, high-protein meals and is allergic to nuts.";
  const prompt = `Based on the following user preferences and dietary restrictions: ${userPreferences}, suggest a healthy meal option from the FoodHub menu. Provide a brief description of why this meal would be a good choice for the user.short in 100 characters.`;
  const context = "You are a nutritionist assistant for FoodHub, helping users find meals that fit their health goals and dietary needs.";
  return await chatAI(prompt, context);
};
var aiService = {
  chatAI,
  blogPostGenerator,
  generateMealDescription,
  aiHealthTipSuggestion
};

// src/app/modules/ai/ai.controller.ts
var chatAI2 = catchAsync(async (req, res) => {
  const { message } = req.body;
  const result = await aiService.chatAI(message);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "AI response generated successfully",
    data: result
  });
});
var blogPostGenerator2 = catchAsync(async (req, res) => {
  const { topic } = req.body;
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError_default(StatusCodes.UNAUTHORIZED, "Unauthorized user");
  }
  const result = await aiService.blogPostGenerator(topic, userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blog post generated and saved successfully",
    data: result
  });
});
var generateMealDescription2 = catchAsync(
  async (req, res) => {
    const { title, category } = req.body;
    const result = await aiService.generateMealDescription(title, category);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Meal description generated and saved successfully",
      data: result
    });
  }
);
var aiHealthTipSuggestion2 = catchAsync(
  async (req, res) => {
    const result = await aiService.aiHealthTipSuggestion();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Health tip suggestion generated successfully",
      data: result
    });
  }
);
var aiController = {
  chatAI: chatAI2,
  blogPostGenerator: blogPostGenerator2,
  generateMealDescription: generateMealDescription2,
  aiHealthTipSuggestion: aiHealthTipSuggestion2
};

// src/app/modules/ai/ai.route.ts
var router7 = express2.Router();
router7.post("/chat", aiController.chatAI);
router7.post(
  "/blog-post",
  auth2(Role.ADMIN),
  aiController.blogPostGenerator
);
router7.post(
  "/meal-description",
  auth2(Role.PROVIDER),
  aiController.generateMealDescription
);
router7.get("/health-tip", aiController.aiHealthTipSuggestion);
var aiRoutes = router7;

// src/app/modules/blog/blog.route.ts
import express3 from "express";

// src/app/modules/blog/blog.service.ts
var getAllBlogs = async (payload = {}) => {
  const page = Number(payload.page) || 1;
  const limit = Number(payload.limit) || 10;
  const skip = Number(payload.skip) || (page - 1) * limit;
  const search = typeof payload.search === "string" && payload.search.trim() && payload.search !== "undefined" && payload.search !== "null" ? payload.search.trim() : void 0;
  const userId = typeof payload.userId === "string" && payload.userId.trim() && payload.userId !== "undefined" && payload.userId !== "null" ? payload.userId.trim() : void 0;
  const whereCondition = buildBlogQueryCondition({
    ...search ? { search } : {},
    ...userId ? { userId } : {}
  });
  const blogPosts = await prisma.blogs.findMany({
    take: limit,
    skip,
    where: whereCondition,
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      [payload.sortBy || "createdAt"]: payload.sortOrder || "desc"
    }
  });
  const total = await prisma.blogs.count({
    where: whereCondition
  });
  if (!blogPosts || blogPosts.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No blog posts found");
  }
  const totalPages = Math.ceil(total / limit);
  return {
    data: blogPosts,
    pagination: {
      total,
      page: payload.page || 1,
      limit: payload.limit || 10,
      totalPages
    }
  };
};
var getAllForAdmin = async (payload = {}) => {
  const page = Number(payload.page) || 1;
  const limit = Number(payload.limit) || 10;
  const skip = Number(payload.skip) || (page - 1) * limit;
  const blogPosts = await prisma.blogs.findMany({
    take: limit,
    skip,
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      [payload.sortBy || "createdAt"]: payload.sortOrder || "desc"
    }
  });
  const total = await prisma.blogs.count();
  if (!blogPosts || blogPosts.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No blog posts found");
  }
  const totalPages = Math.ceil(total / limit);
  return {
    data: blogPosts,
    pagination: {
      total,
      page: payload.page || 1,
      limit: payload.limit || 10,
      totalPages
    }
  };
};
var getBlogBySlug = async (slug) => {
  const blog = await prisma.blogs.findUnique({
    where: {
      slug
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });
  return blog;
};
var deleteBlogById = async (id) => {
  const deletedBlog = await prisma.blogs.delete({
    where: {
      id: Number(id)
    }
  });
  return deletedBlog;
};
var BlogService = {
  getAllBlogs,
  getAllForAdmin,
  getBlogBySlug,
  deleteBlogById
};

// src/app/modules/blog/blog.controller.ts
var getAllBlogs2 = catchAsync(async (req, res) => {
  const payload = req.query;
  const { page, limit, skip, sortBy, sortOrder } = PaginationSortingHelper_default(
    payload
  );
  const normalizedSearch = typeof payload.search === "string" && payload.search.trim() ? payload.search.trim() : void 0;
  const result = await BlogService.getAllBlogs({
    page: Number(page),
    limit: Number(limit),
    skip: Number(skip),
    ...normalizedSearch ? { search: normalizedSearch } : {},
    sortBy,
    sortOrder
  });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blogs retrieved successfully",
    data: result.data,
    meta: {
      page: result.pagination.page,
      limit: result.pagination.limit,
      total: result.pagination.total,
      totalPages: result.pagination.totalPages
    }
  });
});
var getAllForAdmin2 = catchAsync(async (req, res) => {
  const payload = req.query;
  const { page, limit, skip, sortBy, sortOrder } = PaginationSortingHelper_default(
    payload
  );
  const result = await BlogService.getAllForAdmin({
    page: Number(page),
    limit: Number(limit),
    skip: Number(skip),
    sortBy,
    sortOrder
  });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blogs retrieved successfully",
    data: result.data,
    meta: {
      page: result.pagination.page,
      limit: result.pagination.limit,
      total: result.pagination.total,
      totalPages: result.pagination.totalPages
    }
  });
});
var getBlogBySlug2 = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const blog = await BlogService.getBlogBySlug(slug);
  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Blog post not found");
  }
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blog retrieved successfully",
    data: blog
  });
});
var deleteBlogById2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  await BlogService.deleteBlogById(Number(id));
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blog deleted successfully"
  });
});
var BlogController = {
  getAllBlogs: getAllBlogs2,
  getAllForAdmin: getAllForAdmin2,
  getBlogBySlug: getBlogBySlug2,
  deleteBlogById: deleteBlogById2
};

// src/app/modules/blog/blog.route.ts
var router8 = express3.Router();
router8.get(
  "/",
  BlogController.getAllBlogs
);
router8.get(
  "/admin",
  auth2(Role.ADMIN),
  BlogController.getAllForAdmin
);
router8.get(
  "/:slug",
  BlogController.getBlogBySlug
);
router8.delete(
  "/:id",
  auth2(Role.ADMIN),
  BlogController.deleteBlogById
);
var BlogRoutes = router8;

// src/app/routes/index.ts
var router9 = express4.Router();
var moduleRoutes = [
  {
    path: "/users",
    routes: UserRoutes
  },
  {
    path: "/providers",
    routes: ProviderRoutes
  },
  {
    path: "/categories",
    routes: CategoryRoutes
  },
  {
    path: "/meals",
    routes: MealRoutes
  },
  {
    path: "/orders",
    routes: OrderRoutes
  },
  {
    path: "/reviews",
    routes: ReviewRoutes
  },
  {
    path: "/ai",
    routes: aiRoutes
  },
  {
    path: "/blogs",
    routes: BlogRoutes
  }
];
moduleRoutes.forEach((route) => router9.use(route.path, route.routes));
var routes_default = router9;

// src/app.ts
var app = express5();
app.set("trust proxy", 1);
app.use(express5.json({ limit: "16kb" }));
app.use(express5.urlencoded({ extended: true, limit: "16kb" }));
app.use(
  cors({
    // origin: ["http://localhost:3000", "https://mealmate-lemon.vercel.app"],
    origin: (origin, callback) => {
      const allowed = envVars.FRONTEND_URL?.replace(/\/$/, "");
      if (!origin || origin.replace(/\/$/, "") === allowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);
app.all("/api/auth/*any", toNodeHandler(auth));
app.get("/", (req, res) => {
  sendResponse(res, {
    statusCode: status17.OK,
    success: true,
    message: "Server is running",
    data: {
      author: "Md. Abu Sufian Jidan",
      version: "1.0.0",
      host: req.hostname,
      time: (/* @__PURE__ */ new Date()).toISOString()
    }
  });
});
app.use("/api/v1", routes_default);
app.use(globalErrorHandler);
app.use(notFound_default);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
