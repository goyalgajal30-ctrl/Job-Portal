
const InterviewSchedule = require("../model/InterviewScheduleModel");
const JobApply = require("../model/jobApplyModel");
const Company = require("../model/companyModel");
const Job = require("../model/jobModel");
const sendEmail = require("../utils/sendEmail");


// SCHEDULE INTERVIEW
const scheduleInterview = async (req, res) => {
    try {
        const {
            jobApplyId,
            interviewDate,
            interviewTime,
            jobDescription,
            interviewMode,
            meetLink,
        } = req.body;

        if (
            !jobApplyId ||
            !interviewDate ||
            !interviewTime ||
            !jobDescription ||
            !interviewMode
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required details",
            });
        }

        if (!["online", "offline"].includes(interviewMode)) {
            return res.status(400).json({
                success: false,
                message: "Invalid interview mode",
            });
        }

        if (interviewMode === "online" && !meetLink?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Google Meet link is required",
            });
        }

        const company = await Company.findOne({
            user: req.user._id || req.user.id,
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const application = await JobApply.findById(jobApplyId)
            .populate("userId")
            .populate({
                path: "jobId",
                populate: {
                    path: "company",
                },
            });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Job application not found",
            });
        }

        if (!application.jobId || !application.jobId.company) {
            return res.status(404).json({
                success: false,
                message: "Job or company not found",
            });
        }

        if (
            application.jobId.company._id.toString() !==
            company._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot schedule an interview for this application",
            });
        }

        if (application.status !== "accepted") {
            return res.status(400).json({
                success: false,
                message: "Only approved applications can be scheduled",
            });
        }

        const existingInterview = await InterviewSchedule.findOne({
            jobApplyId,
        });

        if (existingInterview) {
            return res.status(400).json({
                success: false,
                message: "Interview already scheduled",
            });
        }

        const interview = await InterviewSchedule.create({
            jobApplyId,
            interviewDate,
            interviewTime,
            jobDescription,
            interviewMode,
            meetLink: interviewMode === "online" ? meetLink : "",
        });

        // Send interview invitation email to candidate
        const candidate = application.userId;
        if (candidate?.email) {
            try {
                const formattedDate = new Date(interviewDate).toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                });

                await sendEmail(
                    candidate.email,
                    `JobNest - Interview Scheduled with ${company.companyName}`,
                    `
                        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <h2 style="color: #7c3aed;">Hello ${candidate.name || "Candidate"},</h2>
                            <p>Great news! <b>${company.companyName}</b> has scheduled an interview for your application for the <b>${application.jobId.title}</b> role.</p>
                            
                            <div style="background: #f5f3ff; border-left: 4px solid #7c3aed; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 5px 0;"><b>Date:</b> ${formattedDate}</p>
                                <p style="margin: 5px 0;"><b>Time:</b> ${interviewTime}</p>
                                <p style="margin: 5px 0;"><b>Mode:</b> ${interviewMode.toUpperCase()}</p>
                                ${interviewMode === "online" && meetLink ? `<p style="margin: 5px 0;"><b>Meeting Link:</b> <a href="${meetLink}" target="_blank" style="color: #7c3aed; text-decoration: underline;">Join Interview</a> (${meetLink})</p>` : ""}
                                <p style="margin: 5px 0;"><b>Notes:</b> ${jobDescription}</p>
                            </div>

                            <p>Please make sure to join or arrive 5-10 minutes prior to your scheduled time slot.</p>
                            <br/>
                            <p>Best regards,<br/><b>Team JobNest</b></p>
                        </div>
                    `
                );
            } catch (emailErr) {
                console.error("Interview schedule email error:", emailErr.message);
            }
        }

        return res.status(201).json({
            success: true,
            message: "Interview scheduled successfully",
            interview,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// GET USER INTERVIEWS
const getMyInterviews = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        const applications = await JobApply.find({
            userId,
        }).select("_id");

        const applicationIds = applications.map(
            (item) => item._id
        );

        const interviews = await InterviewSchedule.find({
            jobApplyId: { $in: applicationIds },
        })
            .populate({
                path: "jobApplyId",
                populate: [
                    {
                        path: "jobId",
                        populate: {
                            path: "company",
                            select: "companyName industry website",
                        },
                    },
                    { path: "userId", select: "name email phoneNumber" },
                ],
            })
            .sort({ interviewDate: 1 });

        return res.status(200).json({
            success: true,
            totalInterviews: interviews.length,
            interviews,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// GET COMPANY INTERVIEWS
const getCompanyInterviews = async (req, res) => {
    try {
        const company = await Company.findOne({
            user: req.user._id || req.user.id,
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const jobs = await Job.find({
            company: company._id,
        }).select("_id");

        const jobIds = jobs.map(
            (job) => job._id
        );

        const applications = await JobApply.find({
            jobId: { $in: jobIds },
        }).select("_id");

        const applicationIds = applications.map(
            (item) => item._id
        );

        const interviews = await InterviewSchedule.find({
            jobApplyId: { $in: applicationIds },
        })
            .populate({
                path: "jobApplyId",
                populate: [
                    { path: "userId", select: "name email" },
                    { path: "jobId" },
                ],
            })
            .sort({ interviewDate: 1 });

        return res.status(200).json({
            success: true,
            totalInterviews: interviews.length,
            interviews,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// UPDATE INTERVIEW RESULT
const updateInterviewResult = async (req, res) => {
    try {
        const { status, feedback } = req.body;
        const { id } = req.params;

        if (!["cleared", "not_cleared"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid interview status",
            });
        }

        const company = await Company.findOne({
            user: req.user._id || req.user.id,
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const interview = await InterviewSchedule.findById(id);

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: "Interview not found",
            });
        }

        if (interview.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Interview result has already been submitted",
            });
        }

        const application = await JobApply.findById(
            interview.jobApplyId
        )
            .populate("userId")
            .populate({
                path: "jobId",
                populate: {
                    path: "company",
                },
            });

        if (
            !application ||
            !application.userId ||
            !application.jobId ||
            !application.jobId.company
        ) {
            return res.status(404).json({
                success: false,
                message: "Candidate or job not found",
            });
        }

        if (
            application.jobId.company._id.toString() !==
            company._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot update this interview result",
            });
        }

        interview.status = status;
        interview.feedback = feedback || "";
        interview.feedbackStatus = "completed";

        await interview.save();

        const user = application.userId;

        const message =
            status === "cleared"
                ? "Congratulations! You have been hired. Your interview was successful."
                : "Thank you for attending the interview. Unfortunately, you were not selected.";

        // Send email only. No notification system.
        if (user.email) {
            try {
                await sendEmail(
                    user.email,
                    "JobNest - Interview Result",
                    `
                        <div style="font-family: Arial, sans-serif;">
                            <h2>Hello ${user.name || "Candidate"},</h2>
                            <p>${message}</p>
                            <p><b>Job:</b> ${application.jobId.title}</p>
                            <p><b>Interview Result:</b> ${status}</p>
                            <p><b>Feedback:</b> ${feedback || "No feedback provided"}</p>
                            <br/>
                            <p>Thank you for using JobNest!</p>
                        </div>
                    `
                );
            } catch (emailError) {
                console.error(
                    "Interview result email error:",
                    emailError.message
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: "Interview result updated successfully",
            interview,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


module.exports = {
    scheduleInterview,
    getMyInterviews,
    getCompanyInterviews,
    updateInterviewResult,
};
