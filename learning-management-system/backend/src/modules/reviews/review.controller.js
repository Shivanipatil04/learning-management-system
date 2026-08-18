const Review = require("./review.model");
const Course = require("../courses/course.model");
const TeacherProfile = require("../users/teacherProfile.model");
const StudentProfile = require("../users/studentProfile.model");

// Helper function to update averages
const updateAverages = async (reviewType, targetId) => {
  const reviews = await Review.find({ 
    reviewType, 
    ...(reviewType === "course" ? { courseId: targetId } : { teacherId: targetId }) 
  });
  
  const reviewCount = reviews.length;
  const rating = reviewCount > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
    : 0;

  if (reviewType === "course") {
    await Course.findByIdAndUpdate(targetId, { rating: Number(rating), reviewCount });
  } else if (reviewType === "teacher") {
    await TeacherProfile.findOneAndUpdate({ userId: targetId }, { rating: Number(rating), reviewCount });
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { reviewType, courseId, teacherId, rating, comment } = req.body;
    const studentId = req.user._id || req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const studentProfile = await StudentProfile.findOne({ userId: studentId });
    if (!studentProfile) {
      return res.status(403).json({ success: false, message: "Only enrolled students can leave reviews" });
    }

    if (reviewType === "course") {
      if (!studentProfile.enrolledCourses.includes(courseId)) {
        return res.status(403).json({ success: false, message: "You are not enrolled in this course" });
      }
      const existing = await Review.findOne({ studentId, courseId, reviewType: "course" });
      if (existing) {
        return res.status(400).json({ success: false, message: "You have already reviewed this course" });
      }
    } else if (reviewType === "teacher") {
      // Find courses the student is enrolled in that are taught by this teacher
      const enrolledCourses = await Course.find({ 
        _id: { $in: studentProfile.enrolledCourses },
        teacher: teacherId
      });
      
      if (enrolledCourses.length === 0) {
        return res.status(403).json({ success: false, message: "You have not taken any courses with this teacher" });
      }
      const existing = await Review.findOne({ studentId, teacherId, reviewType: "teacher" });
      if (existing) {
        return res.status(400).json({ success: false, message: "You have already reviewed this teacher" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid review type" });
    }

    const review = await Review.create({
      studentId,
      reviewType,
      courseId: reviewType === "course" ? courseId : null,
      teacherId: reviewType === "teacher" ? teacherId : null,
      rating,
      comment
    });

    await updateAverages(reviewType, reviewType === "course" ? courseId : teacherId);

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

exports.getStudentReviews = async (req, res, next) => {
  try {
    const studentId = req.user._id || req.user.id;
    const reviews = await Review.find({ studentId })
      .populate("courseId", "title thumbnail teacher")
      .populate("teacherId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

exports.getReviewableItems = async (req, res, next) => {
  try {
    const studentId = req.user._id || req.user.id;
    const studentProfile = await StudentProfile.findOne({ userId: studentId });
    
    if (!studentProfile) {
      return res.status(200).json({ success: true, data: { courses: [], teachers: [] } });
    }

    // Populate courses to get teacher info
    const courses = await Course.find({ _id: { $in: studentProfile.enrolledCourses } })
      .populate("teacher", "name");

    const teachersMap = new Map();
    courses.forEach(course => {
      if (course.teacher && course.teacher._id) {
        if (!teachersMap.has(course.teacher._id.toString())) {
          teachersMap.set(course.teacher._id.toString(), {
            _id: course.teacher._id,
            name: course.teacher.name,
            coursesTaught: [course.title]
          });
        } else {
          teachersMap.get(course.teacher._id.toString()).coursesTaught.push(course.title);
        }
      }
    });

    res.status(200).json({ 
      success: true, 
      data: { 
        courses, 
        teachers: Array.from(teachersMap.values()) 
      } 
    });
  } catch (error) {
    next(error);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const studentId = req.user._id || req.user.id;
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const review = await Review.findOne({ _id: req.params.id, studentId });
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found or unauthorized" });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    await updateAverages(review.reviewType, review.reviewType === "course" ? review.courseId : review.teacherId);

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const studentId = req.user._id || req.user.id;
    const review = await Review.findOne({ _id: req.params.id, studentId });
    
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found or unauthorized" });
    }

    await review.deleteOne();
    await updateAverages(review.reviewType, review.reviewType === "course" ? review.courseId : review.teacherId);

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    next(error);
  }
};
