const mongoose = require("mongoose");
const { Readable } = require("stream");
const JobApply = require("../model/jobApplyModel");
const Job = require("../model/jobModel");
const Company = require("../model/companyModel");
const BlockedUser = require("../model/blockedUserModel");
const cloudinary = require("../utils/cloudinary");
const sendEmail = require("../utils/sendEmail");
const transaction = require("../utils/transaction");
const axios = require("axios");

const uploadResume = async (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "jobnest/resumes",
        resource_type: "raw",
        public_id: `resume-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      },
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

// ----------------------------------
// GET MY APPLICATIONS
// ----------------------------------

const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const applications = await JobApply.find({
      userId,
    })
      .populate({
        path: "jobId",
        populate: {
          path: "company",
          select: "companyName industry website",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Applications fetched successfully",
      totalApplications: applications.length,
      applications,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// ----------------------------------
// APPLY FOR JOB
// ----------------------------------

const applyForJob = async (req, res) => {
  let uploadedFile = null;

  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const userId = req.user.id || req.user._id;

    if (req.user.role !== "user") {
      return res.status(403).json({
        message: "Only users can apply for jobs",
      });
    }

    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload your resume",
      });
    }

    const file = req.file;

    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({
        message: "Only PDF files are allowed",
      });
    }

    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        message: "Resume must be less than 5 MB",
      });
    }

    const job = await Job.findById(jobId).populate("company", "companyName");

    if (!job || job.status !== "Active") {
      return res.status(404).json({
        message: "Active job not found",
      });
    }

    if (!job.company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    if (new Date(job.lastDate) < new Date()) {
      return res.status(400).json({
        message: "Application deadline has passed",
      });
    }

    const isBlocked = await BlockedUser.findOne({
      companyId: job.company._id,
      userId,
    });

    if (isBlocked) {
      return res.status(403).json({
        message: "You are blocked by this company",
      });
    }

    const alreadyApplied = await JobApply.findOne({
      userId,
      jobId,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        message: "You have already applied for this job",
      });
    }

    // Upload resume
    uploadedFile = await uploadResume(file);

    // Save application
    const application = await JobApply.create({
      userId,
      jobId,
      resume: uploadedFile.secure_url,
      coverLetter,
    });

    // Confirmation email
    try {
      await sendEmail(
        req.user.email,
        "Application Submitted Successfully - JobNest",
        `
                    <h2>Hello ${req.user.name || "Candidate"},</h2>
                    <p>Your application has been submitted successfully.</p>
                    <p><b>Job:</b> ${job.title}</p>
                    <p><b>Company:</b> ${job.company.companyName}</p>
                    <p><b>Status:</b> Pending</p>
                    <br/>
                    <p>Thank you for using JobNest!</p>
                `,
      );
    } catch (emailError) {
      console.log("Application email error:", emailError.message);
    }

    return res.status(201).json({
      message: "Job application submitted successfully",
      application,
    });
  } catch (error) {
    // Handle duplicate application race condition
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already applied for this job",
      });
    }

    console.log("Apply Job Error:", error.message);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ----------------------------------
// GET COMPANY APPLICANTS
// ----------------------------------

const getCompanyApplicants = async (req, res) => {
  try {
    const company = await Company.findOne({
      user: req.user.id || req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const jobs = await Job.find({
      company: company._id,
    }).select("_id title");

    const jobIds = jobs.map((job) => job._id);

    const applicants = await JobApply.find({
      jobId: { $in: jobIds },
    })
      .populate("userId", "name email phoneNumber")
      .populate("jobId", "title location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Applicants fetched successfully",
      totalApplicants: applicants.length,
      applicants,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// ----------------------------------
// UPDATE APPLICANT STATUS
// ----------------------------------

const updateApplicantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatus = ["pending", "shortlisted", "rejected", "accepted"];

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid application ID",
      });
    }

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid application status",
      });
    }

    const result = await transaction(async (session) => {
      const company = await Company.findOne({
        user: req.user.id || req.user._id,
      }).session(session);

      if (!company) {
        const error = new Error("Company profile not found");
        error.statusCode = 404;
        throw error;
      }

      const application = await JobApply.findById(id)
        .session(session)
        .populate("jobId")
        .populate("userId", "name email");

      if (
        !application ||
        !application.jobId ||
        application.jobId.company.toString() !== company._id.toString()
      ) {
        const error = new Error("Application not found");
        error.statusCode = 404;
        throw error;
      }

      if (!application.userId) {
        const error = new Error("Applicant not found");
        error.statusCode = 404;
        throw error;
      }

      if (application.status === status) {
        return {
          unchanged: true,
          application,
        };
      }

      application.status = status;

      await application.save({ session });

      return {
        unchanged: false,
        application,
        emailDetails: {
          email: application.userId.email,
          name: application.userId.name,
          jobTitle: application.jobId.title,
          status,
        },
      };
    });

    if (result.unchanged) {
      return res.status(200).json({
        message: "Application already has this status",
        application: result.application,
      });
    }

    // Email is sent only after successful database transaction
    const emailMessages = {
      shortlisted: {
        subject: "Congratulations! You are Shortlisted - JobNest",
        message: "Congratulations! Your application has been shortlisted.",
      },

      accepted: {
        subject: "Your Application is Accepted - JobNest",
        message: "Congratulations! Your application has been accepted.",
      },

      rejected: {
        subject: "Application Status Update - JobNest",
        message: "Unfortunately, your application was not selected.",
      },

      pending: {
        subject: "Application Status Updated - JobNest",
        message: "Your application status has been changed to Pending.",
      },
    };

    const email = emailMessages[result.emailDetails.status];

    try {
      await sendEmail(
        result.emailDetails.email,
        email.subject,
        `
                    <h2>Hello ${result.emailDetails.name || "Candidate"},</h2>
                    <p>${email.message}</p>
                    <p><b>Job:</b> ${result.emailDetails.jobTitle}</p>
                    <p><b>New Status:</b> ${result.emailDetails.status.toUpperCase()}</p>
                    <br/>
                    <p>Thank you for using JobNest!</p>
                `,
      );
    } catch (emailError) {
      console.log("Status email error:", emailError.message);
    }

    return res.status(200).json({
      message: "Application status updated successfully",
      application: result.application,
    });
  } catch (error) {
    console.log("Update Status Error:", error.message);

    return res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

const previewResume = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({
        message: "Only companies can view applicant resumes",
      });
    }

    const company = await Company.findOne({
      user: req.user._id || req.user.id,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    const application = await JobApply.findById(req.params.id).populate(
      "jobId",
    );

    if (!application || !application.jobId) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (application.jobId.company.toString() !== company._id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to view this resume",
      });
    }

    if (!application.resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    const pdfResponse = await axios.get(application.resume, {
      responseType: "stream",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="resume.pdf"');
    res.setHeader("Cache-Control", "no-store");

    pdfResponse.data.pipe(res);
  } catch (error) {
    console.log("Resume preview error:", error.message);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Unable to preview resume",
      });
    }
  }
};

module.exports = { getMyApplications, applyForJob, getCompanyApplicants, updateApplicantStatus, previewResume };
