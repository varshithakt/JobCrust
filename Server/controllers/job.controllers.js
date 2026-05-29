import { Job } from "../models/job.models.js";


// role === "recruiter"

export const postJob = async (req, res) => {
    try {
        const { title, description, location, requirements, salary, jobType, experience, position, companyId } = req.body;

        const userId = req.id;

        if (!title || !description || !location || !requirements || !salary || !jobType || experience < 0 || !position || !companyId) {
            return res.status(400).json({
                message: "Something is missing",
                success: false,
            })
        }

        const job = await Job.create({
            title,
            description,
            location,
            requirements: requirements.split(","),
            salary: Number(salary),
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId,
        });

        return res.status(201).json({
            message: "New job created",
            job,
            success: true,
        })

    } catch (error) {
        console.log(error);
    }
}


// role === "student"
// role === "student"

export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";

        let query = {};

        // Salary Filters
        if (keyword === "6-10 LPA") {
            query = {
                salary: {
                    $gte: 6,
                    $lte: 10
                }
            };
        }
        else if (keyword === "10-40 LPA") {
            query = {
                salary: {
                    $gt: 10,
                    $lte: 40
                }
            };
        }
        else if (keyword === "40-100 LPA") {
            query = {
                salary: {
                    $gt: 40,
                    $lte: 100
                }
            };
        }
        else if (keyword === "100+") {
            query = {
                salary: {
                    $gt: 100
                }
            };
        }

        // Location + Industry + Job Title Search
        else {
            query = {
                $or: [
                    {
                        title: {
                            $regex: keyword,
                            $options: "i"
                        }
                    },
                    {
                        description: {
                            $regex: keyword,
                            $options: "i"
                        }
                    },
                    {
                        location: {
                            $regex: keyword,
                            $options: "i"
                        }
                    },
                    {
                        jobType: {
                            $regex: keyword,
                            $options: "i"
                        }
                    }
                ]
            };
        }

        const jobs = await Job.find(query)
            .populate({
                path: "company"
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            jobs,
            message: "Jobs fetched successfully"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// role === "student"

export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        const job = await Job.findById(jobId).populate(
            {
                path: "applications",
            }
        );
        if (!job) {
            res.status(404).json({
                message: "Job not found",
                success: false,
            })
        }

        return res.status(200).json({
            message: "Job found",
            job,
            success: true,
        })

    } catch (error) {
        console.log(error);
    }
}


// role === "recruiter"

export const getRecruiterJobs = async (req, res) => {
    try {
        const recruiterId = req.id;
        const jobs = await Job.find({ created_by: recruiterId }).populate(
            {
                path: "company",
                createdAt: -1,
            }
        );
        if (!jobs) {
            return res.status(404).json({
                message: "No jobs found",
                success: false,
            })
        }

        return res.status(200).json({
            message: "Jobs found",
            jobs,
            success: true,
        })


    } catch (error) {
        console.log(error);
    }
}//

