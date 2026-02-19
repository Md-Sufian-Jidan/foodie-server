//  id          String          @id @default(uuid())
//     name        String
//     description String?
//     price       Float
//     image       String?
//     categoryId  String
//     category    Category        @relation(fields: [categoryId], references: [id])
//     providerId  String
//     provider    ProviderProfile @relation(fields: [providerId], references: [id], onDelete: Cascade)
//     createdAt   DateTime        @default(now())
//     updatedAt   DateTime        @updatedAt
//     reviews     Review[]

export interface IMealData {
    name: string;
    description: string;
    price: number;
    image: string;
    categoryId: string;
    providerId: string;
    createdAt: Date;
    updatedAt: Date;
}