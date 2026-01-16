const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./rating_system.db');

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('AdminPass123!', 10);
    
    db.run('INSERT OR REPLACE INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)', 
      ['Administrator User Account Name', 'admin@example.com', hashedPassword, 'admin'],
      function(err) {
        if (err) {
          console.error('Error creating admin:', err.message);
        } else {
          console.log('Admin user created successfully!');
          console.log('Email: admin@example.com');
          console.log('Password: AdminPass123!');
          console.log('Role: admin');
        }
        db.close();
      }
    );
  } catch (error) {
    console.error('Error:', error);
    db.close();
  }
}

createAdmin();
