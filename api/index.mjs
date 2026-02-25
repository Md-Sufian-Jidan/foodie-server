// src/app.ts
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express3 from "express";

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
  const { statusCode, success, message, data } = responseData;
  res.status(statusCode).json({
    success,
    statusCode,
    message,
    data
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
  "inlineSchema": 'model Category {\n  id   String @id @default(uuid())\n  name String @unique\n  slug String @unique\n\n  meals Meal[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nenum Role {\n  ADMIN\n  PROVIDER\n  CUSTOMER\n}\n\nenum UserStatus {\n  ACTIVE\n  INACTIVE\n  BLOCKED\n  DELETED\n}\n\nenum OrderStatus {\n  PENDING\n  ACCEPTED\n  COOKING\n  ON_THE_WAY\n  DELIVERED\n  CANCELLED\n}\n\nenum PaymentType {\n  COD\n}\n\nmodel Meal {\n  id          String          @id @default(uuid())\n  providerId  String\n  categoryId  String\n  name        String\n  description String?\n  price       Float\n  image       String?\n  isAvailable Boolean         @default(true)\n  calories    Int\n  ingredients String[]        @default([])\n  cuisine     String?\n  dietary     String[]        @default([])\n  mealType    String?\n  spiceLevel  String?\n  provider    ProviderProfile @relation(fields: [providerId], references: [id])\n  category    Category        @relation(fields: [categoryId], references: [id])\n  reviews     Review[]\n  orderItems  OrderItem[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel Order {\n  id          String      @id @default(uuid())\n  orderNumber String?     @unique\n  userId      String\n  providerId  String\n  totalAmount Float\n  status      OrderStatus\n  address     String\n  paymentType PaymentType @default(COD)\n\n  user     User            @relation(fields: [userId], references: [id])\n  provider ProviderProfile @relation(fields: [providerId], references: [id])\n  items    OrderItem[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel OrderItem {\n  id       String @id @default(uuid())\n  orderId  String\n  mealId   String\n  price    Float\n  quantity Int\n\n  order Order @relation(fields: [orderId], references: [id])\n  meal  Meal  @relation(fields: [mealId], references: [id])\n}\n\nmodel ProviderProfile {\n  id          String  @id @default(uuid())\n  userId      String  @unique\n  shopName    String\n  description String?\n  address     String\n  phone       String\n  isOpen      Boolean @default(true)\n\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  meals     Meal[]\n  orders    Order[]\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel Review {\n  id      String  @id @default(uuid())\n  userId  String\n  mealId  String\n  rating  Int\n  comment String?\n\n  user User @relation(fields: [userId], references: [id])\n  meal Meal @relation(fields: [mealId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([userId, mealId], name: "unique_user_meal_review")\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id            String     @id\n  name          String\n  email         String\n  emailVerified Boolean    @default(false)\n  image         String?\n  role          Role       @default(CUSTOMER)\n  status        UserStatus @default(ACTIVE)\n  phone         String?\n  createdAt     DateTime   @default(now())\n  updatedAt     DateTime   @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n\n  providerProfile ProviderProfile?\n  orders          Order[]\n  reviews         Review[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n',
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
config.runtimeDataModel = JSON.parse('{"models":{"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"meals","kind":"object","type":"Meal","relationName":"CategoryToMeal"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Meal":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"image","kind":"scalar","type":"String"},{"name":"isAvailable","kind":"scalar","type":"Boolean"},{"name":"calories","kind":"scalar","type":"Int"},{"name":"ingredients","kind":"scalar","type":"String"},{"name":"cuisine","kind":"scalar","type":"String"},{"name":"dietary","kind":"scalar","type":"String"},{"name":"mealType","kind":"scalar","type":"String"},{"name":"spiceLevel","kind":"scalar","type":"String"},{"name":"provider","kind":"object","type":"ProviderProfile","relationName":"MealToProviderProfile"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToMeal"},{"name":"reviews","kind":"object","type":"Review","relationName":"MealToReview"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"MealToOrderItem"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Order":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderNumber","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"totalAmount","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"address","kind":"scalar","type":"String"},{"name":"paymentType","kind":"enum","type":"PaymentType"},{"name":"user","kind":"object","type":"User","relationName":"OrderToUser"},{"name":"provider","kind":"object","type":"ProviderProfile","relationName":"OrderToProviderProfile"},{"name":"items","kind":"object","type":"OrderItem","relationName":"OrderToOrderItem"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"OrderItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"mealId","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToOrderItem"},{"name":"meal","kind":"object","type":"Meal","relationName":"MealToOrderItem"}],"dbName":null},"ProviderProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"shopName","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"isOpen","kind":"scalar","type":"Boolean"},{"name":"user","kind":"object","type":"User","relationName":"ProviderProfileToUser"},{"name":"meals","kind":"object","type":"Meal","relationName":"MealToProviderProfile"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToProviderProfile"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"mealId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"meal","kind":"object","type":"Meal","relationName":"MealToReview"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"phone","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"providerProfile","kind":"object","type":"ProviderProfile","relationName":"ProviderProfileToUser"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","providerProfile","provider","order","meal","items","_count","orders","reviews","meals","category","orderItems","Category.findUnique","Category.findUniqueOrThrow","Category.findFirst","Category.findFirstOrThrow","Category.findMany","data","Category.createOne","Category.createMany","Category.createManyAndReturn","Category.updateOne","Category.updateMany","Category.updateManyAndReturn","create","update","Category.upsertOne","Category.deleteOne","Category.deleteMany","having","_min","_max","Category.groupBy","Category.aggregate","Meal.findUnique","Meal.findUniqueOrThrow","Meal.findFirst","Meal.findFirstOrThrow","Meal.findMany","Meal.createOne","Meal.createMany","Meal.createManyAndReturn","Meal.updateOne","Meal.updateMany","Meal.updateManyAndReturn","Meal.upsertOne","Meal.deleteOne","Meal.deleteMany","_avg","_sum","Meal.groupBy","Meal.aggregate","Order.findUnique","Order.findUniqueOrThrow","Order.findFirst","Order.findFirstOrThrow","Order.findMany","Order.createOne","Order.createMany","Order.createManyAndReturn","Order.updateOne","Order.updateMany","Order.updateManyAndReturn","Order.upsertOne","Order.deleteOne","Order.deleteMany","Order.groupBy","Order.aggregate","OrderItem.findUnique","OrderItem.findUniqueOrThrow","OrderItem.findFirst","OrderItem.findFirstOrThrow","OrderItem.findMany","OrderItem.createOne","OrderItem.createMany","OrderItem.createManyAndReturn","OrderItem.updateOne","OrderItem.updateMany","OrderItem.updateManyAndReturn","OrderItem.upsertOne","OrderItem.deleteOne","OrderItem.deleteMany","OrderItem.groupBy","OrderItem.aggregate","ProviderProfile.findUnique","ProviderProfile.findUniqueOrThrow","ProviderProfile.findFirst","ProviderProfile.findFirstOrThrow","ProviderProfile.findMany","ProviderProfile.createOne","ProviderProfile.createMany","ProviderProfile.createManyAndReturn","ProviderProfile.updateOne","ProviderProfile.updateMany","ProviderProfile.updateManyAndReturn","ProviderProfile.upsertOne","ProviderProfile.deleteOne","ProviderProfile.deleteMany","ProviderProfile.groupBy","ProviderProfile.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","AND","OR","NOT","id","identifier","value","expiresAt","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","accountId","providerId","userId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","name","email","emailVerified","image","Role","role","UserStatus","status","phone","every","some","none","mealId","rating","comment","shopName","description","address","isOpen","orderId","price","quantity","orderNumber","totalAmount","OrderStatus","PaymentType","paymentType","categoryId","isAvailable","calories","ingredients","cuisine","dietary","mealType","spiceLevel","has","hasEvery","hasSome","slug","unique_user_meal_review","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","push","increment","decrement","multiply","divide"]'),
  graph: "_QReoAEJDgAAvwIAILkBAADNAgAwugEAACwAELsBAADNAgAwvAEBAAAAAcABQACaAgAhwQFAAJoCACHaAQEAAAABgAIBAAAAAQEAAAABACAXBwAA2AIAIA0AALcCACAPAADeAgAgEAAA2QIAILkBAADdAgAwugEAAAMAELsBAADdAgAwvAEBAJkCACHAAUAAmgIAIcEBQACaAgAhzgEBAJkCACHaAQEAmQIAId0BAQCwAgAh6gEBALACACHuAQgA0wIAIfUBAQCZAgAh9gEgAK8CACH3AQIA0AIAIfgBAADLAgAg-QEBALACACH6AQAAywIAIPsBAQCwAgAh_AEBALACACEJBwAAiwQAIA0AAI0EACAPAAC8BAAgEAAAuwQAIN0BAADkAgAg6gEAAOQCACD5AQAA5AIAIPsBAADkAgAg_AEAAOQCACAXBwAA2AIAIA0AALcCACAPAADeAgAgEAAA2QIAILkBAADdAgAwugEAAAMAELsBAADdAgAwvAEBAAAAAcABQACaAgAhwQFAAJoCACHOAQEAmQIAIdoBAQCZAgAh3QEBALACACHqAQEAsAIAIe4BCADTAgAh9QEBAJkCACH2ASAArwIAIfcBAgDQAgAh-AEAAMsCACD5AQEAsAIAIfoBAADLAgAg-wEBALACACH8AQEAsAIAIQMAAAADACABAAAEADACAAAFACAMAwAAvgIAILkBAADcAgAwugEAAAcAELsBAADcAgAwvAEBAJkCACG_AUAAmgIAIcABQACaAgAhwQFAAJoCACHPAQEAmQIAIdcBAQCZAgAh2AEBALACACHZAQEAsAIAIQMDAACYBAAg2AEAAOQCACDZAQAA5AIAIAwDAAC-AgAguQEAANwCADC6AQAABwAQuwEAANwCADC8AQEAAAABvwFAAJoCACHAAUAAmgIAIcEBQACaAgAhzwEBAJkCACHXAQEAAAAB2AEBALACACHZAQEAsAIAIQMAAAAHACABAAAIADACAAAJACARAwAAvgIAILkBAADaAgAwugEAAAsAELsBAADaAgAwvAEBAJkCACHAAUAAmgIAIcEBQACaAgAhzQEBAJkCACHOAQEAmQIAIc8BAQCZAgAh0AEBALACACHRAQEAsAIAIdIBAQCwAgAh0wFAANsCACHUAUAA2wIAIdUBAQCwAgAh1gEBALACACEIAwAAmAQAINABAADkAgAg0QEAAOQCACDSAQAA5AIAINMBAADkAgAg1AEAAOQCACDVAQAA5AIAINYBAADkAgAgEQMAAL4CACC5AQAA2gIAMLoBAAALABC7AQAA2gIAMLwBAQAAAAHAAUAAmgIAIcEBQACaAgAhzQEBAJkCACHOAQEAmQIAIc8BAQCZAgAh0AEBALACACHRAQEAsAIAIdIBAQCwAgAh0wFAANsCACHUAUAA2wIAIdUBAQCwAgAh1gEBALACACEDAAAACwAgAQAADAAwAgAADQAgDwMAAL4CACAMAAC2AgAgDgAAvwIAILkBAAC9AgAwugEAAA8AELsBAAC9AgAwvAEBAJkCACHAAUAAmgIAIcEBQACaAgAhzwEBAJkCACHiAQEAmQIAIekBAQCZAgAh6gEBALACACHrAQEAmQIAIewBIACvAgAhAQAAAA8AIBADAAC-AgAgBwAA2AIAIAoAANkCACC5AQAA1QIAMLoBAAARABC7AQAA1QIAMLwBAQCZAgAhwAFAAJoCACHBAUAAmgIAIc4BAQCZAgAhzwEBAJkCACHhAQAA1gLzASLrAQEAmQIAIfABAQCwAgAh8QEIANMCACH0AQAA1wL0ASIEAwAAmAQAIAcAAIsEACAKAAC7BAAg8AEAAOQCACAQAwAAvgIAIAcAANgCACAKAADZAgAguQEAANUCADC6AQAAEQAQuwEAANUCADC8AQEAAAABwAFAAJoCACHBAUAAmgIAIc4BAQCZAgAhzwEBAJkCACHhAQAA1gLzASLrAQEAmQIAIfABAQAAAAHxAQgA0wIAIfQBAADXAvQBIgMAAAARACABAAASADACAAATACAKCAAA1AIAIAkAANECACC5AQAA0gIAMLoBAAAVABC7AQAA0gIAMLwBAQCZAgAh5gEBAJkCACHtAQEAmQIAIe4BCADTAgAh7wECANACACECCAAAugQAIAkAALkEACAKCAAA1AIAIAkAANECACC5AQAA0gIAMLoBAAAVABC7AQAA0gIAMLwBAQAAAAHmAQEAmQIAIe0BAQCZAgAh7gEIANMCACHvAQIA0AIAIQMAAAAVACABAAAWADACAAAXACABAAAAFQAgDAMAAL4CACAJAADRAgAguQEAAM8CADC6AQAAGgAQuwEAAM8CADC8AQEAmQIAIcABQACaAgAhwQFAAJoCACHPAQEAmQIAIeYBAQCZAgAh5wECANACACHoAQEAsAIAIQMDAACYBAAgCQAAuQQAIOgBAADkAgAgDQMAAL4CACAJAADRAgAguQEAAM8CADC6AQAAGgAQuwEAAM8CADC8AQEAAAABwAFAAJoCACHBAUAAmgIAIc8BAQCZAgAh5gEBAJkCACHnAQIA0AIAIegBAQCwAgAhgQIAAM4CACADAAAAGgAgAQAAGwAwAgAAHAAgAQAAAAcAIAEAAAALACABAAAAEQAgAQAAABoAIAMAAAADACABAAAEADACAAAFACADAAAAEQAgAQAAEgAwAgAAEwAgAQAAAAMAIAEAAAARACADAAAAGgAgAQAAGwAwAgAAHAAgAwAAABUAIAEAABYAMAIAABcAIAEAAAAaACABAAAAFQAgAQAAAAMAIAEAAAABACAJDgAAvwIAILkBAADNAgAwugEAACwAELsBAADNAgAwvAEBAJkCACHAAUAAmgIAIcEBQACaAgAh2gEBAJkCACGAAgEAmQIAIQEOAACZBAAgAwAAACwAIAEAAC0AMAIAAAEAIAMAAAAsACABAAAtADACAAABACADAAAALAAgAQAALQAwAgAAAQAgBg4AALgEACC8AQEAAAABwAFAAAAAAcEBQAAAAAHaAQEAAAABgAIBAAAAAQEWAAAxACAFvAEBAAAAAcABQAAAAAHBAUAAAAAB2gEBAAAAAYACAQAAAAEBFgAAMwAwARYAADMAMAYOAACuBAAgvAEBAOICACHAAUAA4wIAIcEBQADjAgAh2gEBAOICACGAAgEA4gIAIQIAAAABACAWAAA2ACAFvAEBAOICACHAAUAA4wIAIcEBQADjAgAh2gEBAOICACGAAgEA4gIAIQIAAAAsACAWAAA4ACACAAAALAAgFgAAOAAgAwAAAAEAIB0AADEAIB4AADYAIAEAAAABACABAAAALAAgAwsAAKsEACAjAACtBAAgJAAArAQAIAi5AQAAzAIAMLoBAAA_ABC7AQAAzAIAMLwBAQCRAgAhwAFAAJICACHBAUAAkgIAIdoBAQCRAgAhgAIBAJECACEDAAAALAAgAQAAPgAwIgAAPwAgAwAAACwAIAEAAC0AMAIAAAEAIAEAAAAFACABAAAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgFAcAAKoEACANAADoAwAgDwAA5wMAIBAAAOkDACC8AQEAAAABwAFAAAAAAcEBQAAAAAHOAQEAAAAB2gEBAAAAAd0BAQAAAAHqAQEAAAAB7gEIAAAAAfUBAQAAAAH2ASAAAAAB9wECAAAAAfgBAADlAwAg-QEBAAAAAfoBAADmAwAg-wEBAAAAAfwBAQAAAAEBFgAARwAgELwBAQAAAAHAAUAAAAABwQFAAAAAAc4BAQAAAAHaAQEAAAAB3QEBAAAAAeoBAQAAAAHuAQgAAAAB9QEBAAAAAfYBIAAAAAH3AQIAAAAB-AEAAOUDACD5AQEAAAAB-gEAAOYDACD7AQEAAAAB_AEBAAAAAQEWAABJADABFgAASQAwFAcAAKkEACANAADMAwAgDwAAywMAIBAAAM0DACC8AQEA4gIAIcABQADjAgAhwQFAAOMCACHOAQEA4gIAIdoBAQDiAgAh3QEBAOgCACHqAQEA6AIAIe4BCACVAwAh9QEBAOICACH2ASAA9AIAIfcBAgCGAwAh-AEAAMgDACD5AQEA6AIAIfoBAADJAwAg-wEBAOgCACH8AQEA6AIAIQIAAAAFACAWAABMACAQvAEBAOICACHAAUAA4wIAIcEBQADjAgAhzgEBAOICACHaAQEA4gIAId0BAQDoAgAh6gEBAOgCACHuAQgAlQMAIfUBAQDiAgAh9gEgAPQCACH3AQIAhgMAIfgBAADIAwAg-QEBAOgCACH6AQAAyQMAIPsBAQDoAgAh_AEBAOgCACECAAAAAwAgFgAATgAgAgAAAAMAIBYAAE4AIAMAAAAFACAdAABHACAeAABMACABAAAABQAgAQAAAAMAIAoLAACkBAAgIwAApwQAICQAAKYEACA1AAClBAAgNgAAqAQAIN0BAADkAgAg6gEAAOQCACD5AQAA5AIAIPsBAADkAgAg_AEAAOQCACATuQEAAMoCADC6AQAAVQAQuwEAAMoCADC8AQEAkQIAIcABQACSAgAhwQFAAJICACHOAQEAkQIAIdoBAQCRAgAh3QEBAJwCACHqAQEAnAIAIe4BCADBAgAh9QEBAJECACH2ASAApQIAIfcBAgC5AgAh-AEAAMsCACD5AQEAnAIAIfoBAADLAgAg-wEBAJwCACH8AQEAnAIAIQMAAAADACABAABUADAiAABVACADAAAAAwAgAQAABAAwAgAABQAgAQAAABMAIAEAAAATACADAAAAEQAgAQAAEgAwAgAAEwAgAwAAABEAIAEAABIAMAIAABMAIAMAAAARACABAAASADACAAATACANAwAAvQMAIAcAAKoDACAKAACrAwAgvAEBAAAAAcABQAAAAAHBAUAAAAABzgEBAAAAAc8BAQAAAAHhAQAAAPMBAusBAQAAAAHwAQEAAAAB8QEIAAAAAfQBAAAA9AECARYAAF0AIAq8AQEAAAABwAFAAAAAAcEBQAAAAAHOAQEAAAABzwEBAAAAAeEBAAAA8wEC6wEBAAAAAfABAQAAAAHxAQgAAAAB9AEAAAD0AQIBFgAAXwAwARYAAF8AMA0DAAC7AwAgBwAAmQMAIAoAAJoDACC8AQEA4gIAIcABQADjAgAhwQFAAOMCACHOAQEA4gIAIc8BAQDiAgAh4QEAAJYD8wEi6wEBAOICACHwAQEA6AIAIfEBCACVAwAh9AEAAJcD9AEiAgAAABMAIBYAAGIAIAq8AQEA4gIAIcABQADjAgAhwQFAAOMCACHOAQEA4gIAIc8BAQDiAgAh4QEAAJYD8wEi6wEBAOICACHwAQEA6AIAIfEBCACVAwAh9AEAAJcD9AEiAgAAABEAIBYAAGQAIAIAAAARACAWAABkACADAAAAEwAgHQAAXQAgHgAAYgAgAQAAABMAIAEAAAARACAGCwAAnwQAICMAAKIEACAkAAChBAAgNQAAoAQAIDYAAKMEACDwAQAA5AIAIA25AQAAwwIAMLoBAABrABC7AQAAwwIAMLwBAQCRAgAhwAFAAJICACHBAUAAkgIAIc4BAQCRAgAhzwEBAJECACHhAQAAxALzASLrAQEAkQIAIfABAQCcAgAh8QEIAMECACH0AQAAxQL0ASIDAAAAEQAgAQAAagAwIgAAawAgAwAAABEAIAEAABIAMAIAABMAIAEAAAAXACABAAAAFwAgAwAAABUAIAEAABYAMAIAABcAIAMAAAAVACABAAAWADACAAAXACADAAAAFQAgAQAAFgAwAgAAFwAgBwgAANgDACAJAACoAwAgvAEBAAAAAeYBAQAAAAHtAQEAAAAB7gEIAAAAAe8BAgAAAAEBFgAAcwAgBbwBAQAAAAHmAQEAAAAB7QEBAAAAAe4BCAAAAAHvAQIAAAABARYAAHUAMAEWAAB1ADAHCAAA1gMAIAkAAKYDACC8AQEA4gIAIeYBAQDiAgAh7QEBAOICACHuAQgAlQMAIe8BAgCGAwAhAgAAABcAIBYAAHgAIAW8AQEA4gIAIeYBAQDiAgAh7QEBAOICACHuAQgAlQMAIe8BAgCGAwAhAgAAABUAIBYAAHoAIAIAAAAVACAWAAB6ACADAAAAFwAgHQAAcwAgHgAAeAAgAQAAABcAIAEAAAAVACAFCwAAmgQAICMAAJ0EACAkAACcBAAgNQAAmwQAIDYAAJ4EACAIuQEAAMACADC6AQAAgQEAELsBAADAAgAwvAEBAJECACHmAQEAkQIAIe0BAQCRAgAh7gEIAMECACHvAQIAuQIAIQMAAAAVACABAACAAQAwIgAAgQEAIAMAAAAVACABAAAWADACAAAXACAPAwAAvgIAIAwAALYCACAOAAC_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_AQAgCrwBAQDiAgAhwAFAAOMCACHBAUAA4wIAIdoBAQDiAgAh2wEBAOICACHcASAA9AIAId0BAQDoAgAh3wEAAPUC3wEi4QEAAPYC4QEi4gEBAOgCACECAAAAtQEAIBYAAMEBACACAAAAtQEAIBYAAMEBACADAAAAsgEAIB0AALoBACAeAAC_AQAgAQAAALIBACABAAAAtQEAIAULAADxAgAgIwAA8wIAICQAAPICACDdAQAA5AIAIOIBAADkAgAgDbkBAACkAgAwugEAAMgBABC7AQAApAIAMLwBAQCRAgAhwAFAAJICACHBAUAAkgIAIdoBAQCRAgAh2wEBAJECACHcASAApQIAId0BAQCcAgAh3wEAAKYC3wEi4QEAAKcC4QEi4gEBAJwCACEDAAAAtQEAIAEAAMcBADAiAADIAQAgAwAAALUBACABAAC2AQAwAgAAsgEAIAEAAAAJACABAAAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgCQMAAPACACC8AQEAAAABvwFAAAAAAcABQAAAAAHBAUAAAAABzwEBAAAAAdcBAQAAAAHYAQEAAAAB2QEBAAAAAQEWAADQAQAgCLwBAQAAAAG_AUAAAAABwAFAAAAAAcEBQAAAAAHPAQEAAAAB1wEBAAAAAdgBAQAAAAHZAQEAAAABARYAANIBADABFgAA0gEAMAkDAADvAgAgvAEBAOICACG_AUAA4wIAIcABQADjAgAhwQFAAOMCACHPAQEA4gIAIdcBAQDiAgAh2AEBAOgCACHZAQEA6AIAIQIAAAAJACAWAADVAQAgCLwBAQDiAgAhvwFAAOMCACHAAUAA4wIAIcEBQADjAgAhzwEBAOICACHXAQEA4gIAIdgBAQDoAgAh2QEBAOgCACECAAAABwAgFgAA1wEAIAIAAAAHACAWAADXAQAgAwAAAAkAIB0AANABACAeAADVAQAgAQAAAAkAIAEAAAAHACAFCwAA7AIAICMAAO4CACAkAADtAgAg2AEAAOQCACDZAQAA5AIAIAu5AQAAowIAMLoBAADeAQAQuwEAAKMCADC8AQEAkQIAIb8BQACSAgAhwAFAAJICACHBAUAAkgIAIc8BAQCRAgAh1wEBAJECACHYAQEAnAIAIdkBAQCcAgAhAwAAAAcAIAEAAN0BADAiAADeAQAgAwAAAAcAIAEAAAgAMAIAAAkAIAEAAAANACABAAAADQAgAwAAAAsAIAEAAAwAMAIAAA0AIAMAAAALACABAAAMADACAAANACADAAAACwAgAQAADAAwAgAADQAgDgMAAOsCACC8AQEAAAABwAFAAAAAAcEBQAAAAAHNAQEAAAABzgEBAAAAAc8BAQAAAAHQAQEAAAAB0QEBAAAAAdIBAQAAAAHTAUAAAAAB1AFAAAAAAdUBAQAAAAHWAQEAAAABARYAAOYBACANvAEBAAAAAcABQAAAAAHBAUAAAAABzQEBAAAAAc4BAQAAAAHPAQEAAAAB0AEBAAAAAdEBAQAAAAHSAQEAAAAB0wFAAAAAAdQBQAAAAAHVAQEAAAAB1gEBAAAAAQEWAADoAQAwARYAAOgBADAOAwAA6gIAILwBAQDiAgAhwAFAAOMCACHBAUAA4wIAIc0BAQDiAgAhzgEBAOICACHPAQEA4gIAIdABAQDoAgAh0QEBAOgCACHSAQEA6AIAIdMBQADpAgAh1AFAAOkCACHVAQEA6AIAIdYBAQDoAgAhAgAAAA0AIBYAAOsBACANvAEBAOICACHAAUAA4wIAIcEBQADjAgAhzQEBAOICACHOAQEA4gIAIc8BAQDiAgAh0AEBAOgCACHRAQEA6AIAIdIBAQDoAgAh0wFAAOkCACHUAUAA6QIAIdUBAQDoAgAh1gEBAOgCACECAAAACwAgFgAA7QEAIAIAAAALACAWAADtAQAgAwAAAA0AIB0AAOYBACAeAADrAQAgAQAAAA0AIAEAAAALACAKCwAA5QIAICMAAOcCACAkAADmAgAg0AEAAOQCACDRAQAA5AIAINIBAADkAgAg0wEAAOQCACDUAQAA5AIAINUBAADkAgAg1gEAAOQCACAQuQEAAJsCADC6AQAA9AEAELsBAACbAgAwvAEBAJECACHAAUAAkgIAIcEBQACSAgAhzQEBAJECACHOAQEAkQIAIc8BAQCRAgAh0AEBAJwCACHRAQEAnAIAIdIBAQCcAgAh0wFAAJ0CACHUAUAAnQIAIdUBAQCcAgAh1gEBAJwCACEDAAAACwAgAQAA8wEAMCIAAPQBACADAAAACwAgAQAADAAwAgAADQAgCbkBAACYAgAwugEAAPoBABC7AQAAmAIAMLwBAQAAAAG9AQEAmQIAIb4BAQCZAgAhvwFAAJoCACHAAUAAmgIAIcEBQACaAgAhAQAAAPcBACABAAAA9wEAIAm5AQAAmAIAMLoBAAD6AQAQuwEAAJgCADC8AQEAmQIAIb0BAQCZAgAhvgEBAJkCACG_AUAAmgIAIcABQACaAgAhwQFAAJoCACEAAwAAAPoBACABAAD7AQAwAgAA9wEAIAMAAAD6AQAgAQAA-wEAMAIAAPcBACADAAAA-gEAIAEAAPsBADACAAD3AQAgBrwBAQAAAAG9AQEAAAABvgEBAAAAAb8BQAAAAAHAAUAAAAABwQFAAAAAAQEWAAD_AQAgBrwBAQAAAAG9AQEAAAABvgEBAAAAAb8BQAAAAAHAAUAAAAABwQFAAAAAAQEWAACBAgAwARYAAIECADAGvAEBAOICACG9AQEA4gIAIb4BAQDiAgAhvwFAAOMCACHAAUAA4wIAIcEBQADjAgAhAgAAAPcBACAWAACEAgAgBrwBAQDiAgAhvQEBAOICACG-AQEA4gIAIb8BQADjAgAhwAFAAOMCACHBAUAA4wIAIQIAAAD6AQAgFgAAhgIAIAIAAAD6AQAgFgAAhgIAIAMAAAD3AQAgHQAA_wEAIB4AAIQCACABAAAA9wEAIAEAAAD6AQAgAwsAAN8CACAjAADhAgAgJAAA4AIAIAm5AQAAkAIAMLoBAACNAgAQuwEAAJACADC8AQEAkQIAIb0BAQCRAgAhvgEBAJECACG_AUAAkgIAIcABQACSAgAhwQFAAJICACEDAAAA-gEAIAEAAIwCADAiAACNAgAgAwAAAPoBACABAAD7AQAwAgAA9wEAIAm5AQAAkAIAMLoBAACNAgAQuwEAAJACADC8AQEAkQIAIb0BAQCRAgAhvgEBAJECACG_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AgAwugEAAA8AELsBAAC9AgAwvAEBAJkCACHAAUAAmgIAIcEBQACaAgAhzwEBAJkCACHiAQEAmQIAIekBAQCZAgAh6gEBALACACHrAQEAmQIAIewBIACvAgAhggIAAA8AIIMCAAAPACAD4wEAABEAIOQBAAARACDlAQAAEQAgA-MBAAAaACDkAQAAGgAg5QEAABoAIAq5AQAAuAIAMLoBAACvAQAQuwEAALgCADC8AQEAkQIAIcABQACSAgAhwQFAAJICACHPAQEAkQIAIeYBAQCRAgAh5wECALkCACHoAQEAnAIAIQ0LAACUAgAgIwAAlAIAICQAAJQCACA1AAC7AgAgNgAAlAIAIMIBAgAAAAHDAQIAAAAExAECAAAABMUBAgAAAAHGAQIAAAABxwECAAAAAcgBAgAAAAHJAQIAugIAIQ0LAACUAgAgIwAAlAIAICQAAJQCACA1AAC7AgAgNgAAlAIAIMIBAgAAAAHDAQIAAAAExAECAAAABMUBAgAAAAHGAQIAAAABxwECAAAAAcgBAgAAAAHJAQIAugIAIQjCAQgAAAABwwEIAAAABMQBCAAAAATFAQgAAAABxgEIAAAAAccBCAAAAAHIAQgAAAAByQEIALsCACEMuQEAALwCADC6AQAAmQEAELsBAAC8AgAwvAEBAJECACHAAUAAkgIAIcEBQACSAgAhzwEBAJECACHiAQEAkQIAIekBAQCRAgAh6gEBAJwCACHrAQEAkQIAIewBIAClAgAhDwMAAL4CACAMAAC2AgAgDgAAvwIAILkBAAC9AgAwugEAAA8AELsBAAC9AgAwvAEBAJkCACHAAUAAmgIAIcEBQACaAgAhzwEBAJkCACHiAQEAmQIAIekBAQCZAgAh6gEBALACACHrAQEAmQIAIewBIACvAgAhFAQAALMCACAFAAC0AgAgBgAAtQIAIAwAALYCACANAAC3AgAguQEAAK4CADC6AQAAtQEAELsBAACuAgAwvAEBAJkCACHAAUAAmgIAIcEBQACaAgAh2gEBAJkCACHbAQEAmQIAIdwBIACvAgAh3QEBALACACHfAQAAsQLfASLhAQAAsgLhASLiAQEAsAIAIYICAAC1AQAggwIAALUBACAD4wEAAAMAIOQBAAADACDlAQAAAwAgCLkBAADAAgAwugEAAIEBABC7AQAAwAIAMLwBAQCRAgAh5gEBAJECACHtAQEAkQIAIe4BCADBAgAh7wECALkCACENCwAAlAIAICMAALsCACAkAAC7AgAgNQAAuwIAIDYAALsCACDCAQgAAAABwwEIAAAABMQBCAAAAATFAQgAAAABxgEIAAAAAccBCAAAAAHIAQgAAAAByQEIAMICACENCwAAlAIAICMAALsCACAkAAC7AgAgNQAAuwIAIDYAALsCACDCAQgAAAABwwEIAAAABMQBCAAAAATFAQgAAAABxgEIAAAAAccBCAAAAAHIAQgAAAAByQEIAMICACENuQEAAMMCADC6AQAAawAQuwEAAMMCADC8AQEAkQIAIcABQACSAgAhwQFAAJICACHOAQEAkQIAIc8BAQCRAgAh4QEAAMQC8wEi6wEBAJECACHwAQEAnAIAIfEBCADBAgAh9AEAAMUC9AEiBwsAAJQCACAjAADJAgAgJAAAyQIAIMIBAAAA8wECwwEAAADzAQjEAQAAAPMBCMkBAADIAvMBIgcLAACUAgAgIwAAxwIAICQAAMcCACDCAQAAAPQBAsMBAAAA9AEIxAEAAAD0AQjJAQAAxgL0ASIHCwAAlAIAICMAAMcCACAkAADHAgAgwgEAAAD0AQLDAQAAAPQBCMQBAAAA9AEIyQEAAMYC9AEiBMIBAAAA9AECwwEAAAD0AQjEAQAAAPQBCMkBAADHAvQBIgcLAACUAgAgIwAAyQIAICQAAMkCACDCAQAAAPMBAsMBAAAA8wEIxAEAAADzAQjJAQAAyALzASIEwgEAAADzAQLDAQAAAPMBCMQBAAAA8wEIyQEAAMkC8wEiE7kBAADKAgAwugEAAFUAELsBAADKAgAwvAEBAJECACHAAUAAkgIAIcEBQACSAgAhzgEBAJECACHaAQEAkQIAId0BAQCcAgAh6gEBAJwCACHuAQgAwQIAIfUBAQCRAgAh9gEgAKUCACH3AQIAuQIAIfgBAADLAgAg-QEBAJwCACH6AQAAywIAIPsBAQCcAgAh_AEBAJwCACEEwgEBAAAABf0BAQAAAAH-AQEAAAAE_wEBAAAABAi5AQAAzAIAMLoBAAA_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_AQAIIQCAAD6BAAghQIAAPsEACCKAgAAsgEAIAMdAAD5BAAghAIAAPoEACCKAgAAsgEAIAAAAAUdAAD0BAAgHgAA9wQAIIQCAAD1BAAghQIAAPYEACCKAgAAsgEAIAMdAAD0BAAghAIAAPUEACCKAgAAsgEAIAAAAAGHAiAAAAABAYcCAAAA3wECAYcCAAAA4QECCx0AAPgDADAeAAD9AwAwhAIAAPkDADCFAgAA-gMAMIYCAAD7AwAghwIAAPwDADCIAgAA_AMAMIkCAAD8AwAwigIAAPwDADCLAgAA_gMAMIwCAAD_AwAwCx0AAOwDADAeAADxAwAwhAIAAO0DADCFAgAA7gMAMIYCAADvAwAghwIAAPADADCIAgAA8AMAMIkCAADwAwAwigIAAPADADCLAgAA8gMAMIwCAADzAwAwBx0AAKwDACAeAACvAwAghAIAAK0DACCFAgAArgMAIIgCAAAPACCJAgAADwAgigIAAIQBACALHQAAiwMAMB4AAJADADCEAgAAjAMAMIUCAACNAwAwhgIAAI4DACCHAgAAjwMAMIgCAACPAwAwiQIAAI8DADCKAgAAjwMAMIsCAACRAwAwjAIAAJIDADALHQAA_AIAMB4AAIEDADCEAgAA_QIAMIUCAAD-AgAwhgIAAP8CACCHAgAAgAMAMIgCAACAAwAwiQIAAIADADCKAgAAgAMAMIsCAACCAwAwjAIAAIMDADAHCQAAigMAILwBAQAAAAHAAUAAAAABwQFAAAAAAeYBAQAAAAHnAQIAAAAB6AEBAAAAAQIAAAAcACAdAACJAwAgAwAAABwAIB0AAIkDACAeAACHAwAgARYAAPMEADANAwAAvgIAIAkAANECACC5AQAAzwIAMLoBAAAaABC7AQAAzwIAMLwBAQAAAAHAAUAAmgIAIcEBQACaAgAhzwEBAJkCACHmAQEAmQIAIecBAgDQAgAh6AEBALACACGBAgAAzgIAIAIAAAAcACAWAACHAwAgAgAAAIQDACAWAACFAwAgCrkBAACDAwAwugEAAIQDABC7AQAAgwMAMLwBAQCZAgAhwAFAAJoCACHBAUAAmgIAIc8BAQCZAgAh5gEBAJkCACHnAQIA0AIAIegBAQCwAgAhCrkBAACDAwAwugEAAIQDABC7AQAAgwMAMLwBAQCZAgAhwAFAAJoCACHBAUAAmgIAIc8BAQCZAgAh5gEBAJkCACHnAQIA0AIAIegBAQCwAgAhBrwBAQDiAgAhwAFAAOMCACHBAUAA4wIAIeYBAQDiAgAh5wECAIYDACHoAQEA6AIAIQWHAgIAAAABjgICAAAAAY8CAgAAAAGQAgIAAAABkQICAAAAAQcJAACIAwAgvAEBAOICACHAAUAA4wIAIcEBQADjAgAh5gEBAOICACHnAQIAhgMAIegBAQDoAgAhBR0AAO4EACAeAADxBAAghAIAAO8EACCFAgAA8AQAIIoCAAAFACAHCQAAigMAILwBAQAAAAHAAUAAAAABwQFAAAAAAeYBAQAAAAHnAQIAAAAB6AEBAAAAAQMdAADuBAAghAIAAO8EACCKAgAABQAgCwcAAKoDACAKAACrAwAgvAEBAAAAAcABQAAAAAHBAUAAAAABzgEBAAAAAeEBAAAA8wEC6wEBAAAAAfABAQAAAAHxAQgAAAAB9AEAAAD0AQICAAAAEwAgHQAAqQMAIAMAAAATACAdAACpAwAgHgAAmAMAIAEWAADtBAAwEAMAAL4CACAHAADYAgAgCgAA2QIAILkBAADVAgAwugEAABEAELsBAADVAgAwvAEBAAAAAcABQACaAgAhwQFAAJoCACHOAQEAmQIAIc8BAQCZAgAh4QEAANYC8wEi6wEBAJkCACHwAQEAAAAB8QEIANMCACH0AQAA1wL0ASICAAAAEwAgFgAAmAMAIAIAAACTAwAgFgAAlAMAIA25AQAAkgMAMLoBAACTAwAQuwEAAJIDADC8AQEAmQIAIcABQACaAgAhwQFAAJoCACHOAQEAmQIAIc8BAQCZAgAh4QEAANYC8wEi6wEBAJkCACHwAQEAsAIAIfEBCADTAgAh9AEAANcC9AEiDbkBAACSAwAwugEAAJMDABC7AQAAkgMAMLwBAQCZAgAhwAFAAJoCACHBAUAAmgIAIc4BAQCZAgAhzwEBAJkCACHhAQAA1gLzASLrAQEAmQIAIfABAQCwAgAh8QEIANMCACH0AQAA1wL0ASIJvAEBAOICACHAAUAA4wIAIcEBQADjAgAhzgEBAOICACHhAQAAlgPzASLrAQEA4gIAIfABAQDoAgAh8QEIAJUDACH0AQAAlwP0ASIFhwIIAAAAAY4CCAAAAAGPAggAAAABkAIIAAAAAZECCAAAAAEBhwIAAADzAQIBhwIAAAD0AQILBwAAmQMAIAoAAJoDACC8AQEA4gIAIcABQADjAgAhwQFAAOMCACHOAQEA4gIAIeEBAACWA_MBIusBAQDiAgAh8AEBAOgCACHxAQgAlQMAIfQBAACXA_QBIgUdAADiBAAgHgAA6wQAIIQCAADjBAAghQIAAOoEACCKAgAAhAEAIAsdAACbAwAwHgAAoAMAMIQCAACcAwAwhQIAAJ0DADCGAgAAngMAIIcCAACfAwAwiAIAAJ8DADCJAgAAnwMAMIoCAACfAwAwiwIAAKEDADCMAgAAogMAMAUJAACoAwAgvAEBAAAAAeYBAQAAAAHuAQgAAAAB7wECAAAAAQIAAAAXACAdAACnAwAgAwAAABcAIB0AAKcDACAeAAClAwAgARYAAOkEADAKCAAA1AIAIAkAANECACC5AQAA0gIAMLoBAAAVABC7AQAA0gIAMLwBAQAAAAHmAQEAmQIAIe0BAQCZAgAh7gEIANMCACHvAQIA0AIAIQIAAAAXACAWAAClAwAgAgAAAKMDACAWAACkAwAgCLkBAACiAwAwugEAAKMDABC7AQAAogMAMLwBAQCZAgAh5gEBAJkCACHtAQEAmQIAIe4BCADTAgAh7wECANACACEIuQEAAKIDADC6AQAAowMAELsBAACiAwAwvAEBAJkCACHmAQEAmQIAIe0BAQCZAgAh7gEIANMCACHvAQIA0AIAIQS8AQEA4gIAIeYBAQDiAgAh7gEIAJUDACHvAQIAhgMAIQUJAACmAwAgvAEBAOICACHmAQEA4gIAIe4BCACVAwAh7wECAIYDACEFHQAA5AQAIB4AAOcEACCEAgAA5QQAIIUCAADmBAAgigIAAAUAIAUJAACoAwAgvAEBAAAAAeYBAQAAAAHuAQgAAAAB7wECAAAAAQMdAADkBAAghAIAAOUEACCKAgAABQAgCwcAAKoDACAKAACrAwAgvAEBAAAAAcABQAAAAAHBAUAAAAABzgEBAAAAAeEBAAAA8wEC6wEBAAAAAfABAQAAAAHxAQgAAAAB9AEAAAD0AQIDHQAA4gQAIIQCAADjBAAgigIAAIQBACAEHQAAmwMAMIQCAACcAwAwhgIAAJ4DACCKAgAAnwMAMAoMAADrAwAgDgAA6gMAILwBAQAAAAHAAUAAAAABwQFAAAAAAeIBAQAAAAHpAQEAAAAB6gEBAAAAAesBAQAAAAHsASAAAAABAgAAAIQBACAdAACsAwAgAwAAAA8AIB0AAKwDACAeAACwAwAgDAAAAA8AIAwAALIDACAOAACxAwAgFgAAsAMAILwBAQDiAgAhwAFAAOMCACHBAUAA4wIAIeIBAQDiAgAh6QEBAOICACHqAQEA6AIAIesBAQDiAgAh7AEgAPQCACEKDAAAsgMAIA4AALEDACC8AQEA4gIAIcABQADjAgAhwQFAAOMCACHiAQEA4gIAIekBAQDiAgAh6gEBAOgCACHrAQEA4gIAIewBIAD0AgAhCx0AAL4DADAeAADDAwAwhAIAAL8DADCFAgAAwAMAMIYCAADBAwAghwIAAMIDADCIAgAAwgMAMIkCAADCAwAwigIAAMIDADCLAgAAxAMAMIwCAADFAwAwCx0AALMDADAeAAC3AwAwhAIAALQDADCFAgAAtQMAMIYCAAC2AwAghwIAAI8DADCIAgAAjwMAMIkCAACPAwAwigIAAI8DADCLAgAAuAMAMIwCAACSAwAwCwMAAL0DACAKAACrAwAgvAEBAAAAAcABQAAAAAHBAUAAAAABzwEBAAAAAeEBAAAA8wEC6wEBAAAAAfABAQAAAAHxAQgAAAAB9AEAAAD0AQICAAAAEwAgHQAAvAMAIAMAAAATACAdAAC8AwAgHgAAugMAIAEWAADhBAAwAgAAABMAIBYAALoDACACAAAAkwMAIBYAALkDACAJvAEBAOICACHAAUAA4wIAIcEBQADjAgAhzwEBAOICACHhAQAAlgPzASLrAQEA4gIAIfABAQDoAgAh8QEIAJUDACH0AQAAlwP0ASILAwAAuwMAIAoAAJoDACC8AQEA4gIAIcABQADjAgAhwQFAAOMCACHPAQEA4gIAIeEBAACWA_MBIusBAQDiAgAh8AEBAOgCACHxAQgAlQMAIfQBAACXA_QBIgUdAADcBAAgHgAA3wQAIIQCAADdBAAghQIAAN4EACCKAgAAsgEAIAsDAAC9AwAgCgAAqwMAILwBAQAAAAHAAUAAAAABwQFAAAAAAc8BAQAAAAHhAQAAAPMBAusBAQAAAAHwAQEAAAAB8QEIAAAAAfQBAAAA9AECAx0AANwEACCEAgAA3QQAIIoCAACyAQAgEg0AAOgDACAPAADnAwAgEAAA6QMAILwBAQAAAAHAAUAAAAABwQFAAAAAAdoBAQAAAAHdAQEAAAAB6gEBAAAAAe4BCAAAAAH1AQEAAAAB9gEgAAAAAfcBAgAAAAH4AQAA5QMAIPkBAQAAAAH6AQAA5gMAIPsBAQAAAAH8AQEAAAABAgAAAAUAIB0AAOQDACADAAAABQAgHQAA5AMAIB4AAMoDACABFgAA2wQAMBcHAADYAgAgDQAAtwIAIA8AAN4CACAQAADZAgAguQEAAN0CADC6AQAAAwAQuwEAAN0CADC8AQEAAAABwAFAAJoCACHBAUAAmgIAIc4BAQCZAgAh2gEBAJkCACHdAQEAsAIAIeoBAQCwAgAh7gEIANMCACH1AQEAmQIAIfYBIACvAgAh9wECANACACH4AQAAywIAIPkBAQCwAgAh-gEAAMsCACD7AQEAsAIAIfwBAQCwAgAhAgAAAAUAIBYAAMoDACACAAAAxgMAIBYAAMcDACATuQEAAMUDADC6AQAAxgMAELsBAADFAwAwvAEBAJkCACHAAUAAmgIAIcEBQACaAgAhzgEBAJkCACHaAQEAmQIAId0BAQCwAgAh6gEBALACACHuAQgA0wIAIfUBAQCZAgAh9gEgAK8CACH3AQIA0AIAIfgBAADLAgAg-QEBALACACH6AQAAywIAIPsBAQCwAgAh_AEBALACACETuQEAAMUDADC6AQAAxgMAELsBAADFAwAwvAEBAJkCACHAAUAAmgIAIcEBQACaAgAhzgEBAJkCACHaAQEAmQIAId0BAQCwAgAh6gEBALACACHuAQgA0wIAIfUBAQCZAgAh9gEgAK8CACH3AQIA0AIAIfgBAADLAgAg-QEBALACACH6AQAAywIAIPsBAQCwAgAh_AEBALACACEPvAEBAOICACHAAUAA4wIAIcEBQADjAgAh2gEBAOICACHdAQEA6AIAIeoBAQDoAgAh7gEIAJUDACH1AQEA4gIAIfYBIAD0AgAh9wECAIYDACH4AQAAyAMAIPkBAQDoAgAh-gEAAMkDACD7AQEA6AIAIfwBAQDoAgAhAocCAQAAAASNAgEAAAAFAocCAQAAAASNAgEAAAAFEg0AAMwDACAPAADLAwAgEAAAzQMAILwBAQDiAgAhwAFAAOMCACHBAUAA4wIAIdoBAQDiAgAh3QEBAOgCACHqAQEA6AIAIe4BCACVAwAh9QEBAOICACH2ASAA9AIAIfcBAgCGAwAh-AEAAMgDACD5AQEA6AIAIfoBAADJAwAg-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_wMAMLoBAACABAAQuwEAAP8DADC8AQEAmQIAIb8BQACaAgAhwAFAAJoCACHBAUAAmgIAIc8BAQCZAgAh1wEBAJkCACHYAQEAsAIAIdkBAQCwAgAhC7kBAAD_AwAwugEAAIAEABC7AQAA_wMAMLwBAQCZAgAhvwFAAJoCACHAAUAAmgIAIcEBQACaAgAhzwEBAJkCACHXAQEAmQIAIdgBAQCwAgAh2QEBALACACEHvAEBAOICACG_AUAA4wIAIcABQADjAgAhwQFAAOMCACHXAQEA4gIAIdgBAQDoAgAh2QEBAOgCACEHvAEBAOICACG_AUAA4wIAIcABQADjAgAhwQFAAOMCACHXAQEA4gIAIdgBAQDoAgAh2QEBAOgCACEHvAEBAAAAAb8BQAAAAAHAAUAAAAABwQFAAAAAAdcBAQAAAAHYAQEAAAAB2QEBAAAAAQQdAAD4AwAwhAIAAPkDADCGAgAA-wMAIIoCAAD8AwAwBB0AAOwDADCEAgAA7QMAMIYCAADvAwAgigIAAPADADADHQAArAMAIIQCAACtAwAgigIAAIQBACAEHQAAiwMAMIQCAACMAwAwhgIAAI4DACCKAgAAjwMAMAQdAAD8AgAwhAIAAP0CADCGAgAA_wIAIIoCAACAAwAwAAAEAwAAmAQAIAwAAIwEACAOAACZBAAg6gEAAOQCACAAAAAAAAAAAAAABR0AAMMEACAeAADGBAAghAIAAMQEACCFAgAAxQQAIIoCAACyAQAgAx0AAMMEACCEAgAAxAQAIIoCAACyAQAgBwQAAIkEACAFAACKBAAgBgAAiwQAIAwAAIwEACANAACNBAAg3QEAAOQCACDiAQAA5AIAIAAAAAAAAAAAAAAAAAAAAAAFHQAAvgQAIB4AAMEEACCEAgAAvwQAIIUCAADABAAgigIAAIQBACADHQAAvgQAIIQCAAC_BAAgigIAAIQBACAAAAALHQAArwQAMB4AALMEADCEAgAAsAQAMIUCAACxBAAwhgIAALIEACCHAgAAwgMAMIgCAADCAwAwiQIAAMIDADCKAgAAwgMAMIsCAAC0BAAwjAIAAMUDADASBwAAqgQAIA0AAOgDACAQAADpAwAgvAEBAAAAAcABQAAAAAHBAUAAAAABzgEBAAAAAdoBAQAAAAHdAQEAAAAB6gEBAAAAAe4BCAAAAAH2ASAAAAAB9wECAAAAAfgBAADlAwAg-QEBAAAAAfoBAADmAwAg-wEBAAAAAfwBAQAAAAECAAAABQAgHQAAtwQAIAMAAAAFACAdAAC3BAAgHgAAtgQAIAEWAAC9BAAwAgAAAAUAIBYAALYEACACAAAAxgMAIBYAALUEACAPvAEBAOICACHAAUAA4wIAIcEBQADjAgAhzgEBAOICACHaAQEA4gIAId0BAQDoAgAh6gEBAOgCACHuAQgAlQMAIfYBIAD0AgAh9wECAIYDACH4AQAAyAMAIPkBAQDoAgAh-gEAAMkDACD7AQEA6AIAIfwBAQDoAgAhEgcAAKkEACANAADMAwAgEAAAzQMAILwBAQDiAgAhwAFAAOMCACHBAUAA4wIAIc4BAQDiAgAh2gEBAOICACHdAQEA6AIAIeoBAQDoAgAh7gEIAJUDACH2ASAA9AIAIfcBAgCGAwAh-AEAAMgDACD5AQEA6AIAIfoBAADJAwAg-wEBAOgCACH8AQEA6AIAIRIHAACqBAAgDQAA6AMAIBAAAOkDACC8AQEAAAABwAFAAAAAAcEBQAAAAAHOAQEAAAAB2gEBAAAAAd0BAQAAAAHqAQEAAAAB7gEIAAAAAfYBIAAAAAH3AQIAAAAB-AEAAOUDACD5AQEAAAAB-gEAAOYDACD7AQEAAAAB_AEBAAAAAQQdAACvBAAwhAIAALAEADCGAgAAsgQAIIoCAADCAwAwCQcAAIsEACANAACNBAAgDwAAvAQAIBAAALsEACDdAQAA5AIAIOoBAADkAgAg-QEAAOQCACD7AQAA5AIAIPwBAADkAgAgBAMAAJgEACAHAACLBAAgCgAAuwQAIPABAADkAgAgAAEOAACZBAAgD7wBAQAAAAHAAUAAAAABwQFAAAAAAc4BAQAAAAHaAQEAAAAB3QEBAAAAAeoBAQAAAAHuAQgAAAAB9gEgAAAAAfcBAgAAAAH4AQAA5QMAIPkBAQAAAAH6AQAA5gMAIPsBAQAAAAH8AQEAAAABCwMAAJcEACAMAADrAwAgvAEBAAAAAcABQAAAAAHBAUAAAAABzwEBAAAAAeIBAQAAAAHpAQEAAAAB6gEBAAAAAesBAQAAAAHsASAAAAABAgAAAIQBACAdAAC-BAAgAwAAAA8AIB0AAL4EACAeAADCBAAgDQAAAA8AIAMAAJYEACAMAACyAwAgFgAAwgQAILwBAQDiAgAhwAFAAOMCACHBAUAA4wIAIc8BAQDiAgAh4gEBAOICACHpAQEA4gIAIeoBAQDoAgAh6wEBAOICACHsASAA9AIAIQsDAACWBAAgDAAAsgMAILwBAQDiAgAhwAFAAOMCACHBAUAA4wIAIc8BAQDiAgAh4gEBAOICACHpAQEA4gIAIeoBAQDoAgAh6wEBAOICACHsASAA9AIAIQ4EAACEBAAgBQAAhQQAIAwAAIcEACANAACIBAAgvAEBAAAAAcABQAAAAAHBAUAAAAAB2gEBAAAAAdsBAQAAAAHcASAAAAAB3QEBAAAAAd8BAAAA3wEC4QEAAADhAQLiAQEAAAABAgAAALIBACAdAADDBAAgAwAAALUBACAdAADDBAAgHgAAxwQAIBAAAAC1AQAgBAAA9wIAIAUAAPgCACAMAAD6AgAgDQAA-wIAIBYAAMcEACC8AQEA4gIAIcABQADjAgAhwQFAAOMCACHaAQEA4gIAIdsBAQDiAgAh3AEgAPQCACHdAQEA6AIAId8BAAD1At8BIuEBAAD2AuEBIuIBAQDoAgAhDgQAAPcCACAFAAD4AgAgDAAA-gIAIA0AAPsCACC8AQEA4gIAIcABQADjAgAhwQFAAOMCACHaAQEA4gIAIdsBAQDiAgAh3AEgAPQCACHdAQEA6AIAId8BAAD1At8BIuEBAAD2AuEBIuIBAQDoAgAhB7wBAQAAAAG_AUAAAAABwAFAAAAAAcEBQAAAAAHXAQEAAAAB2AEBAAAAAdkBAQAAAAEMvAEBAAAAAcABQAAAAAHBAUAAAAABzQEBAAAAAc4BAQAAAAHQAQEAAAAB0QEBAAAAAdIBAQAAAAHTAUAAAAAB1AFAAAAAAdUBAQAAAAHWAQEAAAABBbwBAQAAAAHAAUAAAAABwQFAAAAAAdoBAQAAAAGAAgEAAAABAgAAAAEAIB0AAMoEACAOBAAAhAQAIAUAAIUEACAGAACGBAAgDAAAhwQAILwBAQAAAAHAAUAAAAABwQFAAAAAAdoBAQAAAAHbAQEAAAAB3AEgAAAAAd0BAQAAAAHfAQAAAN8BAuEBAAAA4QEC4gEBAAAAAQIAAACyAQAgHQAAzAQAIAMAAAC1AQAgHQAAzAQAIB4AANAEACAQAAAAtQEAIAQAAPcCACAFAAD4AgAgBgAA-QIAIAwAAPoCACAWAADQBAAgvAEBAOICACHAAUAA4wIAIcEBQADjAgAh2gEBAOICACHbAQEA4gIAIdwBIAD0AgAh3QEBAOgCACHfAQAA9QLfASLhAQAA9gLhASLiAQEA6AIAIQ4EAAD3AgAgBQAA-AIAIAYAAPkCACAMAAD6AgAgvAEBAOICACHAAUAA4wIAIcEBQADjAgAh2gEBAOICACHbAQEA4gIAIdwBIAD0AgAh3QEBAOgCACHfAQAA9QLfASLhAQAA9gLhASLiAQEA6AIAIQa8AQEAAAABwAFAAAAAAcEBQAAAAAHPAQEAAAAB5wECAAAAAegBAQAAAAEMAwAAvQMAIAcAAKoDACC8AQEAAAABwAFAAAAAAcEBQAAAAAHOAQEAAAABzwEBAAAAAeEBAAAA8wEC6wEBAAAAAfABAQAAAAHxAQgAAAAB9AEAAAD0AQICAAAAEwAgHQAA0gQAIAMAAAARACAdAADSBAAgHgAA1gQAIA4AAAARACADAAC7AwAgBwAAmQMAIBYAANYEACC8AQEA4gIAIcABQADjAgAhwQFAAOMCACHOAQEA4gIAIc8BAQDiAgAh4QEAAJYD8wEi6wEBAOICACHwAQEA6AIAIfEBCACVAwAh9AEAAJcD9AEiDAMAALsDACAHAACZAwAgvAEBAOICACHAAUAA4wIAIcEBQADjAgAhzgEBAOICACHPAQEA4gIAIeEBAACWA_MBIusBAQDiAgAh8AEBAOgCACHxAQgAlQMAIfQBAACXA_QBIgS8AQEAAAAB7QEBAAAAAe4BCAAAAAHvAQIAAAABAwAAACwAIB0AAMoEACAeAADaBAAgBwAAACwAIBYAANoEACC8AQEA4gIAIcABQADjAgAhwQFAAOMCACHaAQEA4gIAIYACAQDiAgAhBbwBAQDiAgAhwAFAAOMCACHBAUAA4wIAIdoBAQDiAgAhgAIBAOICACEPvAEBAAAAAcABQAAAAAHBAUAAAAAB2gEBAAAAAd0BAQAAAAHqAQEAAAAB7gEIAAAAAfUBAQAAAAH2ASAAAAAB9wECAAAAAfgBAADlAwAg-QEBAAAAAfoBAADmAwAg-wEBAAAAAfwBAQAAAAEOBAAAhAQAIAUAAIUEACAGAACGBAAgDQAAiAQAILwBAQAAAAHAAUAAAAABwQFAAAAAAdoBAQAAAAHbAQEAAAAB3AEgAAAAAd0BAQAAAAHfAQAAAN8BAuEBAAAA4QEC4gEBAAAAAQIAAACyAQAgHQAA3AQAIAMAAAC1AQAgHQAA3AQAIB4AAOAEACAQAAAAtQEAIAQAAPcCACAFAAD4AgAgBgAA-QIAIA0AAPsCACAWAADgBAAgvAEBAOICACHAAUAA4wIAIcEBQADjAgAh2gEBAOICACHbAQEA4gIAIdwBIAD0AgAh3QEBAOgCACHfAQAA9QLfASLhAQAA9gLhASLiAQEA6AIAIQ4EAAD3AgAgBQAA-AIAIAYAAPkCACANAAD7AgAgvAEBAOICACHAAUAA4wIAIcEBQADjAgAh2gEBAOICACHbAQEA4gIAIdwBIAD0AgAh3QEBAOgCACHfAQAA9QLfASLhAQAA9gLhASLiAQEA6AIAIQm8AQEAAAABwAFAAAAAAcEBQAAAAAHPAQEAAAAB4QEAAADzAQLrAQEAAAAB8AEBAAAAAfEBCAAAAAH0AQAAAPQBAgsDAACXBAAgDgAA6gMAILwBAQAAAAHAAUAAAAABwQFAAAAAAc8BAQAAAAHiAQEAAAAB6QEBAAAAAeoBAQAAAAHrAQEAAAAB7AEgAAAAAQIAAACEAQAgHQAA4gQAIBMHAACqBAAgDQAA6AMAIA8AAOcDACC8AQEAAAABwAFAAAAAAcEBQAAAAAHOAQEAAAAB2gEBAAAAAd0BAQAAAAHqAQEAAAAB7gEIAAAAAfUBAQAAAAH2ASAAAAAB9wECAAAAAfgBAADlAwAg-QEBAAAAAfoBAADmAwAg-wEBAAAAAfwBAQAAAAECAAAABQAgHQAA5AQAIAMAAAADACAdAADkBAAgHgAA6AQAIBUAAAADACAHAACpBAAgDQAAzAMAIA8AAMsDACAWAADoBAAgvAEBAOICACHAAUAA4wIAIcEBQADjAgAhzgEBAOICACHaAQEA4gIAId0BAQDoAgAh6gEBAOgCACHuAQgAlQMAIfUBAQDiAgAh9gEgAPQCACH3AQIAhgMAIfgBAADIAwAg-QEBAOgCACH6AQAAyQMAIPsBAQDoAgAh_AEBAOgCACETBwAAqQQAIA0AAMwDACAPAADLAwAgvAEBAOICACHAAUAA4wIAIcEBQADjAgAhzgEBAOICACHaAQEA4gIAId0BAQDoAgAh6gEBAOgCACHuAQgAlQMAIfUBAQDiAgAh9gEgAPQCACH3AQIAhgMAIfgBAADIAwAg-QEBAOgCACH6AQAAyQMAIPsBAQDoAgAh_AEBAOgCACEEvAEBAAAAAeYBAQAAAAHuAQgAAAAB7wECAAAAAQMAAAAPACAdAADiBAAgHgAA7AQAIA0AAAAPACADAACWBAAgDgAAsQMAIBYAAOwEACC8AQEA4gIAIcABQADjAgAhwQFAAOMCACHPAQEA4gIAIeIBAQDiAgAh6QEBAOICACHqAQEA6AIAIesBAQDiAgAh7AEgAPQCACELAwAAlgQAIA4AALEDACC8AQEA4gIAIcABQADjAgAhwQFAAOMCACHPAQEA4gIAIeIBAQDiAgAh6QEBAOICACHqAQEA6AIAIesBAQDiAgAh7AEgAPQCACEJvAEBAAAAAcABQAAAAAHBAUAAAAABzgEBAAAAAeEBAAAA8wEC6wEBAAAAAfABAQAAAAHxAQgAAAAB9AEAAAD0AQITBwAAqgQAIA8AAOcDACAQAADpAwAgvAEBAAAAAcABQAAAAAHBAUAAAAABzgEBAAAAAdoBAQAAAAHdAQEAAAAB6gEBAAAAAe4BCAAAAAH1AQEAAAAB9gEgAAAAAfcBAgAAAAH4AQAA5QMAIPkBAQAAAAH6AQAA5gMAIPsBAQAAAAH8AQEAAAABAgAAAAUAIB0AAO4EACADAAAAAwAgHQAA7gQAIB4AAPIEACAVAAAAAwAgBwAAqQQAIA8AAMsDACAQAADNAwAgFgAA8gQAILwBAQDiAgAhwAFAAOMCACHBAUAA4wIAIc4BAQDiAgAh2gEBAOICACHdAQEA6AIAIeoBAQDoAgAh7gEIAJUDACH1AQEA4gIAIfYBIAD0AgAh9wECAIYDACH4AQAAyAMAIPkBAQDoAgAh-gEAAMkDACD7AQEA6AIAIfwBAQDoAgAhEwcAAKkEACAPAADLAwAgEAAAzQMAILwBAQDiAgAhwAFAAOMCACHBAUAA4wIAIc4BAQDiAgAh2gEBAOICACHdAQEA6AIAIeoBAQDoAgAh7gEIAJUDACH1AQEA4gIAIfYBIAD0AgAh9wECAIYDACH4AQAAyAMAIPkBAQDoAgAh-gEAAMkDACD7AQEA6AIAIfwBAQDoAgAhBrwBAQAAAAHAAUAAAAABwQFAAAAAAeYBAQAAAAHnAQIAAAAB6AEBAAAAAQ4FAACFBAAgBgAAhgQAIAwAAIcEACANAACIBAAgvAEBAAAAAcABQAAAAAHBAUAAAAAB2gEBAAAAAdsBAQAAAAHcASAAAAAB3QEBAAAAAd8BAAAA3wEC4QEAAADhAQLiAQEAAAABAgAAALIBACAdAAD0BAAgAwAAALUBACAdAAD0BAAgHgAA-AQAIBAAAAC1AQAgBQAA-AIAIAYAAPkCACAMAAD6AgAgDQAA-wIAIBYAAPgEACC8AQEA4gIAIcABQADjAgAhwQFAAOMCACHaAQEA4gIAIdsBAQDiAgAh3AEgAPQCACHdAQEA6AIAId8BAAD1At8BIuEBAAD2AuEBIuIBAQDoAgAhDgUAAPgCACAGAAD5AgAgDAAA-gIAIA0AAPsCACC8AQEA4gIAIcABQADjAgAhwQFAAOMCACHaAQEA4gIAIdsBAQDiAgAh3AEgAPQCACHdAQEA6AIAId8BAAD1At8BIuEBAAD2AuEBIuIBAQDoAgAhDgQAAIQEACAGAACGBAAgDAAAhwQAIA0AAIgEACC8AQEAAAABwAFAAAAAAcEBQAAAAAHaAQEAAAAB2wEBAAAAAdwBIAAAAAHdAQEAAAAB3wEAAADfAQLhAQAAAOEBAuIBAQAAAAECAAAAsgEAIB0AAPkEACADAAAAtQEAIB0AAPkEACAeAAD9BAAgEAAAALUBACAEAAD3AgAgBgAA-QIAIAwAAPoCACANAAD7AgAgFgAA_QQAILwBAQDiAgAhwAFAAOMCACHBAUAA4wIAIdoBAQDiAgAh2wEBAOICACHcASAA9AIAId0BAQDoAgAh3wEAAPUC3wEi4QEAAPYC4QEi4gEBAOgCACEOBAAA9wIAIAYAAPkCACAMAAD6AgAgDQAA-wIAILwBAQDiAgAhwAFAAOMCACHBAUAA4wIAIdoBAQDiAgAh2wEBAOICACHcASAA9AIAId0BAQDoAgAh3wEAAPUC3wEi4QEAAPYC4QEi4gEBAOgCACECCwAODgYCBQcAAwsADQ0mCg8AARAnCAQDAAQLAAwMIwcOIgIGBAoFBQ4GBhADCwALDBQHDR0KAQMABAEDAAQEAwAEBwADChgICwAJAggABwkAAgEKGQACAwAECQACBAQeAAUfAAwgAA0hAAIMJQAOJAACDSgAECkAAQ4qAAAAAAMLABMjABQkABUAAAADCwATIwAUJAAVAgcAAw8AAQIHAAMPAAEFCwAaIwAdJAAeNQAbNgAcAAAAAAAFCwAaIwAdJAAeNQAbNgAcAgMABAcAAwIDAAQHAAMFCwAjIwAmJAAnNQAkNgAlAAAAAAAFCwAjIwAmJAAnNQAkNgAlAggABwkAAgIIAAcJAAIFCwAsIwAvJAAwNQAtNgAuAAAAAAAFCwAsIwAvJAAwNQAtNgAuAQMABAEDAAQDCwA1IwA2JAA3AAAAAwsANSMANiQANwIDAAQJAAICAwAECQACBQsAPCMAPyQAQDUAPTYAPgAAAAAABQsAPCMAPyQAQDUAPTYAPgAAAwsARSMARiQARwAAAAMLAEUjAEYkAEcBAwAEAQMABAMLAEwjAE0kAE4AAAADCwBMIwBNJABOAQMABAEDAAQDCwBTIwBUJABVAAAAAwsAUyMAVCQAVQAAAAMLAFsjAFwkAF0AAAADCwBbIwBcJABdEQIBEisBEy4BFC8BFTABFzIBGDQPGTUQGjcBGzkPHDoRHzsBIDwBIT0PJUASJkEWJ0ICKEMCKUQCKkUCK0YCLEgCLUoPLksXL00CME8PMVAYMlECM1ICNFMPN1YZOFcfOVgHOlkHO1oHPFsHPVwHPl4HP2APQGEgQWMHQmUPQ2YhRGcHRWgHRmkPR2wiSG0oSW4ISm8IS3AITHEITXIITnQIT3YPUHcpUXkIUnsPU3wqVH0IVX4IVn8PV4IBK1iDATFZhQEDWoYBA1uIAQNciQEDXYoBA16MAQNfjgEPYI8BMmGRAQNikwEPY5QBM2SVAQNllgEDZpcBD2eaATRomwE4aZwBCmqdAQprngEKbJ8BCm2gAQpuogEKb6QBD3ClATlxpwEKcqkBD3OqATp0qwEKdawBCnatAQ93sAE7eLEBQXmzAQR6tAEEe7cBBHy4AQR9uQEEfrsBBH-9AQ-AAb4BQoEBwAEEggHCAQ-DAcMBQ4QBxAEEhQHFAQSGAcYBD4cByQFEiAHKAUiJAcsBBYoBzAEFiwHNAQWMAc4BBY0BzwEFjgHRAQWPAdMBD5AB1AFJkQHWAQWSAdgBD5MB2QFKlAHaAQWVAdsBBZYB3AEPlwHfAUuYAeABT5kB4QEGmgHiAQabAeMBBpwB5AEGnQHlAQaeAecBBp8B6QEPoAHqAVChAewBBqIB7gEPowHvAVGkAfABBqUB8QEGpgHyAQ-nAfUBUqgB9gFWqQH4AVeqAfkBV6sB_AFXrAH9AVetAf4BV64BgAJXrwGCAg-wAYMCWLEBhQJXsgGHAg-zAYgCWbQBiQJXtQGKAle2AYsCD7cBjgJauAGPAl4"
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
  CUSTOMER: "CUSTOMER"
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
var prisma = new PrismaClient({ adapter });

// src/app/lib/auth.ts
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  // Use true for port 465, false for port 587
  auth: {
    user: envVars.APP_USER,
    pass: envVars.APP_PASS
  }
});
var auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  trustedOrigins: [envVars.FRONTEND_URL],
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
        required: true,
        defaultValue: Role.CUSTOMER
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE
      },
      phone: {
        type: "string",
        required: false
      }
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url, token }) => {
      try {
        const verificationURL = `${envVars.FRONTEND_URL}/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: "FOODIE",
          to: user.email,
          subject: "Verify your email",
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8FAF3; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(6, 78, 59, 0.05); border: 1px solid #E2E8F0; }
    .header { background-color: #064E3B; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; color: #ffffff; letter-spacing: -1px; }
    .header span { color: #10B981; font-style: italic; }
    .content { padding: 40px; color: #064E3B; line-height: 1.6; }
    .content h2 { margin-top: 0; font-size: 24px; color: #064E3B; }
    .button-wrapper { text-align: center; margin: 35px 0; }
    .verify-button { background-color: #059669; color: #ffffff !important; padding: 16px 32px; text-decoration: none; font-weight: bold; border-radius: 12px; display: inline-block; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3); }
    .footer { background-color: #F1F5F9; padding: 25px; text-align: center; font-size: 12px; color: #64748B; }
    .link-text { word-break: break-all; font-size: 12px; color: #059669; background: #F0FDF4; padding: 10px; border-radius: 8px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>FOODIE</h1>
    </div>

    <div class="content">
      <h2>Welcome to the table, ${user.name || "Foodie"}!</h2>
      <p>
        We're thrilled to have you join our community of premium culinary enthusiasts. 
        To start exploring our organic meals and artisan chefs, please verify your email address.
      </p>

      <div class="button-wrapper">
        <a href="${verificationURL}" class="verify-button">
          Verify My Account
        </a>
      </div>

      <p style="font-size: 14px; color: #475569;">
        If the button above doesn't work, copy and paste this link into your browser:
      </p>

      <div class="link-text">
        ${verificationURL}
      </div>

      <p style="margin-top: 30px; font-size: 14px;">
        Stay fresh,<br />
        <strong>The FOODIE Team</strong>
      </p>
    </div>

    <div class="footer">
      \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} FOODIE Crafted for gourmet lovers.<br/>
      123 Gourmet Ave, Culinary District, NY
    </div>
  </div>
</body>
</html>
`
        });
      } catch (error) {
      }
    }
  }
});

// src/app/routes/index.ts
import express2 from "express";

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
  const data = await prisma.category.create({
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
  const result = await prisma.category.findMany({
    include: {
      _count: {
        select: { meals: true }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return result;
};
var getCategoryById = async (id) => {
  const result = await prisma.category.findUnique({
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
  const category = await prisma.category.findUnique({
    where: { id }
  });
  if (!category) {
    throw new AppError_default(status4.NOT_FOUND, "Category not found");
  }
  const data = await prisma.category.update({
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
  const categoryIsExists = await prisma.category.findUnique({
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
  await prisma.category.delete({
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
  const meal = await prisma.$transaction(async (tx) => {
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
  const meal = await prisma.meal.findMany({
    take: Number(payload.limit),
    skip: Number(payload.skip),
    where: buildMealQueryCondition(payload),
    ...payload.sortBy && { orderBy: { [payload.sortBy]: payload.sortOrder } }
  });
  const total = await prisma.meal.count({
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
  const result = await prisma.meal.findUnique({
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
  const provider = await prisma.providerProfile.findUnique({
    where: {
      userId
    }
  });
  if (!provider) {
    throw new AppError_default(status7.NOT_FOUND, "Provider not found");
  }
  const result = await prisma.meal.findMany({
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
  const provider = await prisma.providerProfile.findUnique({
    where: {
      userId
    }
  });
  if (!provider) {
    throw new AppError_default(status7.NOT_FOUND, "Provider not found");
  }
  const isExistMeal = await prisma.meal.findUnique({
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
  const result = await prisma.meal.update({
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
  const provider = await prisma.providerProfile.findUnique({
    where: {
      userId
    }
  });
  if (!provider) {
    throw new AppError_default(status7.NOT_FOUND, "Provider not found");
  }
  const isExistMeal = await prisma.meal.findUnique({
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
  const runningOrder = await prisma.order.findFirst({
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
  const result = await prisma.meal.delete({
    where: {
      id: mealId
    }
  });
  return result;
};
var getProviderOrdersFromDB = async (userId) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId }
  });
  if (!provider) {
    throw new AppError_default(status7.NOT_FOUND, "Provider profile not found");
  }
  const orders = await prisma.order.findMany({
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
  const meals = await prisma.meal.findMany({
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
  const result = await prisma.meal.findMany({
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
  const result = await prisma.meal.findMany({
    distinct: ["cuisine"],
    select: {
      cuisine: true
    }
  });
  return result.map((meal) => meal.cuisine).filter((cusine) => cusine !== null);
};
var updateOrderStatusIntoDB = async (userId, orderId, orderStatus) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId }
  });
  if (!provider) {
    throw new AppError_default(status7.NOT_FOUND, "Provider profile not found");
  }
  const isExistOrder = await prisma.meal.findUnique({
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
  const result = await prisma.order.update({
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
  const mealTypes = await prisma.meal.findMany({
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
  const provider = await prisma.providerProfile.findUnique({
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
  const meals = await prisma.meal.findMany({
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
  const result = await prisma.order.create({
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
  const orders = prisma.order.findMany({
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
  const order = prisma.order.findFirst({
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
  const order = prisma.order.findFirst({
    where: {
      id: orderId,
      providerId
    }
  });
  if (!order) {
    throw new AppError_default(status9.NOT_FOUND, "Order not found");
  }
  const updatedOrder = prisma.order.update({
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
  const order = prisma.order.findFirst({
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
  const order = prisma.order.findFirst({
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
  const updatedOrder = prisma.order.update({
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
  const orders = prisma.order.findMany({
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
  const result = await prisma.$transaction(async (tx) => {
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
  const result = await prisma.providerProfile.findMany({
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
  const provider = await prisma.providerProfile.findUnique({
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
  const result = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
  return result;
};
var updateUserStatusIntoDB = async (id, newStatus) => {
  const isExistUser = await prisma.user.findUnique({
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
  const result = await prisma.user.update({
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
  const isExistUser = await prisma.user.findUnique({
    where: {
      id
    }
  });
  if (!isExistUser) {
    throw new AppError_default(status13.NOT_FOUND, "User not found");
  }
  const result = await prisma.user.update({
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
  const meal = await prisma.meal.findUnique({
    where: {
      id: mealId
    }
  });
  if (!meal) {
    throw new AppError_default(status15.NOT_FOUND, "Meal not found");
  }
  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      mealId
    }
  });
  if (existingReview) {
    throw new AppError_default(status15.BAD_REQUEST, "You have already reviewed this meal");
  }
  const hasOrder = await prisma.order.findFirst({
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
  const review = await prisma.review.create({
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
  const result = await prisma.review.findMany({
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
  const result = await prisma.review.findMany({
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
  const providerMeals = await prisma.meal.findMany({
    where: {
      providerId
    },
    select: {
      id: true
    }
  });
  const mealIds = providerMeals.map((meal) => meal.id);
  const reviews = await prisma.review.findMany({
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
  const isExistReview = await prisma.review.findUnique({
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
  const result = await prisma.review.update({
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
  const isExistReview = await prisma.review.findUnique({
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
  await prisma.review.delete({
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
    const provider = await prisma.providerProfile.findUnique({
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

// src/app/routes/index.ts
var router7 = express2.Router();
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
  }
];
moduleRoutes.forEach((route) => router7.use(route.path, route.routes));
var routes_default = router7;

// src/app.ts
var app = express3();
app.set("trust proxy", 1);
app.use(express3.json({ limit: "16kb" }));
app.use(express3.urlencoded({ extended: true, limit: "16kb" }));
app.use(
  cors({
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
