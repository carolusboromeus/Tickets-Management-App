import mongoose from 'mongoose';

const usersSchema = new mongoose.Schema({
    name: {
        fullName: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: false,
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    client: {
        type: String
    },
    status: {
        type: String,
        required: true,
    }
}, { timestamps: true });

usersSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password; // Remove password from the output
        return ret;
    },
});

const Users = mongoose.models.users || mongoose.model('users', usersSchema);

export default Users;