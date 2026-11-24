const mongoose = require("mongoose");
const Job = require("../model/jobModel");
const Company = require("../model/companyModel");
const JobApply = require("../model/jobApplyModel");

// Validate MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// CREATE JOB
const createJob = async (req, res) => {
  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const company = await Company.findOne({
      user: req.user._id || req.user.id,
    }).session(session);

    if (!company) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    // Prevent user from overriding protected fields
    const { company: ignoredCompany, _id, ...jobData } = req.body;

    const newJob = new Job({
      ...jobData,
      company: company._id,
    });

    await newJob.save({ session });

    const updatedCompany = await Company.findByIdAndUpdate(
      company._id,
      { $inc: { totalJobs: 1 } },
      { new: true, session },
    );

    if (!updatedCompany) {
      throw new Error("Company update failed");
    }

    await session.commitTransaction();

    const job = await Job.findById(newJob._id).populate(
      "company",
      "companyName industry website",
    );

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// GET ALL JOBS
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.aggregate([
      {
        $lookup: {
          from: "jobapplies",
          localField: "_id",
          foreignField: "jobId",
          as: "applications",
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "companyDetails",
        },
      },
      {
        $unwind: {
          path: "$companyDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          totalApplicants: {
            $size: "$applications",
          },
        },
      },
      {
        $project: {
          applications: 0,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      totalJobs: jobs.length,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET COMPANY JOBS
const getCompanyJobs = async (req, res) => {
  try {
    const company = await Company.findOne({
      user: req.user._id || req.user.id,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    const jobs = await Job.find({
      company: company._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Company jobs fetched successfully",
      totalJobs: jobs.length,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE JOB
const getOneJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(id).populate(
      "company",
      "companyName industry website",
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job fetched successfully",
      job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE JOB
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const company = await Company.findOne({
      user: req.user._id || req.user.id,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    // Prevent changing job ownership or MongoDB ID
    const { company: ignoredCompany, _id, ...jobData } = req.body;

    const job = await Job.findOneAndUpdate(
      {
        _id: id,
        company: company._id,
      },
      {
        $set: jobData,
      },
      {
        new: true,
        runValidators: true,
      },
    ).populate("company", "companyName industry website");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE JOB
const deleteJob = async (req, res) => {
  let session;

  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const company = await Company.findOne({
      user: req.user._id || req.user.id,
    }).session(session);

    if (!company) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    const job = await Job.findOne({
      _id: id,
      company: company._id,
    }).session(session);

    if (!job) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Job not found or unauthorized",
      });
    }

    await Job.deleteOne({ _id: job._id }, { session });

    await JobApply.deleteMany({ jobId: job._id }, { session });

    // Prevent totalJobs from becoming negative
    await Company.findByIdAndUpdate(
      company._id,
      {
        $set: {
          totalJobs: Math.max(0, (company.totalJobs || 0) - 1),
        },
      },
      { session },
    );

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Job and related applications deleted successfully",
      job,
    });
  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

module.exports = { createJob, getAllJobs, getCompanyJobs, getOneJob, updateJob, deleteJob, };
