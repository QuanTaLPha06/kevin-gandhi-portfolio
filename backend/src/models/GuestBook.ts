import mongoose from 'mongoose';

export interface IGuestBook {
    message: string;
    userName: string;
    userEmail: string;
    userImage?: string;
    provider: 'github' | 'google';
    providerId: string;
    active: boolean;
    // Soft delete fields
    isDeleted: boolean;
    deletedAt?: Date;
    deletedBy?: string; // 'user' or 'admin'
    deletedByName?: string;
    deletedByEmail?: string;
    // Approval tracking
    approvedAt?: Date;
    approvedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

const guestBookSchema = new mongoose.Schema<IGuestBook>(
    {
        message: {
            type: String,
            required: [true, 'Message is required'],
            maxlength: [500, 'Message cannot exceed 500 characters'],
            trim: true,
        },
        userName: {
            type: String,
            required: [true, 'User name is required'],
            trim: true,
        },
        userEmail: {
            type: String,
            required: [true, 'User email is required'],
            trim: true,
            lowercase: true,
        },
        userImage: {
            type: String,
            default: '',
        },
        provider: {
            type: String,
            enum: ['github', 'google'],
            required: true,
        },
        providerId: {
            type: String,
            required: true,
        },
        active: {
            type: Boolean,
            default: false,
        },
        // Soft delete fields
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
        },
        deletedBy: {
            type: String,
            enum: ['user', 'admin'],
        },
        deletedByName: {
            type: String,
        },
        deletedByEmail: {
            type: String,
        },
        // Approval tracking
        approvedAt: {
            type: Date,
        },
        approvedBy: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
guestBookSchema.index({ active: 1, isDeleted: 1, createdAt: -1 });
guestBookSchema.index({ providerId: 1, provider: 1 });
guestBookSchema.index({ isDeleted: 1, deletedAt: -1 });

const GuestBook = mongoose.models.GuestBook || mongoose.model<IGuestBook>('GuestBook', guestBookSchema);

export default GuestBook;
