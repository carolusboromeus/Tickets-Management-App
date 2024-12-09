import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

const masterDataSchema = new mongoose.Schema({
    client: {
        type: String,
        unique: true,
        required: true,
    },
    appModule: [{
        _id: {
            type: ObjectId,
            required: false,
        },
        name: {
           type: String,
           required: false,
        },
    }]
});

const MasterData = mongoose.models.masterData || mongoose.model('masterData', masterDataSchema);

export default MasterData;