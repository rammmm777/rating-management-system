const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const db = new sqlite3.Database('./rating_system.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    address TEXT,
    role TEXT NOT NULL
  )`, (err) => {
    if (err) {
      console.error('Error creating Users table:', err.message);
    } else {
      console.log('Users table created or already exists');
    }
  });

  // Stores table
  db.run(`CREATE TABLE IF NOT EXISTS Stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    address TEXT,
    owner_id INTEGER,
    FOREIGN KEY (owner_id) REFERENCES Users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('Error creating Stores table:', err.message);
    } else {
      console.log('Stores table created or already exists');
    }
  });

  // Ratings table
  db.run(`CREATE TABLE IF NOT EXISTS Ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    store_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES Stores(id) ON DELETE CASCADE,
    UNIQUE (user_id, store_id)
  )`, (err) => {
    if (err) {
      console.error('Error creating Ratings table:', err.message);
    } else {
      console.log('Ratings table created or already exists');
      
      // Create indexes after table is created
      createIndexes();
    }
  });
}

// Create indexes for better performance
function createIndexes() {
  db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email)', (err) => {
    if (err) console.error('Error creating users email index:', err.message);
    else console.log('Users email index created');
  });
  
  db.run('CREATE INDEX IF NOT EXISTS idx_stores_name ON Stores(name)', (err) => {
    if (err) console.error('Error creating stores name index:', err.message);
    else console.log('Stores name index created');
  });
  
  db.run('CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON Ratings(store_id)', (err) => {
    if (err) console.error('Error creating ratings store_id index:', err.message);
    else console.log('Ratings store_id index created');
  });
  
  console.log('Database tables and indexes initialized.');
}

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Utility functions
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  const re = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
  return re.test(password);
};

const validateName = (name) => {
  return name.length >= 20 && name.length <= 60;
};

// AUTH ROUTES
app.post('/api/auth/signup', [
  body('name').custom(value => {
    if (!validateName(value)) {
      throw new Error('Name must be between 20 and 60 characters');
    }
    return true;
  }),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').custom(value => {
    if (!validatePassword(value)) {
      throw new Error('Password must be 8-16 characters with uppercase and special character');
    }
    return true;
  }),
  body('address').optional().isLength({ max: 400 }).withMessage('Address must be less than 400 characters'),
  validateRequest
], async (req, res) => {
  try {
    const { name, email, password, address } = req.body;
    
    // Check if user already exists
    db.get('SELECT id FROM Users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new user
      db.run('INSERT INTO Users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, address || null, 'user'],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }
          
          const token = jwt.sign(
            { id: this.lastID, email, role: 'user' },
            JWT_SECRET,
            { expiresIn: '24h' }
          );
          
          res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: this.lastID, name, email, role: 'user' }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  validateRequest
], (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM Users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  });
});

app.patch('/api/auth/update-password', [
  authenticateToken,
  body('oldPassword').notEmpty().withMessage('Old password required'),
  body('newPassword').custom(value => {
    if (!validatePassword(value)) {
      throw new Error('Password must be 8-16 characters with uppercase and special character');
    }
    return true;
  }),
  validateRequest
], async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    db.get('SELECT password FROM Users WHERE id = ?', [req.user.id], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        return res.status(401).json({ error: 'Invalid old password' });
      }
      
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      db.run('UPDATE Users SET password = ? WHERE id = ?', [hashedNewPassword, req.user.id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to update password' });
        }
        res.json({ message: 'Password updated successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN ROUTES
app.get('/api/admin/dashboard', [
  authenticateToken,
  authorizeRole(['admin'])
], (req, res) => {
  const queries = [
    'SELECT COUNT(*) as usersCount FROM Users',
    'SELECT COUNT(*) as storesCount FROM Stores',
    'SELECT COUNT(*) as ratingsCount FROM Ratings'
  ];
  
  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.get(query, (err, result) => {
        if (err) reject(err);
        else resolve(Object.values(result)[0]);
      });
    })
  )).then(([usersCount, storesCount, ratingsCount]) => {
    res.json({
      usersCount,
      storesCount,
      ratingsCount
    });
  }).catch(err => {
    res.status(500).json({ error: 'Database error' });
  });
});

app.post('/api/admin/users', [
  authenticateToken,
  authorizeRole(['admin']),
  body('name').custom(value => {
    if (!validateName(value)) {
      throw new Error('Name must be between 20 and 60 characters');
    }
    return true;
  }),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').custom(value => {
    if (!validatePassword(value)) {
      throw new Error('Password must be 8-16 characters with uppercase and special character');
    }
    return true;
  }),
  body('role').isIn(['admin', 'user', 'owner']).withMessage('Invalid role'),
  body('address').optional().isLength({ max: 400 }).withMessage('Address must be less than 400 characters'),
  validateRequest
], async (req, res) => {
  try {
    const { name, email, password, role, address } = req.body;
    
    db.get('SELECT id FROM Users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      db.run('INSERT INTO Users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, address || null, role],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }
          
          res.status(201).json({
            message: 'User created successfully',
            user: { id: this.lastID, name, email, role }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/stores', [
  authenticateToken,
  authorizeRole(['admin'])
], (req, res) => {
  const { name, email, sort } = req.query;
  let query = `
    SELECT s.*, u.name as owner_name, 
           COALESCE(AVG(r.rating), 0) as average_rating
    FROM Stores s
    LEFT JOIN Users u ON s.owner_id = u.id
    LEFT JOIN Ratings r ON s.id = r.store_id
  `;
  
  const conditions = [];
  const params = [];
  
  if (name) {
    conditions.push('s.name LIKE ?');
    params.push(`%${name}%`);
  }
  
  if (email) {
    conditions.push('s.email = ?');
    params.push(email);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' GROUP BY s.id';
  
  if (sort) {
    const [field, order] = sort.split(':');
    const validFields = ['name', 'email', 'average_rating'];
    const validOrders = ['asc', 'desc'];
    
    if (validFields.includes(field) && validOrders.includes(order)) {
      query += ` ORDER BY s.${field} ${order.toUpperCase()}`;
    }
  }
  
  db.all(query, params, (err, stores) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(stores);
  });
});

app.post('/api/admin/stores', [
  authenticateToken,
  authorizeRole(['admin']),
  body('name').custom(value => {
    if (!validateName(value)) {
      throw new Error('Name must be between 20 and 60 characters');
    }
    return true;
  }),
  body('email').isEmail().withMessage('Valid email required'),
  body('address').optional().isLength({ max: 400 }).withMessage('Address must be less than 400 characters'),
  body('owner_id').optional().isInt().withMessage('Owner ID must be an integer'),
  validateRequest
], (req, res) => {
  const { name, email, address, owner_id } = req.body;
  
  db.run('INSERT INTO Stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [name, email, address || null, owner_id || null],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(400).json({ error: 'Store email already exists' });
        }
        return res.status(500).json({ error: 'Failed to create store' });
      }
      
      res.status(201).json({
        message: 'Store created successfully',
        store: { id: this.lastID, name, email }
      });
    }
  );
});

app.get('/api/admin/users', [
  authenticateToken,
  authorizeRole(['admin'])
], (req, res) => {
  const { name, email, role, sort } = req.query;
  let query = 'SELECT id, name, email, address, role FROM Users';
  
  const conditions = [];
  const params = [];
  
  if (name) {
    conditions.push('name LIKE ?');
    params.push(`%${name}%`);
  }
  
  if (email) {
    conditions.push('email = ?');
    params.push(email);
  }
  
  if (role) {
    conditions.push('role = ?');
    params.push(role);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  if (sort) {
    const [field, order] = sort.split(':');
    const validFields = ['name', 'email', 'role'];
    const validOrders = ['asc', 'desc'];
    
    if (validFields.includes(field) && validOrders.includes(order)) {
      query += ` ORDER BY ${field} ${order.toUpperCase()}`;
    }
  }
  
  db.all(query, params, (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(users);
  });
});

app.get('/api/admin/users/:id', [
  authenticateToken,
  authorizeRole(['admin'])
], (req, res) => {
  const userId = req.params.id;
  
  db.get('SELECT id, name, email, address, role FROM Users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If user is an owner, get their store rating
    if (user.role === 'owner') {
      db.get(`
        SELECT s.id as store_id, s.name as store_name, 
               COALESCE(AVG(r.rating), 0) as average_rating,
               COUNT(r.id) as rating_count
        FROM Stores s
        LEFT JOIN Ratings r ON s.id = r.store_id
        WHERE s.owner_id = ?
        GROUP BY s.id
      `, [userId], (err, storeInfo) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        user.storeInfo = storeInfo;
        res.json(user);
      });
    } else {
      res.json(user);
    }
  });
});

// USER ROUTES
app.get('/api/user/stores', [
  authenticateToken,
  authorizeRole(['user'])
], (req, res) => {
  const { name, address } = req.query;
  let query = `
    SELECT s.*, 
           COALESCE(AVG(r.rating), 0) as average_rating,
           ur.rating as user_rating
    FROM Stores s
    LEFT JOIN Ratings r ON s.id = r.store_id
    LEFT JOIN Ratings ur ON s.id = ur.store_id AND ur.user_id = ?
  `;
  
  const conditions = [];
  const params = [req.user.id];
  
  if (name) {
    conditions.push('s.name LIKE ?');
    params.push(`%${name}%`);
  }
  
  if (address) {
    conditions.push('s.address LIKE ?');
    params.push(`%${address}%`);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' GROUP BY s.id ORDER BY s.name';
  
  db.all(query, params, (err, stores) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(stores);
  });
});

app.post('/api/user/ratings', [
  authenticateToken,
  authorizeRole(['user']),
  body('store_id').isInt().withMessage('Store ID must be an integer'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  validateRequest
], (req, res) => {
  const { store_id, rating } = req.body;
  
  // Check if store exists
  db.get('SELECT id FROM Stores WHERE id = ?', [store_id], (err, store) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    // Insert or update rating
    db.run(`
      INSERT OR REPLACE INTO Ratings (user_id, store_id, rating, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `, [req.user.id, store_id, rating], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to submit rating' });
      }
      
      res.json({
        message: 'Rating submitted successfully',
        rating: { user_id: req.user.id, store_id, rating }
      });
    });
  });
});

app.patch('/api/user/ratings/:storeId', [
  authenticateToken,
  authorizeRole(['user']),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  validateRequest
], (req, res) => {
  const storeId = req.params.storeId;
  const { rating } = req.body;
  
  db.run(`
    UPDATE Ratings 
    SET rating = ?, created_at = CURRENT_TIMESTAMP
    WHERE user_id = ? AND store_id = ?
  `, [rating, req.user.id, storeId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update rating' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    
    res.json({
      message: 'Rating updated successfully',
      rating: { user_id: req.user.id, store_id: storeId, rating }
    });
  });
});

// OWNER ROUTES
app.get('/api/owner/dashboard', [
  authenticateToken,
  authorizeRole(['owner'])
], (req, res) => {
  // Get store info for the owner
  db.get(`
    SELECT s.id, s.name, s.email, s.address,
           COALESCE(AVG(r.rating), 0) as average_rating,
           COUNT(r.id) as rating_count
    FROM Stores s
    LEFT JOIN Ratings r ON s.id = r.store_id
    WHERE s.owner_id = ?
    GROUP BY s.id
  `, [req.user.id], (err, storeInfo) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!storeInfo) {
      return res.status(404).json({ error: 'No store found for this owner' });
    }
    
    // Get list of raters
    db.all(`
      SELECT u.id, u.name, u.email, r.rating, r.created_at
      FROM Ratings r
      JOIN Users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [storeInfo.id], (err, raters) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        storeInfo,
        raters
      });
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
