import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create sample users
  const hashedPassword = await hash("password123", 12)

  // Create job seeker
  const jobSeeker = await prisma.user.create({
    data: {
      email: "jobseeker@example.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Doe",
      phone: "+62 812 3456 7890",
      role: "JOBSEEKER",
      location: "Jakarta, Indonesia",
      profileComplete: true,
      emailVerified: true,
      jobSeekerProfile: {
        create: {
          professionalSummary: "Experienced Frontend Developer with 5+ years of expertise in React and TypeScript.",
          careerObjective: "Seeking a challenging Senior Developer position to leverage my technical skills.",
          expectedSalaryMin: 18000000,
          expectedSalaryMax: 28000000,
          preferredLocation: "Jakarta, Indonesia",
          preferredJobType: "FULL_TIME",
          preferredWorkMode: "HYBRID",
          yearsOfExperience: 5,
          currentJobTitle: "Senior Frontend Developer",
          currentCompany: "TechCorp Indonesia",
          portfolioUrl: "https://johndoe.dev",
          linkedinUrl: "https://linkedin.com/in/johndoe",
          githubUrl: "https://github.com/johndoe",
          skills: {
            create: [
              { name: "React", category: "TECHNICAL", proficiencyLevel: "EXPERT", yearsOfExperience: 5 },
              { name: "TypeScript", category: "TECHNICAL", proficiencyLevel: "ADVANCED", yearsOfExperience: 4 },
              { name: "Next.js", category: "TECHNICAL", proficiencyLevel: "ADVANCED", yearsOfExperience: 3 },
              { name: "JavaScript", category: "TECHNICAL", proficiencyLevel: "EXPERT", yearsOfExperience: 6 },
              { name: "Node.js", category: "TECHNICAL", proficiencyLevel: "INTERMEDIATE", yearsOfExperience: 3 },
              { name: "Leadership", category: "SOFT", proficiencyLevel: "ADVANCED", yearsOfExperience: 2 },
              { name: "Communication", category: "SOFT", proficiencyLevel: "EXPERT", yearsOfExperience: 5 },
            ],
          },
          workExperiences: {
            create: [
              {
                company: "TechCorp Indonesia",
                position: "Senior Frontend Developer",
                startDate: new Date("2022-01-01"),
                isCurrent: true,
                description: "Led development of customer-facing web applications using React and TypeScript.",
                achievements: ["Improved performance by 40%", "Mentored 3 junior developers"],
                technologies: ["React", "TypeScript", "Next.js", "GraphQL"],
              },
              {
                company: "StartupXYZ",
                position: "Frontend Developer",
                startDate: new Date("2020-03-01"),
                endDate: new Date("2021-12-31"),
                description: "Developed responsive web applications and collaborated with design team.",
                achievements: ["Built 5 major web applications", "Implemented design system"],
                technologies: ["React", "JavaScript", "CSS", "REST APIs"],
              },
            ],
          },
          educations: {
            create: [
              {
                degree: "Bachelor of Computer Science",
                fieldOfStudy: "Computer Science",
                institution: "University of Indonesia",
                startDate: new Date("2016-08-01"),
                endDate: new Date("2019-07-01"),
                gpa: "3.8",
              },
            ],
          },
          languages: {
            create: [
              { language: "Indonesian", proficiency: "NATIVE" },
              { language: "English", proficiency: "FLUENT" },
            ],
          },
          certifications: {
            create: [
              {
                name: "AWS Certified Developer",
                issuer: "Amazon Web Services",
                issueDate: new Date("2023-06-15"),
                expiryDate: new Date("2026-06-15"),
              },
            ],
          },
        },
      },
    },
  })

  // Create HRD user
  const hrdUser = await prisma.user.create({
    data: {
      email: "hrd@techcorp.com",
      password: hashedPassword,
      firstName: "Jane",
      lastName: "Smith",
      phone: "+62 812 9876 5432",
      role: "HRD",
      location: "Jakarta, Indonesia",
      profileComplete: true,
      emailVerified: true,
      hrdProfile: {
        create: {
          companyName: "TechCorp Indonesia",
          companySize: "500-1000",
          industry: "Technology",
          companyWebsite: "https://techcorp.id",
          companyDescription: "Leading technology company in Indonesia",
          position: "HR Manager",
          department: "Human Resources",
        },
      },
    },
  })

  // Create sample jobs
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: "Senior React Native Developer",
        description:
          "We are looking for a Senior React Native Developer to join our mobile team and build cutting-edge applications.",
        requirements: [
          "5+ years of React Native development experience",
          "Strong knowledge of JavaScript/TypeScript",
          "Experience with Redux and state management",
          "Knowledge of native iOS/Android development",
        ],
        responsibilities: [
          "Develop and maintain React Native applications",
          "Collaborate with cross-functional teams",
          "Mentor junior developers",
          "Ensure code quality and best practices",
        ],
        benefits: [
          "Competitive salary and bonuses",
          "Health insurance",
          "Flexible working hours",
          "Professional development budget",
        ],
        salaryMin: 20000000,
        salaryMax: 30000000,
        location: "Jakarta, Indonesia",
        jobType: "FULL_TIME",
        workMode: "HYBRID",
        experienceLevel: "SENIOR_LEVEL",
        category: "ENGINEERING",
        skills: ["React Native", "TypeScript", "Redux", "Firebase", "iOS", "Android"],
        companyName: "TechCorp Indonesia",
        companyDescription: "Leading technology company specializing in mobile applications",
        companyWebsite: "https://techcorp.id",
        postedById: hrdUser.id,
        featured: true,
        urgent: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    }),
    prisma.job.create({
      data: {
        title: "Mobile UI/UX Designer",
        description: "Join our creative team to design beautiful and intuitive mobile user experiences.",
        requirements: [
          "3+ years of mobile UI/UX design experience",
          "Proficiency in Figma and Adobe Creative Suite",
          "Strong portfolio of mobile app designs",
          "Understanding of iOS and Android design guidelines",
        ],
        responsibilities: [
          "Design mobile app interfaces and user experiences",
          "Create wireframes, prototypes, and design systems",
          "Collaborate with developers and product managers",
          "Conduct user research and usability testing",
        ],
        benefits: [
          "Creative workspace",
          "Design conference attendance",
          "Latest design tools and software",
          "Flexible schedule",
        ],
        salaryMin: 12000000,
        salaryMax: 18000000,
        location: "Bandung, Indonesia",
        jobType: "FULL_TIME",
        workMode: "ONSITE",
        experienceLevel: "MID_LEVEL",
        category: "DESIGN",
        skills: ["Figma", "Adobe XD", "Prototyping", "User Research", "Mobile Design"],
        companyName: "Design Studio Pro",
        companyDescription: "Creative design studio specializing in mobile experiences",
        postedById: hrdUser.id,
        featured: false,
        urgent: false,
        expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.job.create({
      data: {
        title: "Full Stack Mobile Developer",
        description: "Work remotely with our dynamic startup team on cutting-edge mobile and web applications.",
        requirements: [
          "4+ years of full-stack development experience",
          "Strong React Native and Node.js skills",
          "Experience with PostgreSQL and cloud platforms",
          "Knowledge of RESTful APIs and GraphQL",
        ],
        responsibilities: [
          "Develop full-stack mobile applications",
          "Build and maintain backend APIs",
          "Implement database designs",
          "Deploy applications to cloud platforms",
        ],
        benefits: ["Fully remote work", "Equity participation", "Learning and development budget", "Modern tech stack"],
        salaryMin: 18000000,
        salaryMax: 28000000,
        location: "Remote",
        jobType: "FULL_TIME",
        workMode: "REMOTE",
        experienceLevel: "MID_LEVEL",
        category: "ENGINEERING",
        skills: ["React Native", "Node.js", "PostgreSQL", "AWS", "GraphQL"],
        companyName: "StartupHub",
        companyDescription: "Dynamic startup building the future of mobile technology",
        postedById: hrdUser.id,
        featured: true,
        urgent: true,
        expiresAt: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
      },
    }),
  ])

  // Create additional jobseeker users for talent page
  const additionalJobSeekers = [
    {
      email: "sarah.wilson@example.com",
      firstName: "Sarah",
      lastName: "Wilson",
      phone: "+62 821 1111 1111",
      location: "Jakarta, Indonesia",
      profile: {
        professionalSummary: "Full-stack developer with 6+ years of experience in React, Node.js, and cloud architecture. Passionate about building scalable web applications.",
        expectedSalaryMin: 22000000,
        expectedSalaryMax: 32000000,
        preferredLocation: "Jakarta, Indonesia",
        preferredJobType: "FULL_TIME" as const,
        preferredWorkMode: "HYBRID" as const,
        yearsOfExperience: 6,
        currentJobTitle: "Senior Full Stack Developer",
        currentCompany: "Digital Solutions Inc",
        portfolioUrl: "https://sarahwilson.dev",
        linkedinUrl: "https://linkedin.com/in/sarah-wilson-dev",
        githubUrl: "https://github.com/sarahwilson",
        skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL", "GraphQL", "Docker", "Leadership"]
      }
    },
    {
      email: "maria.garcia@example.com",
      firstName: "Maria",
      lastName: "Garcia",
      phone: "+62 822 2222 2222",
      location: "Surabaya, Indonesia",
      profile: {
        professionalSummary: "UX/UI Designer with a passion for creating intuitive and beautiful user experiences. Specialized in mobile and web design with user-centered approach.",
        expectedSalaryMin: 15000000,
        expectedSalaryMax: 22000000,
        preferredLocation: "Surabaya, Indonesia",
        preferredJobType: "FULL_TIME" as const,
        preferredWorkMode: "HYBRID" as const,
        yearsOfExperience: 5,
        currentJobTitle: "Senior UX Designer",
        currentCompany: "DesignStudio Indonesia",
        portfolioUrl: "https://mariagarcia.design",
        linkedinUrl: "https://linkedin.com/in/maria-garcia-ux",
        githubUrl: "https://github.com/mariagarcia-design",
        skills: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research", "CSS", "HTML", "Design Systems"]
      }
    },
    {
      email: "david.kim@example.com",
      firstName: "David",
      lastName: "Kim",
      phone: "+62 823 3333 3333",
      location: "Bandung, Indonesia",
      profile: {
        professionalSummary: "Data scientist and machine learning engineer with expertise in Python, TensorFlow, and cloud platforms. Love solving complex problems with data-driven solutions.",
        expectedSalaryMin: 25000000,
        expectedSalaryMax: 35000000,
        preferredLocation: "Bandung, Indonesia",
        preferredJobType: "FULL_TIME" as const,
        preferredWorkMode: "REMOTE" as const,
        yearsOfExperience: 7,
        currentJobTitle: "Senior Data Scientist",
        currentCompany: "DataTech Solutions",
        portfolioUrl: "https://davidkim-ml.com",
        linkedinUrl: "https://linkedin.com/in/david-kim-data",
        githubUrl: "https://github.com/davidkim-ml",
        skills: ["Python", "TensorFlow", "PyTorch", "SQL", "AWS", "Docker", "Jupyter", "Machine Learning"]
      }
    }
  ];

  for (const userData of additionalJobSeekers) {
    await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: "JOBSEEKER",
        location: userData.location,
        profileComplete: true,
        emailVerified: true,
        jobSeekerProfile: {
          create: {
            professionalSummary: userData.profile.professionalSummary,
            expectedSalaryMin: userData.profile.expectedSalaryMin,
            expectedSalaryMax: userData.profile.expectedSalaryMax,
            preferredLocation: userData.profile.preferredLocation,
            preferredJobType: userData.profile.preferredJobType,
            preferredWorkMode: userData.profile.preferredWorkMode,
            yearsOfExperience: userData.profile.yearsOfExperience,
            currentJobTitle: userData.profile.currentJobTitle,
            currentCompany: userData.profile.currentCompany,
            portfolioUrl: userData.profile.portfolioUrl,
            linkedinUrl: userData.profile.linkedinUrl,
            githubUrl: userData.profile.githubUrl,
            skills: {
              create: userData.profile.skills.map((skillName, index) => ({
                name: skillName,
                category: index < 4 ? "TECHNICAL" as const : "SOFT" as const,
                proficiencyLevel: index < 2 ? "EXPERT" as const : index < 4 ? "ADVANCED" as const : "INTERMEDIATE" as const,
                yearsOfExperience: Math.max(1, userData.profile.yearsOfExperience - index)
              }))
            }
          }
        }
      }
    });
  }

  // Create sample notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: jobSeeker.id,
        type: "JOB_MATCH",
        title: "New Job Match Found!",
        message: "We found a 95% match for Senior React Native Developer at TechCorp Indonesia",
        data: { jobId: jobs[0].id, matchScore: 95 },
      },
      {
        userId: jobSeeker.id,
        type: "PROFILE_TIP",
        title: "Profile Optimization Tip",
        message: "Add React Native skills to increase your job matches by 40%",
        data: { skill: "React Native", impact: 40 },
      },
      {
        userId: hrdUser.id,
        type: "SYSTEM_UPDATE",
        title: "Job Posted Successfully",
        message: "Your job posting for Senior React Native Developer is now live",
        data: { jobId: jobs[0].id },
      },
    ],
  })

  console.log("✅ Database seeded successfully!")
  console.log("👤 Job Seeker: jobseeker@example.com / password123")
  console.log("👤 HRD: hrd@techcorp.com / password123")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
