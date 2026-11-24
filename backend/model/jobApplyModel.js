
const mongoose = require("mongoose");

const jobApplySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },

        resume: {
            type: String,
            required: true,
        },

        coverLetter: {
            type: String,
            trim: true,
            maxlength: 2000,
        },

        status: {
            type: String,
            enum: ["pending", "shortlisted", "rejected", "accepted"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate applications
jobApplySchema.index(
    { userId: 1, jobId: 1 },
    { unique: true }
);

const JobApply = mongoose.model("JobApply", jobApplySchema);

module.exports = JobApply;
