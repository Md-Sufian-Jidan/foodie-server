export interface CreateReviewData {
    userId: string;
    mealId: string;
    rating: number;
    comment?: string;
};

export interface UpdateReviewData {
    rating?: number;
    comment?: string;
};