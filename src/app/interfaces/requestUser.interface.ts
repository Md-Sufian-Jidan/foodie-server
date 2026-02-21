interface IRequestUser {
    userId: string;
    name: string;
    email: string;
    role: string;
    phone: string
    status: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export default IRequestUser;