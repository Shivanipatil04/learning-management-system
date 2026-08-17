const Course = require("./course.model");
const StudentProfile = require("../users/studentProfile.model");

exports.getAllCourses = async (req, res, next) => {
  try {
    const { search, category, level, price, sort } = req.query;
    
    let query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (category && category !== "All") {
      query.category = category;
    }
    if (level) {
      query.level = level;
    }
    if (price) {
      if (price === "Free") query.price = 0;
      else if (price === "Paid") query.price = { $gt: 0 };
    }

    let sortQuery = {};
    if (sort === "Most Popular") sortQuery.reviewCount = -1;
    else if (sort === "Highest Rated") sortQuery.rating = -1;
    else if (sort === "Newest") sortQuery.createdAt = -1;
    else if (sort === "Price: Low to High") sortQuery.price = 1;
    else if (sort === "Price: High to Low") sortQuery.price = -1;
    else sortQuery.createdAt = -1; // Default

    const courses = await Course.find(query)
      .sort(sortQuery)
      .populate("teacher", "name email");

    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    next(error);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("teacher", "name email");
    
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

exports.enrollInCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id; // Assuming auth middleware adds user

    let profile = await StudentProfile.findOne({ userId });
    
    if (!profile) {
      profile = await StudentProfile.create({ userId, enrolledCourses: [] });
    }

    if (profile.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ success: false, message: "Already enrolled in this course" });
    }

    profile.enrolledCourses.push(courseId);
    await profile.save();

    res.status(200).json({ success: true, message: "Successfully enrolled", data: profile });
  } catch (error) {
    next(error);
  }
};
