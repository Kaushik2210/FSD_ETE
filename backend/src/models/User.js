import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned by default — must be explicitly .select('+password')
    },
    role: {
      type: String,
      enum: ['student', 'reviewer'],
      default: 'student',
    },
    // Server-side bookmarks. The frontend mirrors these into localStorage so the
    // "My Bookmarks" view renders instantly, then reconciles with the server.
    bookmarkedIdeas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Idea' }],
  },
  { timestamps: true }
);

// Hash on save, but only when the password actually changed — otherwise a
// profile update (e.g. adding a bookmark) would re-hash the existing hash.
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
