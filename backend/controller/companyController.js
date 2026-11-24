const Company = require("../model/companyModel");
const User = require("../model/userModel");
const Job = require("../model/jobModel");
const JobApply = require("../model/jobApplyModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

// Company Signup
const Signup = async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    companyName,
    companyType,
    registrationNumber,
    address,
    city,
    state,
    pincode,
    website,
    establishedDate,
  } = req.body;

  let user;

  try {
    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !companyName ||
      !companyType ||
      !registrationNumber ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !establishedDate
    ) {
      return res.status(400).json({
        message: "All required fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashPassword,
      phoneNumber: phone,
      role: "company",
    });

    const company = await Company.create({
      companyName,
      companyType,
      registrationNumber,
      owner: name,
      industry: companyType,
      mailingAddress: {
        streetAddress: address,
        city,
        state,
        zipCode: pincode,
        country: "India",
      },
      website,
      establishedDate,
      user: user._id,
    })

    const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
);

    return res.status(201).json({
    message: "Company registered successfully",
    token,
    user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    },
    company
});
  } catch (error) {
    if (user) {
      await User.findByIdAndDelete(user._id);
    }

    return res.status(500).json({
      message: "Company registration failed",
      error: error.message,
    });
  }
};

// Create Company (Admin)
const createCompany = async (req, res) => {
  try {
    const {
      companyName,
      companyType,
      registrationNumber,
      owner,
      mailingAddress,
      nominalCapital,
      industry,
      website,
      establishedDate,
      user,
    } = req.body;

    if (
      !companyName ||
      !companyType ||
      !registrationNumber ||
      !owner ||
      !mailingAddress ||
      !industry ||
      !establishedDate ||
      !user
    ) {
      return res.status(400).json({
        message: "All required fields are required",
      });
    }

    const company = await Company.create({
      companyName,
      companyType,
      registrationNumber,
      owner,
      mailingAddress,
      nominalCapital,
      industry,
      website,
      establishedDate,
      user,
    });

    res.status(201).json({
      message: "Company registered successfully",
      company,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Companies
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();

    res.status(200).json({
      message: "Companies fetched successfully",
      companies,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Company By ID
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Company (Admin)
const updateCompany = async (req, res) => {
  try {
    const {
      companyName,
      companyType,
      registrationNumber,
      owner,
      industry,
      mailingAddress,
      website,
      establishedDate,
    } = req.body;

    const updateData = {};

    if (companyName !== undefined) updateData.companyName = companyName;
    if (companyType !== undefined) updateData.companyType = companyType;
    if (registrationNumber !== undefined)
      updateData.registrationNumber = registrationNumber;
    if (owner !== undefined) updateData.owner = owner;
    if (industry !== undefined) updateData.industry = industry;
    if (mailingAddress !== undefined)
      updateData.mailingAddress = mailingAddress;
    if (website !== undefined) updateData.website = website;
    if (establishedDate !== undefined)
      updateData.establishedDate = establishedDate;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    res.status(200).json({
      message: "Company updated successfully",
      company,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Company (Admin)
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    res.status(200).json({
      message: "Company deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Logged-in Company's Profile
const getMyProfile = async (req, res) => {
  try {
    const company = await Company.findOne({
      user: req.user._id,
    }).populate("user", "name email phoneNumber");

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    res.status(200).json({
      message: "Company profile fetched successfully",
      company,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Edit Logged-in Company's Profile
const editProfile = async (req, res) => {
  try {
    const {
      companyName,
      companyType,
      industry,
      mailingAddress,
      website,
      establishedDate,
    } = req.body;

    const updateData = {};

    if (companyName !== undefined) updateData.companyName = companyName;
    if (companyType !== undefined) updateData.companyType = companyType;
    if (industry !== undefined) updateData.industry = industry;
    if (mailingAddress !== undefined)
      updateData.mailingAddress = mailingAddress;
    if (website !== undefined) updateData.website = website;
    if (establishedDate !== undefined)
      updateData.establishedDate = establishedDate;

    const company = await Company.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    res.status(200).json({
      message: "Company profile updated successfully",
      company,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating company profile",
      error: error.message,
    });
  }
};

// Get Logged-in Company's Jobs
const getMyJobs = async (req, res) => {
  try {
    const company = await Company.findOne({
      user: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    const jobs = await Job.find({
      company: company._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      totalJobs: jobs.length,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Applications for Logged-in Company's Jobs
const getMyApplications = async (req, res) => {
  try {
    const company = await Company.findOne({
      user: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    const jobs = await Job.find({
      company: company._id,
    }).select("_id");

    const jobIds = jobs.map((job) => job._id);

    const applications = await JobApply.find({
      jobId: { $in: jobIds },
    })
      .populate("userId", "name email phoneNumber")
      .populate("jobId", "title location salary jobType")
      .sort({ createdAt: -1 });

    res.status(200).json({
      totalApplications: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Application Status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = ["pending", "shortlisted", "rejected", "accepted"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid application status",
      });
    }

    const company = await Company.findOne({
      user: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    const application = await JobApply.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    const job = await Job.findOne({
      _id: application.jobId,
      company: company._id,
    });

    if (!job) {
      return res.status(403).json({
        message: "You cannot update this application",
      });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { Signup, createCompany, getCompanies, getCompanyById, updateCompany, deleteCompany, getMyProfile, editProfile, getMyJobs, getMyApplications, updateApplicationStatus, };