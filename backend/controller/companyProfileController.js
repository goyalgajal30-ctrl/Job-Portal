
const Company = require("../model/companyModel");

// CREATE COMPANY PROFILE
const createCompanyProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const existingCompany = await Company.findOne({
            user: userId,
        });

        if (existingCompany) {
            return res.status(400).json({
                message: "Company profile already exists",
            });
        }

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

        const company = await Company.create({
            companyName,
            companyType,
            registrationNumber,
            establishedDate,
            owner,
            mailingAddress,
            nominalCapital,
            industry,
            website,
            user: userId,
        });

        return res.status(201).json({
            message: "Company profile created successfully",
            company,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error creating company profile",
            error: error.message,
        });
    }
};


// UPDATE COMPANY PROFILE
const updateCompanyProfile = async (req, res) => {
    try {
        const userId = req.user._id;

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

        const company = await Company.findOne({
            user: userId,
        });

        if (!company) {
            return res.status(404).json({
                message: "Company profile not found",
            });
        }

        if (companyName !== undefined) {
            company.companyName = companyName;
        }

        if (companyType !== undefined) {
            company.companyType = companyType;
        }

        if (registrationNumber !== undefined) {
            company.registrationNumber = registrationNumber;
        }

        if (establishedDate !== undefined) {
            company.establishedDate = establishedDate;
        }

        if (owner !== undefined) {
            company.owner = owner;
        }

        if (mailingAddress !== undefined) {
            company.mailingAddress = {
                ...company.mailingAddress.toObject(),
                ...mailingAddress,
            };
        }

        if (nominalCapital !== undefined) {
            company.nominalCapital = nominalCapital;
        }

        if (industry !== undefined) {
            company.industry = industry;
        }

        if (website !== undefined) {
            company.website = website;
        }

        await company.save();

        return res.status(200).json({
            message: "Company profile updated successfully",
            company,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error updating company profile",
            error: error.message,
        });
    }
};


// GET ONE COMPANY PROFILE
const getOneCompanyProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const company = await Company.findOne({
            user: userId,
        }).populate("user", "name email");

        if (!company) {
            return res.status(404).json({
                message: "Company profile not found",
            });
        }

        return res.status(200).json({
            message: "Company profile fetched successfully",
            company,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching company profile",
            error: error.message,
        });
    }
};


module.exports = {
    createCompanyProfile,
    updateCompanyProfile,
    getOneCompanyProfile,
};
