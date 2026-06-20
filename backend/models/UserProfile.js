import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
    {
        institute: {
            type: String,
            required: true,
            trim: true,
        },

        location: {
            type: String,
            trim: true,
        },

        degree: {
            type: String,
            required: true,
            trim: true,
        },

        branch: {
            type: String,
            required: true,
            trim: true,
        },

        duration: {
            type: Number,
            min: 1,
            max: 10,
        },

        cgpa: {
            type: Number,
            min: 0,
            max: 10,
        },

        startMonth: {
            type: String,
            trim: true,
        },

        startYear: {
            type: Number,
        },

        endMonth: {
            type: String,
            trim: true,
        },

        endYear: {
            type: Number,
        },

        currentlyStudying: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        technologies: [
            {
                type: String,
                trim: true,
            },
        ],

        githubLink: {
            type: String,
            trim: true,
            required: false
        },

        liveLink: {
            type: String,
            trim: true,
            required: false,
        },
    },
    { _id: false }
);

const certificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        issuer: {
            type: String,
            trim: true,
        },

        issueDate: {
            type: Date,
        },

        credentialLink: {
            type: String,
            trim: true,
            required: false
        },
    },
    { _id: false }
);

const experienceSchema = new mongoose.Schema(
    {
        company: {
            type: String,
            required: true,
            trim: true,
        },

        role: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        employmentType: {
            type: String,
            enum: [
                "Internship",
                "Full-Time",
                "Part-Time",
                "Freelance",
                "Contract",
            ],
        },

        location: {
            type: String,
            trim: true,
        },

        duration: {
            type: Number,
            min: 1,
            max: 600
        },

        currentlyWorking: {
            type: Boolean,
            default: false,
        },

        isCurrentRole: {
            type: Boolean,
            default: false,
        },

        startMonth: {
            type: String,
            trim: true,
        },

        startYear: {
            type: Number,
        },

        endMonth: {
            type: String,
            trim: true,
        },

        endYear: {
            type: Number,
        },

        technologies: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    { _id: false }
);

const userProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        age: {
            type: Number,
            required: true,
            min: 10,
            max: 100,
        },

        gender: {
            type: String,
            required: true,
            enum: ["Male", "Female", "Other"],
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        location: {
            type: String,
            required: true,
            trim: true,
        },

        education: [educationSchema],

        skills: [{
            type: String,
            trim: true,
        }],

        projects: [projectSchema],

        certifications: [certificationSchema],

        experience: [experienceSchema],

        targetRoles: [{
            type: String,
            trim: true,
        }],

        github: {
            type: String,
            trim: true,
        },

        linkedin: {
            type: String,
            trim: true,
        },

        portfolio: {
            type: String,
            trim: true,
        },

        currentStatus: {
            type: String,
            required: true,
            enum: ["Student", "Fresher", "Working Professional", "Career Switcher"],
        },

        currentRole: {
            type: String,
            trim: true,
        },

        achievements: [{
            type: String,
            trim: true,
        }],

        languages: [{
            type: String,
            trim: true,
        }],

        interests: [{
            type: String,
            trim: true,
        }],

        careerObjective: {
            type: String,
            required: true,
            trim: true,
        },

        profileCompleted: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

export { educationSchema, projectSchema, certificationSchema, experienceSchema };
export default UserProfile;
