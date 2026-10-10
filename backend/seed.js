require('dotenv').config();

const mongoose = require('mongoose');

const User = require('./models/User');
const TrainingSession = require('./models/TrainingSession');
const Incident = require('./models/Incident');

// Seed demo users and data (idempotent, development only)
const seedData = async () => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    console.log('Running in production mode - only seeding real admin account from environment variables');
  } else {
    console.log('Note: Seed running in development mode. Demo accounts will be created if env vars not set.');
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI ||
        'mongodb://localhost:27017/athena'
    );

    console.log('MongoDB connected');

    // --------------------------------------------------
    // PRODUCTION: Only seed real admin account from env vars
    // --------------------------------------------------

    if (isProduction) {
      // In production, only create admin if env vars are set
      if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.ADMIN_NAME) {
        let admin = await User.findOne({
          email: process.env.ADMIN_EMAIL.toLowerCase()
        });

        if (!admin) {
          admin = new User({
            name: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL.toLowerCase(),
            password: process.env.ADMIN_PASSWORD,
            role: 'ADMIN',
            isActive: true
          });
          await admin.save();
          console.log('Created production admin account');
        } else {
          console.log('Admin account already exists');
        }
      } else {
        console.log('ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME must be set in production');
        process.exit(1);
      }

      console.log('\n=================================');
      console.log('       PRODUCTION SEED COMPLETE');
      console.log('=================================');
      process.exit(0);
    }

    // --------------------------------------------------
    // DEVELOPMENT: Demo users
    // --------------------------------------------------

    const demoUsers = [
      {
        email: process.env.ADMIN_EMAIL || 'admin@athena.demo',
        name: process.env.ADMIN_NAME || 'Athena Administrator',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'ADMIN'
      },
      {
        email: process.env.COACH_EMAIL || 'chitti.coach@gmail.com',
        name: process.env.COACH_NAME || 'Chitti Coach',
        password: process.env.COACH_PASSWORD || 'Coach@123',
        role: 'COACH'
      },
      {
        email: process.env.ATHLETE_EMAIL || 'chitti.athlete@gmail.com',
        name: process.env.ATHLETE_NAME || 'Chitti Athlete',
        password: process.env.ATHLETE_PASSWORD || 'Athlete@123',
        role: 'ATHLETE'
      }
    ];

    const createdUsers = {};

    // --------------------------------------------------
    // CREATE / UPDATE USERS
    // --------------------------------------------------

    for (const userData of demoUsers) {
      let user = await User.findOne({
        email: userData.email.toLowerCase()
      });

      if (!user) {
        // Create new user
        user = new User({
          name: userData.name,
          email: userData.email.toLowerCase(),
          password: userData.password,
          role: userData.role,
          isActive: true
        });
        await user.save();

        console.log(
          `Created user (${user.role})`
        );
      } else {
        // Update existing user without creating duplicate
        user.name = userData.name;
        user.role = userData.role;
        user.password = userData.password;
        user.isActive = true;

        await user.save();

        console.log(
          `Updated user (${user.role})`
        );
      }

      createdUsers[user.email] = user;
    }

    // --------------------------------------------------
    // FIX ADMIN ROLE
    // --------------------------------------------------

    const adminUser = await User.findOne({
      email: (process.env.ADMIN_EMAIL || 'admin@athena.demo').toLowerCase()
    });

    if (adminUser) {
      if (adminUser.role !== 'ADMIN') {
        adminUser.role = 'ADMIN';
        await adminUser.save();

        console.log('Fixed admin role to ADMIN');
      }
    }

    // --------------------------------------------------
    // FIX COACH ROLE
    // --------------------------------------------------

    const coachUser = await User.findOne({
      email: (process.env.COACH_EMAIL || 'chitti.coach@gmail.com').toLowerCase()
    });

    if (coachUser) {
      if (coachUser.role !== 'COACH') {
        coachUser.role = 'COACH';
        await coachUser.save();

        console.log('Fixed coach role to COACH');
      }
    }

    // --------------------------------------------------
    // GET ATHLETE
    // --------------------------------------------------

    const athlete1 = await User.findOne({
      email: (process.env.ATHLETE_EMAIL || 'chitti.athlete@gmail.com').toLowerCase()
    });

    // --------------------------------------------------
    // ASSIGN ATHLETE TO COACH
    // --------------------------------------------------

    if (coachUser && athlete1) {
      athlete1.assignedCoach = coachUser._id;

      await athlete1.save();

      if (!coachUser.assignedAthletes) {
        coachUser.assignedAthletes = [];
      }

      const athlete1AlreadyAssigned =
        coachUser.assignedAthletes.some(
          (id) => id.toString() === athlete1._id.toString()
        );

      if (!athlete1AlreadyAssigned) {
        coachUser.assignedAthletes.push(athlete1._id);
      }

      await coachUser.save();

      console.log(
        'Assigned athlete to coach'
      );
    }

    // --------------------------------------------------
    // CREATE SAMPLE TRAINING SESSION
    // --------------------------------------------------

    if (coachUser) {
      const tomorrow = new Date();

      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const sessionData = {
        date: tomorrow,
        startTime: '10:00',
        duration: 90,
        sport: 'Football',
        intensity: 'High',
        numberOfAthletes: 15,
        temperature: 32,
        humidity: 65,
        weatherCondition: 'Sunny',
        riskLevel: 'MODERATE',
        recommendation: 'MODIFY',
        decision: 'MODIFY',
        createdBy: coachUser._id
      };

      await TrainingSession.findOneAndUpdate(
        {
          date: sessionData.date,
          createdBy: sessionData.createdBy
        },
        sessionData,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

      console.log('Created/updated sample training session');
    }

    // --------------------------------------------------
    // CREATE SAMPLE INCIDENT
    // --------------------------------------------------

    if (athlete1) {
      const incidentData = {
        date: new Date(),
        time: '10:30',
        sport: 'Football',
        numberAffected: 1,
        symptoms: ['Dizziness', 'Nausea'],
        temperature: 35,
        humidity: 70,
        trainingDuration: 60,
        trainingIntensity: 'High',
        actionTaken:
          'Stopped training, moved to shade, provided water',
        medicalAssistance: false,
        outcome: 'Athlete recovered after rest',
        notes:
          'Athlete reported symptoms after 45 minutes of training',
        reportedBy: athlete1._id
      };

      await Incident.create(incidentData);

      console.log('Created sample incident');
    }

    // --------------------------------------------------
    // COMPLETE
    // --------------------------------------------------

    console.log('\n=================================');
    console.log('       SEED COMPLETE');
    console.log('=================================');

    console.log('\nDemo accounts ready:');
    console.log('Admin account created/verified');
    console.log('Coach account created/verified');
    console.log('Athlete account created/verified');

    console.log('\nAssignments:');
    console.log('Coach has 1 assigned athlete');

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error('\nError seeding database:');
    console.error(error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

seedData();