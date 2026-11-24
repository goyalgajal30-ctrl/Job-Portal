const mongoose = require("mongoose");
const User = require("../model/userModel");
const Company = require("../model/companyModel");
const Job = require("../model/jobModel");
const JobApply = require("../model/jobApplyModel");

// Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalCompanies = await Company.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await JobApply.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCompanies,
        totalJobs,
        totalApplications,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate("user", "name email phoneNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      companies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("company", "companyName industry website")
      .sort({ createdAt: -1 });

    const jobsWithApplicants = await Promise.all(
      jobs.map(async (job) => {
        const totalApplicants = await JobApply.countDocuments({
          jobId: job._id,
        });

        return {
          ...job.toObject(),
          totalApplicants,
        };
      }),
    );

    res.status(200).json({
      success: true,
      jobs: jobsWithApplicants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const user = await User.findOne({
      _id: req.params.id,
      role: "user",
    }).session(session);

    if (!user) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await JobApply.deleteMany({ userId: user._id }, { session });

    await User.deleteOne({ _id: user._id }, { session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// Update Company
const updateCompany = async (req, res) => {
  try {
    const {
      companyName,
      companyType,
      registrationNumber,
      establishedDate,
      owner,
      mailingAddress,
      nominalCapital,
      industry,
      website,
    } = req.body;

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      {
        companyName,
        companyType,
        registrationNumber,
        establishedDate,
        owner,
        mailingAddress,
        nominalCapital,
        industry,
        website,
      },
      {
        new: true,
        runValidators: true,
      },
    ).populate("user", "name email phoneNumber");

    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Company
const deleteCompany = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const company = await Company.findById(req.params.id).session(session);

    if (!company) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const jobs = await Job.find({
      company: company._id,
    })
      .select("_id")
      .session(session);

    const jobIds = jobs.map((job) => job._id);

    await JobApply.deleteMany({ jobId: { $in: jobIds } }, { session });

    await Job.deleteMany({ company: company._id }, { session });

    if (company.user) {
      await User.deleteOne({ _id: company.user }, { session });
    }

    await Company.deleteOne({ _id: company._id }, { session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Company and its jobs deleted successfully",
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
};

const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        // First delete all applications of this job
        await JobApply.deleteMany({ jobId: id });

        // Then delete the job
        await Job.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Job and its applications deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllApplications = async (req, res) => {
    try {
        const applications = await JobApply.find()
            .populate("userId", "name email phoneNumber")
            .populate({
                path: "jobId",
                select: "title location salary jobType company",
                populate: {
                    path: "company",
                    select: "companyName"
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            totalApplications: applications.length,
            applications
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const application = await JobApply.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Application status updated",
            application
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { getDashboardStats, getAllUsers, getAllCompanies, getAllJobs, deleteUser, updateCompany, deleteCompany, deleteJob, getAllApplications, updateApplicationStatus, };