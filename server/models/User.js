const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },

    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    // ✅ Track completed lectures by course
    completedLectures: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        lectureIds: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lecture", // useful if you have a Lecture model
          },
        ],
      },
    ],

    // ✅ Track fully completed courses (for certificate)
    completedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  // 1. If password is not modified, skip hashing
  if (!this.isModified("password")) return next();

  // 2. Generate a salt (random string) with 10 rounds
  const salt = await bcrypt.genSalt(10);

  // 3. Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt);

  // 4. Continue saving
  next();
});

// 🔐 Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
