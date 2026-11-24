const UserProfile = require("../model/userprofileModel");

const createProfile = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { skills, qualification, experience, About, address } = req.body || {};

        let profile = await UserProfile.findOne({ user: userId });
        if (profile) {
            profile = await UserProfile.findOneAndUpdate(
                { user: userId },
                { skills, qualification, experience, About, address },
                { new: true, runValidators: true }
            );
            return res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                profile,
            });
        }

        profile = await UserProfile.create({
            skills: Array.isArray(skills) ? skills : (skills ? skills.split(",").map(s => s.trim()) : []),
            qualification: Array.isArray(qualification) ? qualification : (qualification ? qualification.split(",").map(q => q.trim()) : []),
            experience: Array.isArray(experience) ? experience : [],
            About: About || "",
            address: address || "",
            user: userId,
        });

        res.status(201).json({
            success: true,
            message: "Profile created successfully",
            profile,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating profile",
            error: error.message,
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { skills, qualification, experience, About, address } = req.body || {};

        const formattedSkills = Array.isArray(skills) ? skills : (skills ? skills.split(",").map(s => s.trim()) : []);
        const formattedQual = Array.isArray(qualification) ? qualification : (qualification ? qualification.split(",").map(q => q.trim()) : []);

        const profile = await UserProfile.findOneAndUpdate(
            { user: userId },
            {
                skills: formattedSkills,
                qualification: formattedQual,
                experience: Array.isArray(experience) ? experience : [],
                About: About || "",
                address: address || "",
                user: userId,
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Profile saved successfully",
            profile,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: error.message,
        });
    }
};

const getOneProfile = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        const profile = await UserProfile.findOne({
            user: userId,
        }).populate("user", "name email phoneNumber");

        if (!profile) {
            return res.status(200).json({
                success: true,
                profile: null,
                message: "Profile not created yet",
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            profile,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching profile",
            error: error.message,
        });
    }
};

module.exports = { createProfile, updateProfile, getOneProfile };
