require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("./src/modules/courses/course.model");
const User = require("./src/modules/users/user.model");
const TeacherProfile = require("./src/modules/users/teacherProfile.model");

const seedCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing courses
    await Course.deleteMany({});
    console.log("Cleared existing courses");

    // Find or create a teacher
    let teacher = await User.findOne({ userType: "teacher" });
    if (!teacher) {
      teacher = await User.create({
        name: "Sarah Drasner",
        email: "sarah@example.com",
        password: "password123", // Unhashed, just for seeding refs
        userType: "teacher"
      });
      await TeacherProfile.create({ userId: teacher._id, bio: "Expert Frontend Dev" });
      console.log("Created dummy teacher");
    }

    const courses = [
      {
        title: "Advanced React Patterns",
        description: "Master advanced React design patterns and component composition. Build scalable applications with modern hooks, context, and state management strategies.",
        teacher: teacher._id,
        price: 49.99,
        level: "Advanced",
        language: "English",
        category: "Development",
        rating: 4.8,
        reviewCount: 120,
        duration: "10 hours",
        totalLessons: 24,
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
        curriculum: [
          { title: "Introduction", lessons: [{ title: "Welcome", duration: "10:00" }] },
          { title: "Render Props", lessons: [{ title: "Understanding Render Props", duration: "15:00" }] }
        ]
      },
      {
        title: "UI/UX Design Principles",
        description: "Learn the fundamentals of user interface and experience design. Perfect for developers wanting to improve their design eye.",
        teacher: teacher._id,
        price: 0,
        level: "Beginner",
        language: "English",
        category: "Design",
        rating: 4.9,
        reviewCount: 350,
        duration: "5 hours",
        totalLessons: 12,
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
        curriculum: [
          { title: "Basics", lessons: [{ title: "What is UX?", duration: "15:00" }] }
        ]
      },
      {
        title: "Node.js Microservices",
        description: "Build scalable microservices with Node.js and Docker. Learn containerization, messaging queues, and deployment strategies.",
        teacher: teacher._id,
        price: 89.99,
        level: "Intermediate",
        language: "English",
        category: "Development",
        rating: 4.5,
        reviewCount: 89,
        duration: "15 hours",
        totalLessons: 40,
        thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
        curriculum: [
          { title: "Getting Started", lessons: [{ title: "Docker Basics", duration: "20:00" }] }
        ]
      },
      {
        title: "Digital Marketing 101",
        description: "SEO, SEM, and Social Media Marketing basics. Get your product seen by millions using organic strategies.",
        teacher: teacher._id,
        price: 29.99,
        level: "Beginner",
        language: "English",
        category: "Marketing",
        rating: 4.2,
        reviewCount: 45,
        duration: "8 hours",
        totalLessons: 15,
        thumbnail: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80",
        curriculum: [
          { title: "SEO", lessons: [{ title: "Keyword Research", duration: "25:00" }] }
        ]
      }
    ];

    await Course.insertMany(courses);
    console.log("Successfully seeded courses");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding courses:", error);
    process.exit(1);
  }
};

seedCourses();
