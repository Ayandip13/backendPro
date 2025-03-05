import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; //this allows us to right the aggregation queries


const videoSchema = new Schema({
    videoFile:{
        type:String, //cloudinary url
        required:true
    },
    thambnail:{
        type:String, //cloudinary url
        required: true
    },
    title:{
        type:String, 
        required: true
    },
    description:{
        type: String,
        required:true
    },
    duration:{
        type:Number, //cloudinary 
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },

},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate) //this is how we can right the aggregation queries

export const Video = mongoose.model('Video', videoSchema)