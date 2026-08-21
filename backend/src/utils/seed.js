import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Idea from '../models/Idea.js';
import { STATUSES } from '../models/Idea.js';

const SAMPLE_USERS = [
  { name: 'Asha Patel', email: 'asha@campus.edu', password: 'Password123', role: 'reviewer' },
  { name: 'Rohan Mehta', email: 'rohan@campus.edu', password: 'Password123' },
  { name: 'Priya Nair', email: 'priya@campus.edu', password: 'Password123' },
  { name: 'Karan Singh', email: 'karan@campus.edu', password: 'Password123' },
];

const TITLES = [
  ['Smart Canteen Queue Predictor', 'Sustainability', ['React', 'Node.js', 'MongoDB']],
  ['Peer-to-Peer Textbook Exchange', 'Education', ['React Native', 'Firebase']],
  ['Campus Mental Health Companion', 'Health', ['Flutter', 'Python', 'TensorFlow']],
  ['Solar-Powered Charging Benches', 'Sustainability', ['IoT', 'Arduino']],
  ['Lost & Found AI Matcher', 'Technology', ['Python', 'OpenCV', 'FastAPI']],
  ['Accessible Route Mapper for Campus', 'Infrastructure', ['React', 'Mapbox']],
  ['Late-Night Safety Escort App', 'Safety', ['React Native', 'Node.js', 'Socket.io']],
  ['Automated Attendance via QR', 'Technology', ['Node.js', 'React', 'MongoDB']],
  ['Water Usage Dashboard for Hostels', 'Sustainability', ['Vue', 'D3.js']],
  ['Anonymous Grievance Portal', 'Safety', ['Express', 'MongoDB', 'JWT']],
  ['Skill-Swap Marketplace for Students', 'Education', ['Next.js', 'PostgreSQL']],
  ['Real-Time Bus Tracker for Shuttle', 'Infrastructure', ['React', 'WebSocket']],
];

const seed = async () => {
  await connectDB();
  console.log('Clearing existing ideas and users...');
  await Promise.all([Idea.deleteMany({}), User.deleteMany({})]);

  console.log('Creating users...');
  const users = [];
  for (const u of SAMPLE_USERS) users.push(await User.create(u));

  console.log('Creating ideas...');
  for (let i = 0; i < TITLES.length; i++) {
    const [title, domain, technologies] = TITLES[i];
    const author = users[i % users.length];
    const status = STATUSES[i % STATUSES.length];
    const voters = users.filter((u) => u._id.toString() !== author._id.toString()).slice(0, (i % 3) + 1);

    await Idea.create({
      title,
      problemStatement:
        `Many students on campus face recurring friction related to ${title.toLowerCase()}. ` +
        'This idea proposes a practical, low-cost solution built by students, for students, ' +
        'validated through direct feedback from hostel residents and department coordinators.',
      domain,
      technologies,
      expectedImpact: `Reduces daily friction for an estimated 500+ students and staff, saving time and resources.`,
      status,
      submittedBy: author._id,
      votedBy: voters.map((v) => v._id),
      voteCount: voters.length,
    });
  }

  console.log(`Seeded ${users.length} users and ${TITLES.length} ideas.`);
  console.log('Sample login: asha@campus.edu / Password123 (reviewer)');
  console.log('Sample login: rohan@campus.edu / Password123 (student)');

  await disconnectDB();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
