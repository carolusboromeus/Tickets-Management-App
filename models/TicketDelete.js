import mongoose from 'mongoose';
import Users from '@/models/Users'

const { Schema } = mongoose;

const ticketsSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        unique: true,
        required: true,
    },
    week: {
        type: Number,
        required: true,
    },
    client: {
        type: String,
        required: true,
    },
    createdDate: {
        type: String,
        required: true
    },
    requesterName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    appModule: {
        type: String,
        required: true,
    },
    resolution: {
        type: String,
        required: false,
    },
    resolvedDate: {
        type: String,
        required: false,
    },
    resolvedBy: {
        type: String,
        required: false,
    },
    requestType: {
        type: String,
        required: false,
    },
    modeTicket: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    lastUpdateBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    }
},{timestamps: true});

const TicketDelete = mongoose.models.ticketDeleted || mongoose.model('ticketDeleted', ticketsSchema);

export default TicketDelete;