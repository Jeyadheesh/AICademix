import mongoose from "mongoose";


const assessmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    mcq: [
        {
        question: String,
        options: [String],
        answer: String,
        },
    ],
    fillInBlanks: [
        {
        question: String,
        answer: String,
        },
    ],
    shortAnswer: [
        {
        question: String,
        answer: String,
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    });

    // Update the "updatedAt" field on save
    assessmentSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
    });

const Assessment =
  mongoose.models.assessments || 
  mongoose.model("assessments", assessmentSchema, "assessments"); 

    export default Assessment;