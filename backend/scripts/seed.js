const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const {
  Student,
  Faculty,
  Course,
  Attendance,
  Assignment,
  Result,
  Event,
  Notification,
  ActivityLog
} = require('../models');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data generators
const departments = ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EE'];
const cities = ['Delhi', 'Ghaziabad', 'Noida', 'Faridabad', 'Gurgaon', 'Mumbai', 'Bangalore', 'Pune'];
const skills = ['Python', 'Java', 'C++', 'JavaScript', 'MongoDB', 'React', 'Node.js', 'Machine Learning', 'Data Science', 'Android', 'iOS', 'DevOps'];
const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rohan', 'Pooja', 'Arjun', 'Neha', 'Karan', 'Shruti', 'Aditya', 'Kavya', 'Siddharth', 'Riya'];
const lastNames = ['Sharma', 'Kumar', 'Singh', 'Patel', 'Verma', 'Gupta', 'Reddy', 'Joshi', 'Mehta', 'Agarwal'];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomSkills = () => {
  const count = getRandomNumber(3, 6);
  const selected = [];
  for (let i = 0; i < count; i++) {
    const skill = getRandomElement(skills);
    if (!selected.includes(skill)) {
      selected.push(skill);
    }
  }
  return selected;
};

// Create Faculty
const createFaculty = async () => {
  const facultyData = [
    {
      facultyId: 'FAC001',
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@campus.edu',
      password: 'password123',
      department: 'CSE',
      designation: 'Professor',
      specialization: 'Database Management Systems',
      experience: 15,
      contact: {
        phone: '9876543210',
        officeRoom: 'A-301',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh'
      },
      qualifications: [
        { degree: 'Ph.D', field: 'Computer Science', institution: 'IIT Delhi', year: 2008 },
        { degree: 'M.Tech', field: 'Computer Science', institution: 'IIT Kanpur', year: 2003 }
      ],
      subjects: ['Database Management Systems', 'Advanced DBMS', 'Data Warehousing'],
      isActive: true
    },
    {
      facultyId: 'FAC002',
      name: 'Prof. Sunita Sharma',
      email: 'sunita.sharma@campus.edu',
      password: 'password123',
      department: 'CSE',
      designation: 'Associate Professor',
      specialization: 'Machine Learning',
      experience: 10,
      contact: {
        phone: '9876543211',
        officeRoom: 'A-302',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh'
      },
      qualifications: [
        { degree: 'Ph.D', field: 'Artificial Intelligence', institution: 'IIT Bombay', year: 2013 }
      ],
      subjects: ['Machine Learning', 'Artificial Intelligence', 'Deep Learning'],
      isActive: true
    },
    {
      facultyId: 'FAC003',
      name: 'Dr. Amit Verma',
      email: 'amit.verma@campus.edu',
      password: 'password123',
      department: 'ECE',
      designation: 'Professor',
      specialization: 'Digital Electronics',
      experience: 18,
      contact: {
        phone: '9876543212',
        officeRoom: 'B-201',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh'
      },
      qualifications: [
        { degree: 'Ph.D', field: 'Electronics', institution: 'NIT Trichy', year: 2005 }
      ],
      subjects: ['Digital Electronics', 'VLSI Design', 'Microprocessors'],
      isActive: true
    }
  ];

  const faculty = await Faculty.insertMany(facultyData);
  console.log(`✅ Created ${faculty.length} faculty members`);
  return faculty;
};

// Create Courses
const createCourses = async (faculty) => {
  const coursesData = [
    {
      courseId: 'CS301',
      courseName: 'Advanced Database Management Systems',
      courseCode: 'CSE301',
      department: 'CSE',
      semester: 5,
      credits: 4,
      faculty: faculty[0]._id,
      facultyName: faculty[0].name,
      topics: [
        { name: 'NoSQL Databases', hours: 10, completed: true },
        { name: 'MongoDB', hours: 15, completed: true },
        { name: 'Aggregation Framework', hours: 8, completed: false },
        { name: 'Indexing', hours: 6, completed: false }
      ],
      schedule: [
        { day: 'Monday', startTime: '09:00', endTime: '10:00', room: 'A-101' },
        { day: 'Wednesday', startTime: '11:00', endTime: '12:00', room: 'A-101' }
      ],
      enrolledStudents: [],
      maxCapacity: 60,
      courseType: 'Theory',
      description: 'Advanced concepts in database management including NoSQL, distributed databases, and modern data management techniques.',
      academicYear: '2023-24',
      isActive: true
    },
    {
      courseId: 'CS302',
      courseName: 'Machine Learning',
      courseCode: 'CSE302',
      department: 'CSE',
      semester: 5,
      credits: 4,
      faculty: faculty[1]._id,
      facultyName: faculty[1].name,
      topics: [
        { name: 'Supervised Learning', hours: 12, completed: true },
        { name: 'Neural Networks', hours: 10, completed: false }
      ],
      schedule: [
        { day: 'Tuesday', startTime: '10:00', endTime: '11:00', room: 'A-102' },
        { day: 'Thursday', startTime: '10:00', endTime: '11:00', room: 'A-102' }
      ],
      enrolledStudents: [],
      maxCapacity: 60,
      courseType: 'Theory + Lab',
      description: 'Introduction to machine learning algorithms and applications.',
      academicYear: '2023-24',
      isActive: true
    },
    {
      courseId: 'EC301',
      courseName: 'Digital Electronics',
      courseCode: 'ECE301',
      department: 'ECE',
      semester: 3,
      credits: 4,
      faculty: faculty[2]._id,
      facultyName: faculty[2].name,
      topics: [
        { name: 'Boolean Algebra', hours: 8, completed: true },
        { name: 'Logic Gates', hours: 10, completed: true }
      ],
      schedule: [
        { day: 'Monday', startTime: '14:00', endTime: '15:00', room: 'B-101' }
      ],
      enrolledStudents: [],
      maxCapacity: 60,
      courseType: 'Theory',
      description: 'Fundamentals of digital electronics and logic design.',
      academicYear: '2023-24',
      isActive: true
    }
  ];

  const courses = await Course.insertMany(coursesData);
  console.log(`✅ Created ${courses.length} courses`);
  return courses;
};

// Create Students
const createStudents = async (courses) => {
  const students = [];
  
  for (let i = 1; i <= 100; i++) {
    const dept = getRandomElement(departments);
    const semester = getRandomNumber(1, 8);
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const name = `${firstName} ${lastName}`;
    const studentId = `${dept}2023${String(i).padStart(3, '0')}`;
    
    // Select courses for this department and semester
    const deptCourses = courses.filter(c => c.department === dept && c.semester === semester);
    const enrolledCourses = deptCourses.slice(0, getRandomNumber(2, Math.min(4, deptCourses.length)));
    
    const student = {
      studentId,
      name,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@student.campus.edu`,
      password: 'password123',
      department: dept,
      semester,
      cgpa: (Math.random() * 4 + 6).toFixed(2), // CGPA between 6 and 10
      dateOfBirth: new Date(2000 + getRandomNumber(0, 5), getRandomNumber(0, 11), getRandomNumber(1, 28)),
      admissionDate: new Date(2023, 6, 15),
      isActive: true,
      skills: getRandomSkills(),
      enrolledCourses: enrolledCourses.map(c => c._id),
      contact: {
        phone: `98765${String(43210 + i).slice(-5)}`,
        city: getRandomElement(cities),
        state: 'Uttar Pradesh',
        pincode: `201${String(getRandomNumber(100, 999))}`,
        address: {
          street: `Street ${getRandomNumber(1, 50)}`,
          area: `Area ${getRandomNumber(1, 20)}`
        }
      },
      attendance: enrolledCourses.map(c => ({
        courseId: c._id,
        courseName: c.courseName,
        totalClasses: getRandomNumber(30, 50),
        attendedClasses: 0, // Will be calculated
        percentage: 0 // Will be calculated
      })),
      guardian: {
        name: `Mr. ${lastName}`,
        relation: 'Father',
        phone: `99999${String(10000 + i).slice(-5)}`,
        occupation: getRandomElement(['Business', 'Service', 'Government', 'Private'])
      }
    };
    
    // Calculate attended classes and percentage
    student.attendance.forEach(att => {
      att.attendedClasses = Math.floor(att.totalClasses * (0.65 + Math.random() * 0.30)); // 65-95% attendance
      att.percentage = ((att.attendedClasses / att.totalClasses) * 100).toFixed(2);
    });
    
    students.push(student);
  }
  
  const createdStudents = await Student.insertMany(students);
  console.log(`✅ Created ${createdStudents.length} students`);
  
  // Update courses with enrolled students
  for (const course of courses) {
    const enrolledStudents = createdStudents
      .filter(s => s.enrolledCourses.some(ec => ec.equals(course._id)))
      .map(s => s._id);
    
    course.enrolledStudents = enrolledStudents;
    await course.save();
  }
  
  console.log(`✅ Updated courses with enrolled students`);
  return createdStudents;
};

// Create Attendance Records
const createAttendance = async (students, courses) => {
  const attendanceRecords = [];
  const today = new Date();
  
  for (let i = 0; i < 200; i++) {
    const course = getRandomElement(courses);
    const date = new Date(today);
    date.setDate(date.getDate() - getRandomNumber(0, 90)); // Last 90 days
    
    const enrolledStudents = students.filter(s => 
      s.enrolledCourses.some(ec => ec.equals(course._id))
    );
    
    if (enrolledStudents.length === 0) continue;
    
    const studentAttendance = enrolledStudents.map(student => ({
      studentId: student._id,
      studentName: student.name,
      studentRollNo: student.studentId,
      status: Math.random() > 0.2 ? 'Present' : (Math.random() > 0.5 ? 'Absent' : 'Late'),
      remarks: ''
    }));
    
    attendanceRecords.push({
      course: course._id,
      courseName: course.courseName,
      date,
      faculty: course.faculty,
      semester: course.semester,
      department: course.department,
      students: studentAttendance,
      classType: getRandomElement(['Lecture', 'Lab', 'Tutorial']),
      topic: `Topic ${getRandomNumber(1, 20)}`
    });
  }
  
  const createdAttendance = await Attendance.insertMany(attendanceRecords);
  console.log(`✅ Created ${createdAttendance.length} attendance records`);
  return createdAttendance;
};

// Create Results
const createResults = async (students, courses) => {
  const results = [];
  
  for (const student of students) {
    for (const courseId of student.enrolledCourses) {
      const course = courses.find(c => c._id.equals(courseId));
      if (!course) continue;
      
      const theoryObtained = getRandomNumber(40, 95);
      const internalObtained = getRandomNumber(15, 25);
      
      results.push({
        student: student._id,
        studentName: student.name,
        studentRollNo: student.studentId,
        course: course._id,
        courseName: course.courseName,
        courseCode: course.courseCode,
        department: student.department,
        semester: student.semester,
        academicYear: '2023-24',
        examinationType: 'End-Term',
        marks: {
          theory: {
            obtained: theoryObtained,
            total: 100
          },
          internal: {
            obtained: internalObtained,
            total: 25
          }
        },
        credits: course.credits,
        isPublished: true
      });
    }
  }
  
  const createdResults = await Result.insertMany(results);
  console.log(`✅ Created ${createdResults.length} results`);
  return createdResults;
};

// Create Events
const createEvents = async () => {
  const categories = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition'];
  const today = new Date();
  const events = [];
  
  const eventNames = [
    'Tech Fest 2024',
    'Hackathon',
    'Cultural Night',
    'Sports Day',
    'AI Workshop',
    'Web Development Bootcamp',
    'Annual Function',
    'Coding Competition',
    'Dance Competition',
    'Photography Exhibition'
  ];
  
  for (let i = 0; i < 30; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + getRandomNumber(-30, 60)); // Past 30 days to next 60 days
    
    const category = getRandomElement(categories);
    const title = getRandomElement(eventNames);
    
    events.push({
      title: `${title} ${i + 1}`,
      description: `Join us for an exciting ${category.toLowerCase()} event. This is a great opportunity to showcase your talents and learn new skills.`,
      category,
      eventDate,
      startTime: '10:00 AM',
      endTime: '05:00 PM',
      venue: `Auditorium ${String.fromCharCode(65 + getRandomNumber(0, 3))}`,
      department: getRandomElement([...departments, 'All']),
      organizer: {
        name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
        contact: `98765${String(getRandomNumber(10000, 99999))}`,
        email: 'organizer@campus.edu'
      },
      participants: [],
      maxParticipants: getRandomNumber(50, 200),
      registrationDeadline: new Date(eventDate.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days before
      isRegistrationOpen: eventDate > today,
      tags: [category.toLowerCase(), 'campus', 'event'],
      status: eventDate > today ? 'Upcoming' : (eventDate.toDateString() === today.toDateString() ? 'Ongoing' : 'Completed'),
      isActive: true
    });
  }
  
  const createdEvents = await Event.insertMany(events);
  console.log(`✅ Created ${createdEvents.length} events`);
  return createdEvents;
};

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('\n🌱 Starting database seeding...\n');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Student.deleteMany({}),
      Faculty.deleteMany({}),
      Course.deleteMany({}),
      Attendance.deleteMany({}),
      Assignment.deleteMany({}),
      Result.deleteMany({}),
      Event.deleteMany({}),
      Notification.deleteMany({}),
      ActivityLog.deleteMany({})
    ]);
    console.log('✅ Existing data cleared\n');
    
    // Create data
    const faculty = await createFaculty();
    const courses = await createCourses(faculty);
    const students = await createStudents(courses);
    const attendance = await createAttendance(students, courses);
    const results = await createResults(students, courses);
    const events = await createEvents();
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Faculty: ${faculty.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Attendance Records: ${attendance.length}`);
    console.log(`   - Results: ${results.length}`);
    console.log(`   - Events: ${events.length}`);
    
    console.log('\n✨ You can now start the server with: npm run dev\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
